import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useNavigate, useParams } from 'react-router-dom';
import { local_url } from './Urls';
import Footer from './Footer';
import Header from './Header';
import fieldData from './tableFieldData.json';

export default function Table() {
    const { tableName } = useParams();
    const [data, setData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [foreignKeyValues, setForeignKeyValues] = useState({});
    const [fields, setFields] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        setFields(fieldData.mainTableFields);
    }, [tableName]);

    useEffect(() => {
        fields.forEach(field => {
            if (field.foreignKeyTable !== '-') {
                getForeignKeyValues(field, field.foreignKeyTable);
            }
        });
    }, [fields]);

    useEffect(() => {
        if (Object.keys(foreignKeyValues).length > 0) {
            getData();
        }
    }, [foreignKeyValues]);

    const getData = () => {
        axios.get(`${local_url}/${tableName}`)
            .then(response => {
                let rows = response.data;

                if (Object.keys(foreignKeyValues).length > 0) {
                    rows = response.data.map(row => {
                        const newRow = { ...row };
                        Object.keys(newRow).forEach(key => {
                            if (foreignKeyValues[key] && foreignKeyValues[key][newRow[key]]) {
                                newRow[key] = foreignKeyValues[key][newRow[key]];
                            }
                        });
                        return newRow;
                    });
                }

                setData(rows);

                if (response.data.length > 0) {
                    const firstRow = response.data[0];
                    const columns = Object.keys(firstRow).map(key => ({
                        headerName: key,
                        field: key,
                        sortable: true,
                        filter: true,
                        resizable: true
                    }));

                    columns.push({
                        headerName: 'Actions',
                        cellRenderer: params => (
                            <div>
                                <Tooltip title="Edit">
                                    <button style={{ background: 'transparent', border: 'none' }} onClick={() => handleEdit(params.data)}>
                                        <EditIcon />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <button style={{ background: 'transparent', border: 'none' }} onClick={() => handleDelete(params.data.id)}>
                                        <DeleteIcon />
                                    </button>
                                </Tooltip>
                            </div>
                        )
                    });
                    setColumnDefs(columns);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    const getForeignKeyValues = async (field, foreignKeyTable) => {
        const { value } = field;
        const [idColumnName, nameColumnName] = value.split('-');
        try {
            const response = await axios.get(`http://localhost:7050/api/Dynamic/${foreignKeyTable}`);
            const options = response.data.reduce((acc, item) => {
                acc[item[idColumnName]] = item[nameColumnName];
                return acc;
            }, {});
            setForeignKeyValues(prevOptions => ({
                ...prevOptions,
                [field.name]: options
            }));
        } catch (error) {
            console.error('Error fetching dynamic dropdown options:', error);
        }
    };

    const handleEdit = (rowData) => {
        console.log('Editing row:', rowData);
        navigate(`/edit/${tableName}/${rowData.id}`);
    };

    const handleDelete = (id) => {
        console.log('Deleting row with ID:', id);
        axios.delete(`${local_url}/${tableName}/${id}`)
            .then(response => {
                getData();
            })
            .catch(error => {
                console.error('Error deleting row:', error);
            });
    };

    const navigateToAdd = () => {
        navigate(`/add/${tableName}`);
    };

    return (
        <div>
            <Header Heading="Tables" />
            <div>
                <Grid container justifyContent="center">
                    <Grid item xs={12}>
                        <Card style={{ backgroundColor: "#f0f0f0" }}>
                            <CardContent>
                                <div style={{ backgroundColor: "#f0f0f0" }}>
                                    <button style={{ background: 'transparent', border: 'none' }} onClick={() => navigate(`/`)}>
                                        <ArrowBackIcon />
                                    </button>
                                    <Typography variant="h4" color="#8EB2C8" align="center">
                                        {tableName}
                                    </Typography>
                                    <div className="ag-theme-quartz-dark" style={{ height: '400px', marginTop: '20px', overflow: 'auto' }}>
                                        <AgGridReact
                                            columnDefs={columnDefs}
                                            rowData={data}
                                            pagination={true}
                                            domLayout='autoHeight'
                                        />
                                    </div>
                                    <div style={{ marginTop: "10px" }}>
                                        <Tooltip title="Add" placement="top" arrow>
                                            <button className="styled-icon" onClick={navigateToAdd}>
                                                <AddIcon />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            <Footer />
        </div>
    );
}