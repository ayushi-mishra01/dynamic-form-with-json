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
    const [currentTable, setCurrentTable] = useState('');
    const [childTable, setChildTable] = useState([]);
    const [childTableFields, setChildTableFields] = useState([]);
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
            const fields = await Promise.all(response.data.map(async (field, index) => {
                const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
                const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
                var inputTypeDef = field.inputType || 'Textbox';
                const name = field.name.charAt(0).toLowerCase() + field.name.slice(1);
       
                let value;
                if (field.value) {
                    value = field.value;
                } else if (inputTypeDef === "Static dropdown") {
                    value = '0-Male,1-Female';
                } else if (inputTypeDef === "Dynamic dropdown") {
                    value = `${primaryKeyOfForeignKeyTable}-columnName`;
                } else if (inputTypeDef === "Radio group") {
                    value = '0-Male,1-Female';
                }else {
                    value = '-';
                }
 
                return {
                    name: name,
                    clrTypeName: field.clrTypeName,
                    isNullable: field.isNullable,
                    isPrimaryKey: field.isPrimaryKey,
                    foreignKeys: field.foreignKeys,
                    foreignKeyTable: foreignKeyTable,
                    primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
                    dataType: extractDataType(field.clrTypeName),
                    inputType: inputTypeDef,
                    value: value,
                    displayName: field.displayName || field.name,
                    rowNumber: field.rowNumber || index + 1,
                    sequence: field.sequence || 1,
                    visibility: field.visibility || 'Visible',
                    enability: field.enability || 'Enabled',
                };
            }));
            setTableFields(fields);
            setWindowOpen(true);
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };
 
    const getChildTables = async (currentTableName) => {
        try {
            const response = await axios.get(`${local_url}/getAllEntities`);
            const childTables = response.data.filter(table => table !== currentTableName);
            setChildTable(childTables);
        } catch (error) {
            console.error('Error fetching child tables:', error);
        }
    };
 
    const getTableFieldsForChild = async (tableName) => {
        try {
            const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
            const fields = await Promise.all(response.data.map(async (field, index) => {
                const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
                const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
                var inputTypeDef = field.inputType || 'Textbox';
                const name = field.name.charAt(0).toLowerCase() + field.name.slice(1);
       
                let value;
                if (field.value) {
                    value = field.value;
                } else if (inputTypeDef === "Static dropdown") {
                    value = '0-Male,1-Female';
                } else if (inputTypeDef === "Dynamic dropdown") {
                    value = `${primaryKeyOfForeignKeyTable}-columnName`;
                } else if (inputTypeDef === "Radio group") {
                    value = '0-Male,1-Female';
                }else {
                    value = '-';
                }
 
                return {
                    name:name,
                    clrTypeName: field.clrTypeName,
                    isNullable: field.isNullable,
                    isPrimaryKey: field.isPrimaryKey,
                    foreignKeys: field.foreignKeys,
                    foreignKeyTable: foreignKeyTable,
                    primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
                    dataType: extractDataType(field.clrTypeName),
                    inputType: inputTypeDef,
                    value: value,
                    displayName: field.displayName || field.name,
                    rowNumber: field.rowNumber || index + 1,
                    sequence: field.sequence || 1,
                    visibility: field.visibility || 'Visible',
                    enability: field.enability || 'Enabled',
                };
            }));
            return { tableName, fields };
        } catch (error) {
            console.error('Error fetching fields for child table:', error);
            return { tableName, fields: [] };
        }
    };
 
    const handleDropDownClick = (tableName) => () => {
        getTableFields(tableName);
        setCurrentTable(tableName);
        getChildTables(tableName);
    };
 
    const handleWindowClose = () => {
        setWindowOpen(false);
        document.body.classList.remove('modal-open');
        setChildTableFields([]);
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
        const processedTableFields = processStaticDropdownValues();
        const json = JSON.stringify({
            mainTableFields: processedTableFields,
            childTableFields: childTableFields
        });
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, 'tableFieldData.json');
        handleWindowClose();
        navigate(`/table/${currentTable}`);
    };
 
        const handleInputTypeChange = (index, value, primaryKeyOfForeignKeyTable) => {
        const newTableFields = [...tableFields];
        newTableFields[index].inputType = value;
 
        switch (value) {
            case 'Dynamic dropdown':
                newTableFields[index].value = `${primaryKeyOfForeignKeyTable}-columnName`;
                break;
            case 'Static dropdown':
            case 'Radio group':
            case 'Radio button':
                newTableFields[index].value = '0-Male,1-Female';
                break;
            default:
                newTableFields[index].value = '-';
                break;
        }

        
        setTableFields(newTableFields);
    };

    const handleChildInputTypeChange = (index, value, primaryKeyOfForeignKeyTable) => {
        const newTableFields = [...childTableFields.fields]; // Access fields array here
    
        newTableFields[index].inputType = value;
    
        switch (value) {
            case 'Dynamic dropdown':
                newTableFields[index].value = `${primaryKeyOfForeignKeyTable}-columnName`;
                break;
            case 'Static dropdown':
            case 'Radio group':
            case 'Radio button':
                newTableFields[index].value = '0-Male,1-Female';
                break;
            default:
                newTableFields[index].value = '-';
                break;
        }
    
        setChildTableFields({ ...childTableFields, fields: newTableFields }); // Update fields array in the state object
    };
    
 
    const handleDisplayNameChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].displayName = value;
        setTableFields(newTableFields);
    };

    const handleChildDisplayNameChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
    
        newChildTableFields[index].displayName = value; 
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields }); 
    };
    
 
    const handleRowNumChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].rowNumber = value;
        setTableFields(newTableFields);
    };

    const handleChildRowNumChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
    
        newChildTableFields[index].rowNumber = value; 
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields });
    };
    
 
    const handleSequenceChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].sequence = value;
        setTableFields(newTableFields);
    };

    const handleChildSequenceChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
    
        newChildTableFields[index].sequence = value; 
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields }); 
    };
    
 
    const handleVisibilityChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].visibility = value;
        setTableFields(newTableFields);
    };    
   
    const handleChildVisibilityChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
    
        newChildTableFields[index].visibility = value; 
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields }); 
    };
    
    const handleValuesChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].value = value;
        setTableFields(newTableFields);
    };

    const handleChildValuesChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
        newChildTableFields[index].value = value; 
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields }); 
    };
     
    const handleEnabilityChange = (index, value) => {
        const newTableFields = [...tableFields];
        newTableFields[index].enability = value;
        setTableFields(newTableFields);
    };

    const handleChildEnabilityChange = (index, value) => {
        const newChildTableFields = [...childTableFields.fields]; 
    
        newChildTableFields[index].enability = value;
    
        setChildTableFields({ ...childTableFields, fields: newChildTableFields }); 
    };
    
 
    const handleChildTableChange = async (index, value) => {
        try {
            const childFields = await getTableFieldsForChild(value);
            setChildTableFields(childFields);
            const newTableFields = [...tableFields];
            newTableFields[index].childTable = value;
            setTableFields(newTableFields);
        } catch (error) {
            console.error('Error handling child table change:', error);
        }
    };
 
    // const processStaticDropdownValues = () => {
    //     const processedTableFields = tableFields.map(field => {
    //         if (['Static dropdown', 'Checkbox', 'Radio Group', 'Radio Button', 'Dynamic Dropdown'].includes(field.inputType)) {
    //             const keyValuePairs = field.value.split(',').map(pair => pair.split(':').map(item => item.trim()));
    //             const updatedValue = keyValuePairs.reduce((acc, [key, val], i) => {
    //                 acc[`key${i + 1}`] = key;
    //                 acc[`value${i + 1}`] = val;
    //                 return acc;
    //             }, {});
    //             return { ...field, value: updatedValue };
    //         }
    //         return field;
    //     });
    //     return processedTableFields;
    // };

    const processStaticDropdownValues = () => {
        const processedTableFields = tableFields.map(field => {
          if (['Static dropdown', 'Checkbox', 'Radio group', 'Radio button'].includes(field.inputType)) {
            const keyValuePairs = field.value.split(',').map(pair => pair.split('-').map(item => item.trim()));
            const updatedValue = keyValuePairs.reduce((acc, [key, val], i) => {
              acc[key] = val;
              return acc;
            }, {});
            return { ...field, value: updatedValue };
          }
          return field;
        });
        return processedTableFields;
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
                                    <th>Child Table</th>
                                    <th>Input Type</th>
                                    <th>Values</th>
                                    <th>Display Name</th>
                                    <th>Row Number</th>
                                    <th>Sequence</th>
                                    <th>Visibility</th>
                                    <th>Enabled</th>
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
                                            <select className='dropdownStyle' value={field.childTable || '--'} onChange={(e) => handleChildTableChange(index, e.target.value)}>
                                                <option value="--">--</option>
                                                {childTable.map((table, index) => (
                                                    <option key={index} value={table}>{table}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleInputTypeChange(index, e.target.value, field.primaryKeyOfForeignKeyTable)}>
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
                                            <input
                                                type="text"
                                                value={field.value}
                                                className='textboxStyle'
                                                onChange={(e) => handleValuesChange(index, e.target.value)}
                                            />
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
                                        <td>
                                            <div className="radioGroup">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.enability === 'Enabled'}
                                                        onChange={(e) => handleEnabilityChange(index, e.target.checked ? 'Enabled' : 'Disabled')}
                                                    />
                                                    Enabled
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {childTableFields && childTableFields.fields && childTableFields.fields.length > 0 && (
                        <div className='modal-body'>
                            <h3>{childTableFields.tableName}</h3>
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
                                        <th>Enabled</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {childTableFields.fields.map((field, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{field.name}</td>
                                            <td>{field.dataType}</td>
                                            <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
                                            <td>{field.foreignKeyTable}</td>
                                            <td>{field.primaryKeyOfForeignKeyTable}</td>
                                            <td>
                                                <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleChildInputTypeChange(index, e.target.value, field.primaryKeyOfForeignKeyTable)}>
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
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    className='textboxStyle'
                                                    onChange={(e) => handleChildValuesChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={field.displayName}
                                                    className='textboxStyle'
                                                    onChange={(e) => handleChildDisplayNameChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={field.rowNumber}
                                                    className='textboxNumStyle'
                                                    onChange={(e) => handleChildRowNumChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={field.sequence}
                                                    className='textboxNumStyle'
                                                    onChange={(e) => handleChildSequenceChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className="radioGroup">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.visibility === 'Visible'}
                                                            onChange={(e) => handleChildVisibilityChange(index, e.target.checked ? 'Visible' : 'Hidden')}
                                                        />
                                                        Visible
                                                    </label>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="radioGroup">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.enability === 'Enabled'}
                                                            onChange={(e) => handleChildEnabilityChange(index, e.target.checked ? 'Enabled' : 'Disabled')}
                                                        />
                                                        Enabled
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
            <Footer />
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
//     const [currentTable, setCurrentTable] = useState('');
//     const [childTable, setChildTable] = useState([]);
//     const [childTableFields, setChildTableFields] = useState([]);
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
//             const fields = await Promise.all(response.data.map(async (field, index) => {
//                 const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
//                 const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
//                 var inputTypeDef = field.inputType || 'Textbox';
        
        
//                 let value;
//                 if (field.value) {
//                     value = field.value;
//                 } else if (inputTypeDef === "Static dropdown") {
//                     value = '0-Male,1-Female';
//                 } else if (inputTypeDef === "Dynamic dropdown") {
//                     value = `${primaryKeyOfForeignKeyTable}-columnName`;
//                 } else if (inputTypeDef === "Radio group") {
//                     value = '0-Male,1-Female';
//                 }else {
//                     value = '-';
//                 }

//                 return {
//                     name: field.name,
//                     clrTypeName: field.clrTypeName,
//                     isNullable: field.isNullable,
//                     isPrimaryKey: field.isPrimaryKey,
//                     foreignKeys: field.foreignKeys,
//                     foreignKeyTable: foreignKeyTable,
//                     primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
//                     dataType: extractDataType(field.clrTypeName),
//                     inputType: inputTypeDef,
//                     value: value,
//                     displayName: field.displayName || field.name,
//                     rowNumber: field.rowNumber || index + 1,
//                     sequence: field.sequence || 1,
//                     visibility: field.visibility || 'Visible',
//                     enability: field.enability || 'Enabled',
//                 };
//             }));
//             setTableFields(fields);
//             setWindowOpen(true);
//             document.body.classList.add('modal-open');
//         } catch (error) {
//             console.error('Error fetching fields:', error);
//         }
//     };
 
//     const getChildTables = async (currentTableName) => {
//         try {
//             const response = await axios.get(`${local_url}/getAllEntities`);
//             const childTables = response.data.filter(table => table !== currentTableName);
//             setChildTable(childTables);
//         } catch (error) {
//             console.error('Error fetching child tables:', error);
//         }
//     };
 
//     const getTableFieldsForChild = async (tableName) => {
//         try {
//             const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
//             const fields = response.data.map(field => ({
//                 tableName: tableName,
//                 name: field.name,
//                 clrTypeName: field.clrTypeName,
//                 isNullable: field.isNullable,
//                 foreignKeys: field.foreignKeys,
//                 foreignKeyTable: field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-',
//                 primaryKeyOfForeignKeyTable: '-',
//                 dataType: extractDataType(field.clrTypeName),
//             }));
//             return fields;
//         } catch (error) {
//             console.error('Error fetching fields for child table:', error);
//             return [];
//         }
//     };
 
//     const handleDropDownClick = (tableName) => () => {
//         getTableFields(tableName);
//         setCurrentTable(tableName);
//         getChildTables(tableName);
//     };
 
//     const handleWindowClose = () => {
//         setWindowOpen(false);
//         document.body.classList.remove('modal-open');
//         setChildTableFields([]);
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
//         const processedTableFields = processStaticDropdownValues();
//         const json = JSON.stringify({
//             mainTableFields: processedTableFields,
//             childTableFields: childTableFields
//         });
//         const blob = new Blob([json], { type: 'application/json' });
//         saveAs(blob, 'tableFieldData.json');
//         handleWindowClose();
//         navigate(`/table/${currentTable}`);
//     };

//         const handleInputTypeChange = (index, value, primaryKeyOfForeignKeyTable) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].inputType = value;

//         switch (value) {
//             case 'Dynamic dropdown':
//                 newTableFields[index].value = `${primaryKeyOfForeignKeyTable}-columnName`;
//                 break;
//             case 'Static dropdown':
//             case 'Radio group':
//             case 'Radio button':
//                 newTableFields[index].value = '0-Male,1-Female';
//                 break;
//             default:
//                 newTableFields[index].value = '-';
//                 break;
//         }

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
   
//     const handleEnabilityChange = (index, value) => {
//         const newTableFields = [...tableFields];
//         newTableFields[index].enability = value;
//         setTableFields(newTableFields);
//     };
 
//     const handleChildTableChange = async (index, value) => {
//         try {
//             const childFields = await getTableFieldsForChild(value);
//             setChildTableFields(childFields);
//             // Update tableFields with childTable value
//             const newTableFields = [...tableFields];
//             newTableFields[index].childTable = value;
//             setTableFields(newTableFields);
//         } catch (error) {
//             console.error('Error handling child table change:', error);
//         }
//     };    

//     const processStaticDropdownValues = () => {
//         const processedTableFields = tableFields.map(field => {
//           if (['Static dropdown', 'Checkbox', 'Radio group', 'Radio button'].includes(field.inputType)) {
//             const keyValuePairs = field.value.split(',').map(pair => pair.split('-').map(item => item.trim()));
//             const updatedValue = keyValuePairs.reduce((acc, [key, val], i) => {
//               acc[key] = val;
//               return acc;
//             }, {});
//             return { ...field, value: updatedValue };
//           }
//           return field;
//         });
//         return processedTableFields;
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
//             <Header Heading="Entity List" />
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
//                 <div className='modal-container' ref={modalRef}>
//                     <div className='modal-header'>
//                         <span className="close-btn" onClick={handleWindowClose}>&times;</span>
//                         <h2>Table Fields</h2>
//                     </div>
//                     <div className='modal-body'>
//                         <table className="table">
//                             <thead>
//                                 <tr>
//                                     <th>SNo.</th>
//                                     <th>Field Name</th>
//                                     <th>Data Type</th>
//                                     <th>FK</th>
//                                     <th>FK Table</th>
//                                     <th>PK of Foreign Key Table</th>
//                                     <th>Child Table</th>
//                                     <th>Input Type</th>
//                                     <th>Values</th>
//                                     <th>Display Name</th>
//                                     <th>Row Number</th>
//                                     <th>Sequence</th>
//                                     <th>Visibility</th>
//                                     <th>Enabled</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {tableFields.map((field, index) => (
//                                     <tr key={index}>
//                                         <td>{index + 1}</td>
//                                         <td>{field.name}</td>
//                                         <td>{field.dataType}</td>
//                                         <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
//                                         <td>{field.foreignKeyTable}</td>
//                                         <td>{field.primaryKeyOfForeignKeyTable}</td>
//                                         <td>
//                                             <select className='dropdownStyle' value={field.childTable || '--'} onChange={(e) => handleChildTableChange(index, e.target.value)}>
//                                                 <option value="--">--</option>
//                                                 {childTable.map((table, index) => (
//                                                     <option key={index} value={table}>{table}</option>
//                                                 ))}
//                                             </select>
//                                         </td>
//                                         <td>
//                                             <select className='dropdownStyle' value={field.inputType} onChange={(e) => handleInputTypeChange(index, e.target.value, field.primaryKeyOfForeignKeyTable)}>
//                                                 <option value="--">--</option>
//                                                 <option value="Static dropdown">Static dropdown</option>
//                                                 <option value="Textbox">Textbox</option>
//                                                 <option value="Dynamic dropdown">Dynamic dropdown</option>
//                                                 <option value="Checkbox">Checkbox</option>
//                                                 <option value="Radio button">Radio button</option>
//                                                 <option value="Radio group">Radio group</option>
//                                                 <option value="Password">Password</option>
//                                                 <option value="Number">Number</option>
//                                                 <option value="Email">Email</option>
//                                             </select>
//                                         </td>
//                                         <td>
//                                             <input
//                                                 type="text"
//                                                 value={field.value}
//                                                 className='textboxStyle'
//                                                 onChange={(e) => handleValuesChange(index, e.target.value)}
//                                             />
//                                         </td>
 
//                                         <td>
//                                             <input
//                                                 type="text"
//                                                 value={field.displayName}
//                                                 className='textboxStyle'
//                                                 onChange={(e) => handleDisplayNameChange(index, e.target.value)}
//                                             />
//                                         </td>
//                                         <td>
//                                             <input
//                                                 type="number"
//                                                 value={field.rowNumber}
//                                                 className='textboxNumStyle'
//                                                 onChange={(e) => handleRowNumChange(index, e.target.value)}
//                                             />
//                                         </td>
//                                         <td>
//                                             <input
//                                                 type="number"
//                                                 value={field.sequence}
//                                                 className='textboxNumStyle'
//                                                 onChange={(e) => handleSequenceChange(index, e.target.value)}
//                                             />
//                                         </td>
//                                         <td>
//                                             <div className="radioGroup">
//                                                 <label>
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={field.visibility === 'Visible'}
//                                                         onChange={(e) => handleVisibilityChange(index, e.target.checked ? 'Visible' : 'Hidden')}
//                                                     />
//                                                     Visible
//                                                 </label>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className="radioGroup">
//                                                 <label>
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={field.enability === 'Enabled'}
//                                                         onChange={(e) => handleEnabilityChange(index, e.target.checked ? 'Enabled' : 'Disabled')}
//                                                     />
//                                                     Enabled
//                                                 </label>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <div className='modal-body'>
//                         {childTableFields && childTableFields.length > 0 && (
//                             <table className="table">
//                                 <thead>
//                                     <tr>
//                                         <th>SNo.</th>
//                                         <th>Field Name</th>
//                                         <th>Data Type</th>
//                                         <th>FK</th>
//                                         <th>FK Table</th>
//                                         <th>PK of Foreign Key Table</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {childTableFields.map((field, index) => (
//                                         <tr key={index}>
//                                             <td>{index + 1}</td>
//                                             <td>{field.name}</td>
//                                             <td>{field.dataType}</td>
//                                             <td>{field.foreignKeys.length > 0 ? 'Yes' : 'No'}</td>
//                                             <td>{field.foreignKeyTable}</td>
//                                             <td>{field.primaryKeyOfForeignKeyTable}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                     <div className='modal-footer'>
//                         <button className='custom-btn custom-btn-primary' onClick={handleExport}>
//                             <FileDownloadIcon />
//                         </button>
//                         <button className='custom-btn custom-btn-secondary-close' onClick={handleWindowClose}>
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             )}
//             <Footer />
//         </div>
//     );
// };
 
// export default Entities;