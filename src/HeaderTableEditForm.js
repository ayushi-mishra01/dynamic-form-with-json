import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { local_url } from './Urls';
import fieldData from './tableFieldData.json';
import './style.css';
import Header from './Header';
import Footer from './Footer';
import { TextField, MenuItem, Checkbox } from '@mui/material';
import Validation from './Validation';

const HeaderTableEditForm = () => {
    const navigate = useNavigate();
    const { tableName, id } = useParams();

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [dynamicDropdownOptions, setDynamicDropdownOptions] = useState({});
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (id) {
            axios.get(`${local_url}/GetEntityById/${tableName}/${id}`)
                .then(response => {
                    console.log(response);
                    const recordToEdit = response.data;
                    console.log(recordToEdit);
                    if (!recordToEdit) {
                        console.error(`Record with id ${id} not found.`);
                        return;
                    }

                    const initialFormData = {};
                    fieldData.childTableFields.fields.forEach(field => {
                        initialFormData[field.name] = recordToEdit[field.name];
                    });
                    //console.log(initialFormData);
                    setFormData(initialFormData);
                    console.log(formData);
                })
                .catch(error => {
                    console.error('Error fetching data for editing:', error);
                });
        } else {
            const initialFormData = {};
            fieldData.childTableFields.fields.forEach(field => {
                initialFormData[field.name] = '';
                if (field.isPrimaryKey && (field.dataType==='Int32' || field.dataType==='Int62')) {
                    initialFormData[field.name] = 0;
            }
            });
            setFormData(initialFormData);
        }

        setFields(fieldData.childTableFields.fields);
        //console.log(fieldData.childTableFields.fields)
    }, [tableName, id]);

    useEffect(() => {
        fields.forEach(field => {
            if (field.inputType === 'Dynamic dropdown') {
                fetchDynamicDropdownOptions(field, field.foreignKeyTable);
            }
        });
    }, [fields]);

    const handleChange = async (e) => {
        await setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const fetchDynamicDropdownOptions = async (field, foreignKeyTable) => {
        const { value } = field;
        const [idColumnName, nameColumnName] = value.split('-');
        try {
            const response = await axios.get(`http://localhost:7050/api/Dynamic/${foreignKeyTable}`);
            const options = response.data.reduce((acc, item) => {
                acc[item[idColumnName]] = item[nameColumnName];
                return acc;
            }, {});
            setDynamicDropdownOptions(prevOptions => ({
                ...prevOptions,
                [field.name]: options
            }));
        } catch (error) {
            console.error('Error fetching dynamic dropdown options:', error);
        }
    };

    const renderField = (field) => {
       // console.log(formData);
        const { name, inputType, displayName, visibility, enability } = field;

        if (visibility !== 'Visible') return null;

        switch (inputType) {
            case 'Static dropdown':
                return (
                    <TextField
                        id={`outlined-select-${name}`}
                        select
                        name={name}
                        label={displayName}
                        variant="outlined"
                        value={formData[name]}
                        onChange={handleChange}
                        required={!field.isNullable}
                        disabled={enability === 'Disabled'}
                        className='input-field'
                    >
                        <MenuItem value="">Select</MenuItem>
                        {Object.keys(field.value).map(key => (
                            <MenuItem key={key} value={key}>
                                {field.value[key]}
                            </MenuItem>
                        ))}
                    </TextField>
                );
            case 'Dynamic dropdown':
                return (
                    <TextField
                        id={`outlined-select-${name}`}
                        select
                        name={name}
                        label={displayName}
                        variant="outlined"
                        value={formData[name] || ''}
                        onChange={handleChange}
                        required={!field.isNullable}
                        disabled={enability === 'Disabled'}
                        className='input-field'
                    >
                        <MenuItem value=''>Select</MenuItem>
                        {dynamicDropdownOptions[field.name] &&
                            Object.keys(dynamicDropdownOptions[field.name]).map(key => (
                                <MenuItem key={key} value={key}>
                                    {dynamicDropdownOptions[field.name][key]}
                                </MenuItem>
                            ))}
                    </TextField>
                );
            case 'Textbox':
                return (
                    <TextField
                    fullWidth
                    id={name}
                    name={name}
                    type={field.dataType==='DateTime'? "datetime-local": "text"}
                    value={formData[name]}
                    label={displayName}
                    variant="outlined"
                    onChange={handleChange}
                    required={field.isPrimaryKey? false: !field.isNullable}
                    disabled={enability === 'Disabled'}
                    className='input-field'
                    InputLabelProps={{ shrink: true }}
                />
                );
            case 'Email':
            case 'Password':
            case 'Number':
                return (
                    <TextField
                    fullWidth
                    id={name}
                    name={name}
                    value={formData[name]}
                    label={displayName}
                    variant="outlined"
                    onChange={handleChange}
                    required={!field.isNullable}
                    disabled={enability === 'Disabled'}
                    className='input-field'
                    InputLabelProps={{ shrink: true }}
                    type={inputType.toLowerCase()}
                />
                );
            case 'Checkbox':
                return (
                    <label>
                        <Checkbox
                        checked={formData[name] || false}
                        onChange={handleCheckboxChange}
                        name={name}
                        disabled={enability === 'Disabled'}
                        variant="outlined"
                        />
                        {displayName}
                    </label>
                );
            case 'Radio button':
                return (
                    <label>
                        <input
                            type="radio"
                            checked={formData[name] || false}
                            onChange={handleCheckboxChange}
                            name={name}
                            value={formData[name]}
                            disabled={enability === 'Disabled'}
                        />
                        {displayName}
                    </label>
                );
            case 'Radio group':
                return (
                    <fieldset>
                        <legend>{displayName}</legend>
                        {Object.keys(field.value).map(key => (
                            <label key={key}>
                                <input
                                    type="radio"
                                    name={name}
                                    value={key}
                                    checked={formData[name] === key}
                                    onChange={handleChange}
                                    required={!field.isNullable}
                                    disabled={enability === 'Disabled'}
                                />
                                {field.value[key]}
                            </label>
                        ))}
                    </fieldset>
                );
            default:
                return null;
        }
    };

    const renderFieldsByRows = () => {
        const groupedFields = fields.reduce((result, field) => {
            const rowNumber = field.rowNumber || '1';
            if (!result[rowNumber]) {
                result[rowNumber] = [];
            }
            result[rowNumber].push(field);
            return result;
        }, {});

        Object.values(groupedFields).forEach(row => {
            row.sort((a, b) => a.sequence - b.sequence);
        });

        return (
            <tbody>
                {Object.keys(groupedFields).map(rowNumber => (
                    <tr key={rowNumber}>
                        {groupedFields[rowNumber].map(field => (
                            <td key={field.name}>
                                {renderField(field)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        );
    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const validationError = Validation(fields, formData);
        if (validationError) {
            setValidationError(validationError);
            return;
        }
        else{
            axios.put(`${local_url}/${tableName}/${id}`, formData)
                .then(response => {
                    console.log('Data updated successfully');
                    // navigate(`/table/${tableName}`);
                })
                .catch(error => {
                    console.error('Error updating data:', error);
                });
            }
    };

    return (
        <div>
            <Header Heading="Edit Form"/>
            <div className="input-form-container" >
                <button style={{background:'transparent', border:'none'}} onClick={() => navigate(`/table/${tableName}`)}>
                    <ArrowBackIcon />
                </button>
                <h4 className="form-title">{`Edit Form: ${tableName}`}</h4>
                <form onSubmit={handleSubmit} className="form">
                    <table className="input-table">
                        {renderFieldsByRows()}
                    </table>
                    <div id="valid" style={{ color: "red" }}>{validationError}</div>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
            {/* {fieldData.childTableFields.length>0 && <HeaderTable tableName={fieldData.childTableFields.tableName}/>} */}
            <div style={{marginTop:"5%"}}></div>
            <Footer/>
        </div>
    );
};

export default HeaderTableEditForm;