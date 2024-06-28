import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { local_url } from './Urls';
import fieldData from './tableFieldData.json';
import './style.css';
import Header from './Header';
import Footer from './Footer';

const InputForm = () => {
    const navigate = useNavigate();
    const { tableName } = useParams();

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const filteredFields = fieldData.filter(field => field.name.toLowerCase() !== 'id');
        setFields(filteredFields);

        const initialFormData = {};
        fieldData.forEach(field => {
            if (field.name.toLowerCase() !== 'id') {
                initialFormData[field.name] = '';
            }
        });
        setFormData(initialFormData);
    }, [tableName]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${local_url}/${tableName}`, formData);
            console.log('Data submitted successfully:', response.data);
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
                        value={formData[name] || ''}
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
                        value={formData[name] || ''}
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
                        value={formData[name] || ''}
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
            <Header Heading="Input Form"/>
            <div className="input-form-container">
                <button style={{background:'transparent', border:'none'}} onClick={() => navigate(`/table/${tableName}`)}>
                    <ArrowBackIcon />
                </button>
                <h4 className="form-title">Input Form</h4>
                <form onSubmit={handleSubmit} className="form">
                    <table className="input-table">
                        {renderFieldsByRows()}
                    </table>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
            <Footer/>
        </div>
    );
};

export default InputForm;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import Tooltip from '@mui/material/Tooltip';
// import { Grid, Card, CardContent, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
// import axios from 'axios';
// import { local_url } from './Urls';
// import fieldData from './tableFieldData.json';

// const InputForm = () => {
//     const navigate = useNavigate();
//     const { tableName } = useParams();

//     const [fields, setFields] = useState([]);
//     const [formData, setFormData] = useState({});

//     useEffect(() => {
        
//         const filteredFields = fieldData.filter(field => field.name.toLowerCase() !== 'id');
//         setFields(filteredFields);

//         const initialFormData = {};
//         fieldData.forEach(field => {
//             if (field.name.toLowerCase() !== 'id') {
//                 initialFormData[field.name] = '';
//             }
//         });
//         setFormData(initialFormData);
//     }, [tableName]);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleCheckboxChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.checked });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post(`${local_url}/${tableName}`, formData);
//             console.log('Data submitted successfully:', response.data);
//             navigate(`/table/${tableName}`);
//         } catch (error) {
//             console.error('Error submitting data:', error);
//         }
//     };

//     const renderFieldsByRows = () => {
//         const groupedFields = fields.reduce((result, field) => {
//             const rowNumber = field.rowNumber || '1';
//             if (!result[rowNumber]) {
//                 result[rowNumber] = [];
//             }
//             result[rowNumber].push(field);
//             return result;
//         }, {});

//         Object.values(groupedFields).forEach(row => {
//             row.sort((a, b) => a.sequence - b.sequence);
//         });

//         return Object.keys(groupedFields).map(rowNumber => (
//             <Grid container spacing={1} key={rowNumber}>
//                 {groupedFields[rowNumber].map((field) => (
//                     <Grid item key={field.name} xs={12} sm={6} md={4}>
//                         {renderField(field,)}
//                     </Grid>
//                 ))}
//             </Grid>
//         ));
//     };

//     const renderField = (field) => {
//         const { name, inputType, displayName, visibility } = field;

//         if (name === 'Id' || name==='id' || visibility !== 'Visible') return null;

//         switch (inputType) {
//             case 'Textbox':
//                 return (
//                     <TextField
//                         fullWidth
//                         margin="normal"
//                         label={displayName}
//                         name={name}
//                         type="text"
//                         value={formData[name] || ''}
//                         onChange={handleChange}
//                         required={field.isNullable}
//                     />
//                 );
//             case 'Email':
//                 return (
//                     <TextField
//                         fullWidth
//                         margin="normal"
//                         label={displayName}
//                         name={name}
//                         type="email"
//                         value={formData[name] || ''}
//                         onChange={handleChange}
//                         required={field.isNullable}
//                     />
//                 );
//             case 'Checkbox':
//                 return (
//                     <FormControlLabel
//                         control={
//                             <Checkbox
//                                 checked={formData[name] || false}
//                                 onChange={handleCheckboxChange}
//                                 name={name}
//                                 color="primary"
//                             />
//                         }
//                         label={displayName}
//                     />
//                 );
//             // Add cases for other input types as needed
//             default:
//                 return (
//                     <TextField
//                         fullWidth
//                         margin="normal"
//                         label={displayName}
//                         name={name}
//                         type="text"
//                         value={formData[name] || ''}
//                         onChange={handleChange}
//                         required={field.isNullable}
//                     />
//                 );
//         }
//     };

//     //     return Object.keys(groupedFields).map(rowNumber => (
//     //         <Grid container spacing={2} key={rowNumber}>
//     //             {groupedFields[rowNumber].map(field => (
//     //                 <Grid item key={field.name} xs={12} sm={6} md={4}>
//     //                     {renderField(field)}
//     //                 </Grid>
//     //             ))}
//     //         </Grid>
//     //     ));
//     // };

//     // const renderField = (field) => {
//     //     const { name, dataType, displayName, visibility } = field;

//     //     if (name === 'Id' || visibility !== 'Visible') return null;

//     //     let fieldType = 'text';

//     //     if (dataType === 'Int32' || dataType === 'Int64') {
//     //         fieldType = 'number';
//     //     } else if (dataType === 'DateTime') {
//     //         fieldType = 'date';
//     //     }

//     //     return (
//     //         <TextField
//     //             fullWidth
//     //             margin="normal"
//     //             label={fieldType==='date' ? '' :displayName}
//     //             name={name}
//     //             type={fieldType}
//     //             value={formData[name] || ''}
//     //             onChange={handleChange}
//     //             required={fieldData.isNullable}
//     //         />
//     //     );
//     // };

//     return (
//         <Grid container justifyContent="center" style={{ marginTop: '4%' }}>
//             {/* <Grid item xs={12} sm={8} md={6}> */}
//             <Grid item xs={12} md={10} lg={8} xl={6}>    
//                 <Card>
//                     <CardContent>
//                         <Tooltip title="Back" arrow>
//                             <ArrowBackIcon onClick={() => navigate(`/table/${tableName}`)} />
//                         </Tooltip>
//                         <Typography variant="h4" color="#71BC0A">
//                             Input Form
//                         </Typography>
//                         <form onSubmit={handleSubmit}>
//                             {renderFieldsByRows()}
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

// export default InputForm;