import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import tableInfo from './tableInfo.json';

const Input = () => {
    const navigate = useNavigate();

    const initialFormData = {};
    tableInfo.fields.forEach(field => {
        initialFormData[field.fieldName] = '';
    });

    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        setFormData(initialFormData);
    }
    
    return (
        <Grid container justifyContent="center" style={{marginTop:"4%"}}>
            <Grid item xs={12} sm={8} md={6}>
                <Card>
                    <CardContent>
                        <Tooltip title="back" arrow="true">
                           <Link to={`/`}  ><ArrowBackIcon /></Link>
                        </Tooltip>
                        <Typography variant="h4" color="primary">
                            Add User
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            {tableInfo.fields.map(field => (
                                field.fieldName!=='id'?(
                                <TextField
                                    key={field.fieldName}
                                    fullWidth
                                    margin="normal"
                                    label={field.displayName === 'Birth Date'? '': field.displayName}
                                    name={field.fieldName}
                                    type={field.type === 'date' ? 'date' : 'text'}
                                    value={formData[field.fieldName]}
                                    onChange={handleChange}
                                />)
                                :
                                null
                            ))}
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Input;