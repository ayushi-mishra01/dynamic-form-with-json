import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { local_url } from './Urls';
import fieldData from './tableFieldData.json';
import './style.css'; 
import Header from './Header';
import Footer from './Footer';

const EditForm = () => {
    const navigate = useNavigate();
    const { tableName, id } = useParams();

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (id) {
            axios.get(`${local_url}/GetEntityById/${tableName}/${id}`)
                .then(response => {
                    const recordToEdit = response.data;

                    if (!recordToEdit) {
                        console.error(`Record with id ${id} not found.`);
                        return;
                    }

                    const initialFormData = {};
                    fieldData.forEach(field => {
                            initialFormData[field.name] = recordToEdit[field.name];
                    });
                    setFormData(initialFormData);
                })
                .catch(error => {
                    console.error('Error fetching data for editing:', error);
                });
        } else {
            const initialFormData = {};
            fieldData.forEach(field => {
                if (field.name.toLowerCase() !== 'id') {
                    initialFormData[field.name] = '';
                }
            });
            setFormData(initialFormData);
        }

        const filteredFields = fieldData.filter(field => field.name.toLowerCase() !== 'id');
        setFields(filteredFields);
    }, [tableName, id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        console.log('checked');
        console.log(e.target.checked);
        setFormData({ ...formData, [e.target.name]: e.target.checked});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`${local_url}/${tableName}/${id}`, formData);
                console.log('Data updated successfully');
                console.log(formData);
            }
            navigate(`/table/${tableName}`);
        } catch (error) {
            console.error('Error submitting data:', error);
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

    const renderField = (field) => {
        const { name, inputType, displayName, visibility } = field;

        if (name === 'Id' || visibility !== 'Visible') return null;

        switch (inputType) {
            case 'Textbox':
                return (
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={!field.isNullable}
                        placeholder={displayName}
                        className='input-field'
                    />
                );
            case 'Email':
                return (
                    <input
                        type="email"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={!field.isNullable}
                        placeholder={displayName}
                        className='input-field'
                    />
                );
            case 'Checkbox':
                return (
                    <label>
                        <input
                            type="checkbox"
                            checked={formData[name] || false}
                            onChange={handleCheckboxChange}
                            name={name}
                        />
                        {displayName}
                    </label>
                );
            default:
                return (
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={!field.isNullable}
                        placeholder={displayName}
                        className='input-field'
                    />
                );
        }
    };

    return (
        <div>
            <Header Heading={id ? "Edit Form" : "Input Form"} />
            <div className="input-form-container">
                <button style={{ background: 'transparent', border: 'none' }} onClick={() => navigate(`/table/${tableName}`)}>
                    <ArrowBackIcon />
                </button>
                <h4 className="form-title">{id ? "Edit Form" : "Input Form"}</h4>
                <form onSubmit={handleSubmit} className="form">
                    <table className="input-table">
                        {renderFieldsByRows()}
                    </table>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditForm;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import Tooltip from '@mui/material/Tooltip';
// import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';
// import axios from 'axios';
// import { local_url } from './Urls';

// const EditForm = () => {
//     const navigate = useNavigate();
//     const { tableName, id } = useParams(); 
    
//     const [formData, setFormData] = useState({});
//     const [editFields, setEditFields] = useState({}); 

//     useEffect(() => {
//         axios.get(`${local_url}/GetEntityById/${tableName}/${id}`)
//             .then(response => {
//                 const recordToEdit = response.data;

//                 if (!recordToEdit) {
//                     console.error(`Record with id ${id} not found.`);
//                     return;
//                 }

//                 setEditFields(recordToEdit);

//                 setFormData(recordToEdit);
//              })
//             .catch(error => {
//                 console.error('Error fetching data for editing:', error);
//             });
//     }, [tableName, id]);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         axios.put(`${local_url}/${tableName}/${id}`, formData)
//             .then(response => {
//                 console.log('Data updated successfully:');
//                 console.log(formData)
//                 navigate(`/table/${tableName}`);
//             })
//             .catch(error => {
//                 console.error('Error updating data:', error);
//             });
//     };

//     if (!editFields) {
//         return <Typography variant="h6">Loading...</Typography>;
//     }

//     return (
//         <Grid container justifyContent="center" style={{ marginTop: "4%" }}>
//             <Grid item xs={12} sm={8} md={6}>
//                 <Card>
//                     <CardContent>
//                         <Tooltip title="Back" arrow>
//                             <ArrowBackIcon onClick={() => navigate(`/table/${tableName}`)} />
//                         </Tooltip>
//                         <Typography variant="h4" color="#71BC0A">
//                             Edit Form
//                         </Typography>
//                         <form onSubmit={handleSubmit}>
//                             {Object.keys(editFields).map(key => (
//                                 key !== 'id' && (
//                                     <TextField
//                                         key={key}
//                                         fullWidth
//                                         margin="normal"
//                                         label={key}
//                                         name={key}
//                                         type="text"
//                                         value={formData[key]}
//                                         onChange={handleChange}
//                                     />
//                                 )
//                             ))}
//                             <Button type="submit" variant="contained" color="primary">
//                                 Submit
//                             </Button>
//                         </form>
//                     </CardContent>
//                 </Card>
//             </Grid>
//         </Grid>
//     );
// };

// export default EditForm;