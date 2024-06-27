import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { local_url } from './Urls';

const EditForm = () => {
    const navigate = useNavigate();
    const { tableName, id } = useParams(); 
    
    const [formData, setFormData] = useState({});
    const [editFields, setEditFields] = useState({}); 

    useEffect(() => {
        axios.get(`${local_url}/${tableName}`)
            .then(response => {
                const recordToEdit = response.data.find(record => record.id === parseInt(id));

                if (!recordToEdit) {
                    console.error(`Record with id ${id} not found.`);
                    return;
                }

                setEditFields(recordToEdit);

                setFormData(recordToEdit);
             })
            .catch(error => {
                console.error('Error fetching data for editing:', error);
            });
    }, [tableName, id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`${local_url}/${tableName}/${id}`, formData)
            .then(response => {
                console.log('Data updated successfully:', response.data);
                navigate(`/table/${tableName}`);
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    };

    if (!editFields) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Grid container justifyContent="center" style={{ marginTop: "4%" }}>
            <Grid item xs={12} sm={8} md={6}>
                <Card>
                    <CardContent>
                        <Tooltip title="Back" arrow>
                            <ArrowBackIcon onClick={() => navigate('/')} />
                        </Tooltip>
                        <Typography variant="h4" color="primary">
                            Edit Form
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(editFields).map(key => (
                                key !== 'id' && (
                                    <TextField
                                        key={key}
                                        fullWidth
                                        margin="normal"
                                        label={key}
                                        name={key}
                                        type="text"
                                        value={formData[key]}
                                        onChange={handleChange}
                                    />
                                )
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

export default EditForm;