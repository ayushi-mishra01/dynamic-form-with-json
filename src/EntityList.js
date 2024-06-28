import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Header from './Header';
import Footer from './Footer';
import { local_url } from './Urls';
import axios from 'axios';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
 
const Entities = () => {
    const [data, setData] = useState([]);
    const [windowOpen, setWindowOpen] = useState(false);
    const [tableFields, setTableFields] = useState([]);
    const [currentTable, setCurrentTable] = useState([]);
    const navigate = useNavigate();
    const modalRef = useRef(null);
 
    useEffect(() => {
        getData();
    }, []);
 
    const getData = async () => {
        try {
            const response = await axios.get(`${local_url}/getAllEntities`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };
 
    const getTableFields = async (tableName) => {
        try {
            const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
            const fields = await Promise.all(response.data.map(async (field) => {
                const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
                const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
   
                return {
                    name: field.name,
                    clrTypeName: field.clrTypeName,
                    isNullable: field.isNullable,
                    foreignKeys: field.foreignKeys,
                    foreignKeyTable: foreignKeyTable,
                    primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
                    dataType: extractDataType(field.clrTypeName),
                    inputType: field.inputType || 'Textbox',
                    value: field.value || '0',
                    displayName: field.displayName || field.name,
                    rowNumber: field.rowNumber || 1,
                    sequence: field.sequence || 1,
                    visibility: field.visibility || 'Visible'
                };
            }));
            setTableFields(fields);
            setWindowOpen(true);
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };
 
    const handleDropDownClick = (tableName) => () => {
        getTableFields(tableName);
        setCurrentTable(tableName);
    };
 
    const handleWindowClose = () => {
        setWindowOpen(false);
        document.body.classList.remove('modal-open');
    };
 
    const extractDataType = (clrTypeName) => {
        const parts = clrTypeName.split(',');
        const basicType = parts[0].trim();
 
        const typeParts = basicType.split('.');
        return typeParts[typeParts.length - 1];
    };
 
    const fetchPrimaryKeyName = async (tableName) => {
        try {
            const response = await axios.get(`${local_url}/GetEntityDynamicPrimaryKey/${tableName}`);
            if (response.data.length > 0) {
                return response.data[0].PrimaryKeyName;
            }
            return '-';
        } catch (error) {
            console.error(`Error fetching primary key for table ${tableName}:`, error);
            return '-';
        }
    };
 
    const handleExport = () => {
        const json = JSON.stringify(tableFields, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, 'tableFieldData.json');
        handleWindowClose();
        navigate(`/table/${currentTable}`);
    };
 
        const handleInputTypeChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].inputType = value;
        setTableFields(newTableFields);
    };
 
    const handleDisplayNameChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].displayName = value;
        setTableFields(newTableFields);
    };
 
    const handleRowNumChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].rowNumber = value;
        setTableFields(newTableFields);
    };
 
    const handleSequenceChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].sequence = value;
        setTableFields(newTableFields);
    };
 
    const handleVisibilityChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].visibility = value;
        setTableFields(newTableFields);
    };    
   
    const handleValuesChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].value = value;
        setTableFields(newTableFields);
    };
   
 
    const handleClickOutside = useCallback((event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            handleWindowClose();
        }
    }, [modalRef]);
 
    useEffect(() => {
        if (windowOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [windowOpen, handleClickOutside]);
 
 
    return (
        <div className='body'>
           <Header Heading="Entity List" />
            <div className="entity-list">
                {data.map((item, index) => (
                    <div key={index} className="entity-item">
                        <div className="text-container">{item}</div>
                        <div className='crud-icon' onClick={() => navigate(`/table/${item}`)}>
                            <MoreHorizOutlinedIcon />
                        </div>
                        <ArrowDropDownIcon className='dropdown-icon' onClick={handleDropDownClick(item)} />
                    </div>
                ))}
            </div>
            {windowOpen && (
                 <div className='modal-container' ref={modalRef}>
                 <div className='modal-header'>
                     <span className="close-btn" onClick={handleWindowClose}>&times;</span>
                     <h2>Table Fields</h2>
                 </div>
                 <div className='modal-body'>
                     <table className="table">
                         <thead>
                             <tr>
                                 <th>SNo.</th>
                                 <th>Field Name</th>
                                 <th>Data Type</th>
                                 <th>FK</th>
                                 <th>FK Table</th>
                                 <th>PK of Foreign Key Table</th>
                                 <th>Input Type</th>
                                 <th>Values</th>
                                 <th>Display Name</th>
                                 <th>Row Number</th>
                                 <th>Sequence</th>
                                 <th>Visibility</th>
                             </tr>
                         </thead>
                         <tbody>
                             {tableFields.map((field, index) => (
                                 <tr key={index}>
                                     <td>{index + 1}</td>
                                     <td>{field.name}</td>
                                     <td>{field.dataType}</td>
                                     <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
                                     <td>{field.foreignKeyTable}</td>
                                     <td>{field.primaryKeyOfForeignKeyTable}</td>
                                     <td>
                                         <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleInputTypeChange(index, e.target.value)}>
                                             <option value="--">--</option>
                                             <option value="Static dropdown">Static dropdown</option>
                                             <option value="Textbox">Textbox</option>
                                             <option value="Dynamic dropdown">Dynamic dropdown</option>
                                             <option value="Checkbox">Checkbox</option>
                                             <option value="Radio button">Radio button</option>
                                             <option value="Radio group">Radio group</option>
                                             <option value="Password">Password</option>
                                             <option value="Number">Number</option>
                                             <option value="Email">Email</option>
                                         </select>
                                     </td>
                                     <td>
                                        {(field.inputType === 'Static dropdown' || field.inputType === 'Email' || field.inputType === 'Dynamic dropdown' || field.inputType === 'Number') && (
                                            <div className="radioGroup">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="0"
                                                        checked={field.value === '0'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    Initiate
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="1"
                                                        checked={field.value === '1'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    Send
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="2"
                                                        checked={field.value === '2'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    Acknowledge
                                                </label>
                                            </div>
                                        )}
                                        {(field.inputType === 'Textbox' || field.inputType === 'Password') && (
                                            <div className="radioGroup">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="0"
                                                        checked={field.value === '0'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    Numeric
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="1"
                                                        checked={field.value === '1'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    String
                                                </label>
                                            </div>
                                        )}
                                        {(field.inputType === 'Radio button' || field.inputType === 'Radio group' || field.inputType === 'Checkbox') && (
                                            <div className="radioGroup">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="0"
                                                        checked={field.value === '0'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    True
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        value="1"
                                                        checked={field.value === '1'}
                                                        onChange={(e) => handleValuesChange(index, e.target.value)}
                                                    />
                                                    False
                                                </label>
                                            </div>
                                        )}
                                        {/* Add similar conditions for other input types */}
                                    </td>
 
                                     <td>
                                         <input
                                             type="text"
                                             value={field.displayName}
                                             className='textboxStyle'
                                             onChange={(e) => handleDisplayNameChange(index, e.target.value)}
                                         />
                                     </td>
                                     <td>
                                         <input
                                             type="number"
                                             value={field.rowNumber}
                                             className='textboxNumStyle'
                                             onChange={(e) => handleRowNumChange(index, e.target.value)}
                                         />
                                     </td>
                                     <td>
                                         <input
                                             type="number"
                                             value={field.sequence}
                                             className='textboxNumStyle'
                                             onChange={(e) => handleSequenceChange(index, e.target.value)}
                                         />
                                     </td>
                                     <td>
                                     <div className="radioGroup">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={field.visibility === 'Visible'}
                                                onChange={(e) => handleVisibilityChange(index, e.target.checked ? 'Visible' : 'Hidden')}
                                            />
                                            Visible
                                        </label>
                                    </div>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 <div className='modal-footer'>
                     <button className='custom-btn custom-btn-primary' onClick={handleExport}>
                         <FileDownloadIcon />
                     </button>
                     <button className='custom-btn custom-btn-secondary-close' onClick={handleWindowClose}>
                         Close
                     </button>
                 </div>
             </div>
            )}
            <Footer/>
        </div>
    );
};
 
export default Entities;


// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
// import Header from './Header';
// import Footer from './Footer';
// import { local_url } from './Urls';
// import axios from 'axios';
// import { saveAs } from 'file-saver';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
 
// const Entities = () => {
//     const [data, setData] = useState([]);
//     const [windowOpen, setWindowOpen] = useState(false);
//     const [tableFields, setTableFields] = useState([]);
//     const [currentTable, setCurrentTable] = useState([]);
//     const navigate = useNavigate();
//     const modalRef = useRef(null);
 
//     useEffect(() => {
//         getData();
//     }, []);
 
//     const getData = async () => {
//         try {
//             const response = await axios.get(`${local_url}/getAllEntities`);
//             setData(response.data);
//         } catch (error) {
//             console.error('Error fetching tables:', error);
//         }
//     };
 
//     const getTableFields = async (tableName) => {
//         try {
//             const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
//             const fields = await Promise.all(response.data.map(async (field) => {
//                 const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
//                 const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
   
//                 return {
//                     name: field.name,
//                     clrTypeName: field.clrTypeName,
//                     isNullable: field.isNullable,
//                     foreignKeys: field.foreignKeys,
//                     foreignKeyTable: foreignKeyTable,
//                     primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
//                     dataType: extractDataType(field.clrTypeName),
//                     inputType: field.inputType || 'Textbox',
//                     value: field.value || '0',
//                     displayName: field.displayName || field.name,
//                     rowNumber: field.rowNumber || 1,
//                     sequence: field.sequence || 1,
//                     visibility: field.visibility || 'Visible'
//                 };
//             }));
//             setTableFields(fields);
//             setWindowOpen(true);
//             document.body.classList.add('modal-open');
//         } catch (error) {
//             console.error('Error fetching fields:', error);
//         }
//     };
 
//     const handleDropDownClick = (tableName) => () => {
//         getTableFields(tableName);
//         setCurrentTable(tableName);
//     };
 
//     const handleWindowClose = () => {
//         setWindowOpen(false);
//         document.body.classList.remove('modal-open');
//     };
 
//     const extractDataType = (clrTypeName) => {
//         const parts = clrTypeName.split(',');
//         const basicType = parts[0].trim();
 
//         const typeParts = basicType.split('.');
//         return typeParts[typeParts.length - 1];
//     };
 
//     const fetchPrimaryKeyName = async (tableName) => {
//         try {
//             const response = await axios.get(`${local_url}/GetEntityDynamicPrimaryKey/${tableName}`);
//             if (response.data.length > 0) {
//                 return response.data[0].PrimaryKeyName;
//             }
//             return '-';
//         } catch (error) {
//             console.error(`Error fetching primary key for table ${tableName}:`, error);
//             return '-';
//         }
//     };
 
//     const handleExport = () => {
//         const json = JSON.stringify(tableFields, null, 2);
//         const blob = new Blob([json], { type: 'application/json' });
//         saveAs(blob, 'tableFieldData.json');
//         handleWindowClose();
//         navigate(`/table/${currentTable}`);
//     };
 
//         const handleInputTypeChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].inputType = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleDisplayNameChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].displayName = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleRowNumChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].rowNumber = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleSequenceChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].sequence = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleVisibilityChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].visibility = value;
//         setTableFields(newTableFields);
//     };
//     const handleValuesChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].value = value;
//         setTableFields(newTableFields);
//     };
   
 
//     const handleClickOutside = useCallback((event) => {
//         if (modalRef.current && !modalRef.current.contains(event.target)) {
//             handleWindowClose();
//         }
//     }, [modalRef]);
 
//     useEffect(() => {
//         if (windowOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [windowOpen, handleClickOutside]);
 
 
//     return (
//         <div className='body'>
//            <Header Heading="Entity List" />
//             <div className="entity-list">
//                 {data.map((item, index) => (
//                     <div key={index} className="entity-item">
//                         <div className="text-container">{item}</div>
//                         <div className='crud-icon' onClick={() => navigate(`/table/${item}`)}>
//                             <MoreHorizOutlinedIcon />
//                         </div>
//                         <ArrowDropDownIcon className='dropdown-icon' onClick={handleDropDownClick(item)} />
//                     </div>
//                 ))}
//             </div>
//             {windowOpen && (
//                  <div className='modal-container' ref={modalRef}>
//                  <div className='modal-header'>
//                      <span className="close-btn" onClick={handleWindowClose}>&times;</span>
//                      <h2>Table Fields</h2>
//                  </div>
//                  <div className='modal-body'>
//                      <table className="table">
//                          <thead>
//                              <tr>
//                                  <th>SNo.</th>
//                                  <th>Field Name</th>
//                                  <th>Data Type</th>
//                                  <th>FK</th>
//                                  <th>FK Table</th>
//                                  <th>PK of Foreign Key Table</th>
//                                  <th>Input Type</th>
//                                  <th>Values</th>
//                                  <th>Display Name</th>
//                                  <th>Row Number</th>
//                                  <th>Sequence</th>
//                                  <th>Visibility</th>
//                              </tr>
//                          </thead>
//                          <tbody>
//                              {tableFields.map((field, index) => (
//                                  <tr key={index}>
//                                      <td>{index + 1}</td>
//                                      <td>{field.name}</td>
//                                      <td>{field.dataType}</td>
//                                      <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
//                                      <td>{field.foreignKeyTable}</td>
//                                      <td>{field.primaryKeyOfForeignKeyTable}</td>
//                                      <td>
//                                          <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleInputTypeChange(index, e.target.value)}>
//                                              <option value="--">--</option>
//                                              <option value="Static dropdown">Static dropdown</option>
//                                              <option value="Textbox">Textbox</option>
//                                              <option value="Dynamic dropdown">Dynamic dropdown</option>
//                                              <option value="Checkbox">Checkbox</option>
//                                              <option value="Radio button">Radio button</option>
//                                              <option value="Radio group">Radio group</option>
//                                              <option value="Password">Password</option>
//                                              <option value="Number">Number</option>
//                                              <option value="Email">Email</option>
//                                          </select>
//                                      </td>
//                                      <td>
//                                         {(field.inputType === 'Static dropdown' || field.inputType === 'Email' || field.inputType === 'Dynamic dropdown' || field.inputType === 'Number') && (
//                                             <div className="radioGroup">
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="0"
//                                                         checked={field.value === '0'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     Initiate
//                                                 </label>
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="1"
//                                                         checked={field.value === '1'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     Send
//                                                 </label>
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="2"
//                                                         checked={field.value === '2'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     Acknowledge
//                                                 </label>
//                                             </div>
//                                         )}
//                                         {(field.inputType === 'Textbox' || field.inputType === 'Password') && (
//                                             <div className="radioGroup">
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="0"
//                                                         checked={field.value === '0'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     Numeric
//                                                 </label>
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="1"
//                                                         checked={field.value === '1'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     String
//                                                 </label>
//                                             </div>
//                                         )}
//                                         {(field.inputType === 'Radio button' || field.inputType === 'Radio group' || field.inputType === 'Checkbox') && (
//                                             <div className="radioGroup">
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="0"
//                                                         checked={field.value === '0'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     True
//                                                 </label>
//                                                 <label>
//                                                     <input
//                                                         type="radio"
//                                                         value="1"
//                                                         checked={field.value === '1'}
//                                                         onChange={(e) => handleValuesChange(index, e.target.value)}
//                                                     />
//                                                     False
//                                                 </label>
//                                             </div>
//                                         )}
//                                         {/* Add similar conditions for other input types */}
//                                     </td>
 
//                                      <td>
//                                          <input
//                                              type="text"
//                                              value={field.displayName}
//                                              className='textboxStyle'
//                                              onChange={(e) => handleDisplayNameChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <input
//                                              type="number"
//                                              value={field.rowNumber}
//                                              className='textboxNumStyle'
//                                              onChange={(e) => handleRowNumChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <input
//                                              type="number"
//                                              value={field.sequence}
//                                              className='textboxNumStyle'
//                                              onChange={(e) => handleSequenceChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <div className="radioGroup">
//                                              <label>
//                                                  <input
//                                                      type="radio"
//                                                      value="Visible"
//                                                      checked={field.visibility === 'Visible'}
//                                                      onChange={(e) => handleVisibilityChange(index, e.target.value)}
//                                                  />
//                                                  Visible
//                                              </label>
//                                              <label>
//                                                  <input
//                                                      type="radio"
//                                                      value="Hidden"
//                                                      checked={field.visibility === 'Hidden'}
//                                                      onChange={(e) => handleVisibilityChange(index, e.target.value)}
//                                                  />
//                                                  Hidden
//                                              </label>
//                                          </div>
//                                      </td>
//                                  </tr>
//                              ))}
//                          </tbody>
//                      </table>
//                  </div>
//                  <div className='modal-footer'>
//                      <button className='custom-btn custom-btn-primary' onClick={handleExport}>
//                          <FileDownloadIcon />
//                      </button>
//                      <button className='custom-btn custom-btn-secondary-close' onClick={handleWindowClose}>
//                          Close
//                      </button>
//                  </div>
//              </div>
//             )}
//             <Footer/>
//         </div>
//     );
// };
 
// export default Entities;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
// import Header from './Header';
// import Footer from './Footer';
// import { local_url } from './Urls';
// import axios from 'axios';
// import { saveAs } from 'file-saver';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
 
// const Entities = () => {
//     const [data, setData] = useState([]);
//     const [windowOpen, setWindowOpen] = useState(false);
//     const [tableFields, setTableFields] = useState([]);
//     const [currentTable, setCurrentTable] = useState([]);
//     const navigate = useNavigate();
//     const modalRef = useRef(null);
 
//     useEffect(() => {
//         getData();
//     }, []);
 
//     const getData = async () => {
//         try {
//             const response = await axios.get(`${local_url}/getAllEntities`);
//             setData(response.data);
//         } catch (error) {
//             console.error('Error fetching tables:', error);
//         }
//     };
 
//     const getTableFields = async (tableName) => {
//         try {
//             const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
//             const fields = await Promise.all(response.data.map(async (field) => {
//                 const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
//                 const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
   
//                 return {
//                     name: field.name,
//                     clrTypeName: field.clrTypeName,
//                     isNullable: field.isNullable,
//                     foreignKeys: field.foreignKeys,
//                     foreignKeyTable: foreignKeyTable,
//                     primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
//                     dataType: extractDataType(field.clrTypeName),
//                     inputType: field.inputType || 'Textbox',
//                     displayName: field.displayName || field.name,
//                     rowNumber: field.rowNumber || 1,
//                     sequence: field.sequence || 1,
//                     visibility: field.visibility || 'Visible'
//                 };
//             }));
//             setTableFields(fields);
//             setWindowOpen(true);
//             document.body.classList.add('modal-open');
//         } catch (error) {
//             console.error('Error fetching fields:', error);
//         }
//     };
 
//     const handleDropDownClick = (tableName) => () => {
//         getTableFields(tableName);
//         setCurrentTable(tableName);
//     };
 
//     const handleWindowClose = () => {
//         setWindowOpen(false);
//         document.body.classList.remove('modal-open');
//     };
 
//     const extractDataType = (clrTypeName) => {
//         const parts = clrTypeName.split(',');
//         const basicType = parts[0].trim();
 
//         const typeParts = basicType.split('.');
//         return typeParts[typeParts.length - 1];
//     };
 
//     const fetchPrimaryKeyName = async (tableName) => {
//         try {
//             const response = await axios.get(`${local_url}/GetEntityDynamicPrimaryKey/${tableName}`);
//             if (response.data.length > 0) {
//                 return response.data[0].PrimaryKeyName;
//             }
//             return '-';
//         } catch (error) {
//             console.error(`Error fetching primary key for table ${tableName}:`, error);
//             return '-';
//         }
//     };
 
//     const handleExport = () => {
//         const json = JSON.stringify(tableFields, null, 2);
//         const blob = new Blob([json], { type: 'application/json' });
//         saveAs(blob, 'tableFieldData.json');
//         handleWindowClose();
//         navigate(`/table/${currentTable}`);
//     };
 
//         const handleInputTypeChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].inputType = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleDisplayNameChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].displayName = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleRowNumChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].rowNumber = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleSequenceChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].sequence = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleVisibilityChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].visibility = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleClickOutside = useCallback((event) => {
//         if (modalRef.current && !modalRef.current.contains(event.target)) {
//             handleWindowClose();
//         }
//     }, [modalRef]);
 
//     useEffect(() => {
//         if (windowOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [windowOpen, handleClickOutside]);
 
 
//     return (
//         <div className='body'>
//            <Header Heading="Entity List" />
//             <div className="entity-list">
//                 {data.map((item, index) => (
//                     <div key={index} className="entity-item">
//                         <div className="text-container">{item}</div>
//                         <div className='crud-icon' onClick={() => navigate(`/table/${item}`)}>
//                             <MoreHorizOutlinedIcon />
//                         </div>
//                         <ArrowDropDownIcon className='dropdown-icon' onClick={handleDropDownClick(item)} />
//                     </div>
//                 ))}
//             </div>
//             {windowOpen && (
//                  <div className='modal-container' ref={modalRef}>
//                  <div className='modal-header'>
//                      <span className="close-btn" onClick={handleWindowClose}>&times;</span>
//                      <h2>Table Fields</h2>
//                  </div>
//                  <div className='modal-body'>
//                      <table className="table">
//                          <thead>
//                              <tr>
//                                  <th>SNo.</th>
//                                  <th>Field Name</th>
//                                  <th>Data Type</th>
//                                  <th>FK</th>
//                                  <th>FK Table</th>
//                                  <th>PK of Foreign Key Table</th>
//                                  <th>Input Type</th>
//                                  <th>Display Name</th>
//                                  <th>Row Number</th>
//                                  <th>Sequence</th>
//                                  <th>Visibility</th>
//                              </tr>
//                          </thead>
//                          <tbody>
//                              {tableFields.map((field, index) => (
//                                  <tr key={index}>
//                                      <td>{index + 1}</td>
//                                      <td>{field.name}</td>
//                                      <td>{field.dataType}</td>
//                                      <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
//                                      <td>{field.foreignKeyTable}</td>
//                                      <td>{field.primaryKeyOfForeignKeyTable}</td>
//                                      <td>
//                                          <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleInputTypeChange(index, e.target.value)}>
//                                              <option value="Static dropdown">--</option>
//                                              <option value="Static dropdown">Static dropdown</option>
//                                              <option value="Textbox">Textbox</option>
//                                              <option value="Dynamic dropdown">Dynamic dropdown</option>
//                                              <option value="Checkbox">Checkbox</option>
//                                              <option value="Radio button">Radio button</option>
//                                              <option value="Radio group">Radio group</option>
//                                              <option value="Password">Password</option>
//                                              <option value="Number">Number</option>
//                                              <option value="Email">Email</option>
//                                          </select>
//                                      </td>
//                                      <td>
//                                          <input
//                                              type="text"
//                                              value={field.displayName}
//                                              className='textboxStyle'
//                                              onChange={(e) => handleDisplayNameChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <input
//                                              type="number"
//                                              value={field.rowNumber}
//                                              className='textboxNumStyle'
//                                              onChange={(e) => handleRowNumChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <input
//                                              type="number"
//                                              value={field.sequence}
//                                              className='textboxNumStyle'
//                                              onChange={(e) => handleSequenceChange(index, e.target.value)}
//                                          />
//                                      </td>
//                                      <td>
//                                          <div className="radioGroup">
//                                              <label>
//                                                  <input
//                                                      type="radio"
//                                                      value="Visible"
//                                                      checked={field.visibility === 'Visible'}
//                                                      onChange={(e) => handleVisibilityChange(index, e.target.value)}
//                                                  />
//                                                  Visible
//                                              </label>
//                                              <label>
//                                                  <input
//                                                      type="radio"
//                                                      value="Hidden"
//                                                      checked={field.visibility === 'Hidden'}
//                                                      onChange={(e) => handleVisibilityChange(index, e.target.value)}
//                                                  />
//                                                  Hidden
//                                              </label>
//                                          </div>
//                                      </td>
//                                  </tr>
//                              ))}
//                          </tbody>
//                      </table>
//                  </div>
//                  <div className='modal-footer'>
//                      <button className='custom-btn custom-btn-primary' onClick={handleExport}>
//                          <FileDownloadIcon />
//                      </button>
//                      <button className='custom-btn custom-btn-secondary-close' onClick={handleWindowClose}>
//                          Close
//                      </button>
//                  </div>
//              </div>
//             )}
//             <Footer/>
//         </div>
//     );
// };
 
// export default Entities;