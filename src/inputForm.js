import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { local_url } from './Urls';

const InputForm = () => {
    const navigate = useNavigate();
    const { tableName } = useParams();

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${local_url}/${tableName}`);
                const tableData = response.data;

                if (tableData.length > 0) {
                    const firstRow = tableData[0];
                    const fetchedFields = Object.keys(firstRow).map(key => ({
                        fieldName: key,
                        displayName: key
                    }));

                    const initialFormData = {};
                    fetchedFields.forEach(field => {
                        if (field.fieldName !== 'id') {
                            initialFormData[field.fieldName] = '';
                        }
                    });

                    setFields(fetchedFields);
                    setFormData(initialFormData);
                }
            } catch (error) {
                console.error('Error fetching table info:', error);
            }
        };

        if (tableName) {
            fetchData();
        }
    }, [tableName]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    return (
        <Grid container justifyContent="center" style={{ marginTop: "4%" }}>
            <Grid item xs={12} sm={8} md={6}>
                <Card>
                    <CardContent>
                        <Tooltip title="Back" arrow>
                            <ArrowBackIcon onClick={() => navigate('/')} />
                        </Tooltip>
                        <Typography variant="h4" color="primary">
                            Input Form
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            {fields.map(field => (
                                field.fieldName !== 'id' && (
                                    <TextField
                                        key={field.fieldName}
                                        fullWidth
                                        margin="normal"
                                        label={field.displayName}
                                        name={field.fieldName}
                                        type="text"
                                        value={formData[field.fieldName] || ''}
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

export default InputForm;