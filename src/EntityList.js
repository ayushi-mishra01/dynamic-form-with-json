import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import { local_url } from './Urls';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Entities = () => {
    const [data, setData] = useState([]);
    const [windowOpen, setWindowOpen] = useState(false);
    const [tableFields, setTableFields] = useState([]);
    const [currentTable, setCurrentTable] = useState([]);
    const navigate = useNavigate();
    const modalRef = useRef();

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await axios.get(`${local_url}/getAllEntities`);
            setData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const getTableFields = async (tableName) => {
        try {
            const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
            console.log(response.data);
            const fields = await Promise.all(response.data.map(async (field) => {
                const foreignKeyTable = field.foreignKeys.length > 0 ? field.foreignKeys[0].principalTable : '-';
                const primaryKeyOfForeignKeyTable = foreignKeyTable !== '-' ? await fetchPrimaryKeyName(foreignKeyTable) : '-';
    
                return {
                    name: field.name,
                    // clrTypeName: field.clrTypeName,
                    // isNullable: field.isNullable,
                    // isPrimaryKey: field.isPrimaryKey,
                    foreignKeys: field.foreignKeys,
                    foreignKeyTable: foreignKeyTable,
                    primaryKeyOfForeignKeyTable: primaryKeyOfForeignKeyTable,
                    dataType: extractDataType(field.clrTypeName),
                    inputType: field.inputType,
                    displayName : field.displayName,
                    rowNumber: field.rowNumber,
                    sequence: field.sequence,
                    visibility: field.visibility
                };
            }));
            setTableFields(fields);
            console.log(fields);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    // const handleMoreHorizClick = (item) => {
    //     navigate(`/table/${item}`);
    // };

    const handleDropDownClick = (tableName) => () => {
        console.log(tableName);
        getTableFields(tableName);
        setCurrentTable(tableName);
        setWindowOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleWindowClose = () => {
        setWindowOpen(false);
        document.body.classList.remove('modal-open');
    };

    const extractDataType = (clrTypeName) => {
        const parts = clrTypeName.split(',');
        const basicType = parts[0].trim();

        const typeParts = basicType.split('.');
        const dataType = typeParts[typeParts.length - 1]; 

        return dataType;
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

    const handleExport = (currentTable) => {
        const json = JSON.stringify(tableFields, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, 'tableFieldData.json');
        //navigate(`/table/${currentTable}`);
        handleWindowClose();
        navigate('/display');
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

    return (
        <>
            <Header Heading="Entity List" />
            <div className="entity-list">
                {data.map((item, index) => (
                    <div key={index} className="entity-item">
                        <div className="text-container">{item}</div>
                        {/* <div className='crud-icon' onClick={handleMoreHorizClick(item)}><MoreHorizOutlinedIcon /></div> */}
                        <ArrowDropDownIcon className='dropdown-icon' onClick={handleDropDownClick(item)} />
                    </div>
                ))}
            </div>
            <div>
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
                                                    <option value="Static dropdown">--</option>
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
                                                            type="radio"
                                                            value="Visible"
                                                            checked={field.visibility === 'Visible'}
                                                            onChange={(e) => handleVisibilityChange(index, e.target.value)}
                                                        />
                                                        Visible
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="Hidden"
                                                            checked={field.visibility === 'Hidden'}
                                                            onChange={(e) => handleVisibilityChange(index, e.target.value)}
                                                        />
                                                        Hidden
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
            </div>
            <Footer />
        </>
    );
};

export default Entities;
