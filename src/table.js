import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, IconButton  } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { local_url } from './Urls';

export default function Table() {
    const { tableName } = useParams();
    const [data, setData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getData();
    }, [tableName]);

    const getData = () => {
        axios.get(`${local_url}/${tableName}`)
            .then(response => {
                setData(response.data);

                if (response.data.length > 0) {
                    const firstRow = response.data[0];
                    const columns = Object.keys(firstRow).map(key => ({
                        headerName: key,
                        field: key,
                        sortable: true,
                        filter: true,
                        resizable: true,
                    }));
                    
                    columns.push({
                        headerName: 'Actions',
                        cellRenderer: params => (
                            <div>
                                <Tooltip title="Edit">
                                    <button style={{background:'transparent', border:'none'}} onClick={() => handleEdit(params.data)}>
                                        <EditIcon />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <button style={{background:'transparent', border:'none'}} onClick={() => handleDelete(params.data.id)}>
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
        <div style={{ marginTop: '3%' }}>
            <Grid container justifyContent="center">
                <Grid item xs={10}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="primary" align="center">
                                {tableName}
                            </Typography>
                            <div className="ag-theme-quartz-dark" style={{ height: '400px', marginTop: '20px', overflow:'auto' }}>
                                <AgGridReact
                                    columnDefs={columnDefs}
                                    rowData={data}
                                    pagination={true}
                                    domLayout='autoHeight'
                                />
                            </div>
                            <Tooltip title="Add" placement="top" arrow>
                                <button className="styled-icon" onClick={navigateToAdd}>
                                    <AddIcon />
                                </button>
                            </Tooltip>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}
