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
                const response = await axios.get(`${local_url}/GetEntityMetadata/${tableName}`);
                const tableData = response.data;

                if (tableData.length > 0) {
                    const fetchedFields = tableData.map(field => ({
                        fieldName: field.name,
                        displayName: field.name,
                        clrTypeName: field.clrTypeName.split(',')[0].trim(),
                        isNullable: field.isNullable,
                        isPrimaryKey: field.isPrimaryKey,
                        foreignKeys: field.foreignKeys,
                        indexes: field.indexes,
                        keys: field.keys,
                        primaryKey: field.primaryKey
                    }));

                    const initialFormData = {};
                    fetchedFields.forEach(field => {
                        if (field.fieldName.toLowerCase() !== 'id') {
                            initialFormData[field.fieldName] = '';
                        }
                    });

                    setFields(fetchedFields);
                    setFormData(initialFormData);
                    console.log(fetchedFields);
                    console.log(initialFormData);
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

    const renderField = (field) => {
        const { fieldName, displayName, clrTypeName, isNullable } = field;

        if (fieldName.toLowerCase() === 'id') return null;

        let fieldType = 'text';

        if (clrTypeName === 'System.DateTime') {
            fieldType = 'text';
        } else if (clrTypeName === 'System.Int32' || clrTypeName === 'System.Int64') {
            fieldType = 'number';
        }

        return (
            <TextField
                key={fieldName}
                fullWidth
                margin="normal"
                label={displayName}
                name={fieldName}
                type={fieldType}
                value={formData[fieldName] || ''}
                onChange={handleChange}
                required={!isNullable}
            />
        );
    };

    return (
        <Grid container justifyContent="center" style={{ marginTop: '4%' }}>
            <Grid item xs={12} sm={8} md={6}>
                <Card>
                    <CardContent>
                        <Tooltip title="Back" arrow>
                            <ArrowBackIcon onClick={() => navigate(`/table/${tableName}`)} />
                        </Tooltip>
                        <Typography variant="h4" color="#8EB2C8">
                            Input Form
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            {fields.map(field => renderField(field))}
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