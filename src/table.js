// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
// import Tooltip from '@mui/material/Tooltip';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { useNavigate, useParams } from 'react-router-dom';
// import fields from './tableFieldData.json';
// import { local_url } from './Urls';

// export default function Table() {
//     const { tableName } = useParams();
//     const [data, setData] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         getData();
//     }, [tableName]);

//     const getData = () => {
//         axios.get(`${local_url}/${tableName}`)
//             .then(response => {
//                 setData(response.data);
//             })
//             .catch(error => {
//                 console.error('Error fetching data:', error);
//             });
//     };

//     const handleEdit = (rowData) => {
//         console.log('Editing row:', rowData);
//         navigate(`/edit/${tableName}/${rowData.id}`);
//     };

//     const handleDelete = (id) => {
//         console.log('Deleting row with ID:', id);
//         axios.delete(`${local_url}/${tableName}/${id}`)
//             .then(response => {
//                 getData(); // Refresh data after delete
//             })
//             .catch(error => {
//                 console.error('Error deleting row:', error);
//             });
//     };

//     const navigateToAdd = () => {
//         navigate(`/add/${tableName}`);
//     };

//     const renderTableHeaders = () => {
//         // Group fields by rowNumber
//         const fieldsByRow = fields.reduce((acc, field) => {
//             if (!acc[field.rowNumber]) {
//                 acc[field.rowNumber] = [];
//             }
//             acc[field.rowNumber].push(field);
//             return acc;
//         }, {});

//         // Sort rows by rowNumber
//         const sortedRows = Object.keys(fieldsByRow).sort((a, b) => a - b);

//         return (
//             <thead>
//                 {sortedRows.map(rowNumber => (
//                     <tr key={`row-${rowNumber}`}>
//                         {fieldsByRow[rowNumber].sort((a, b) => a.sequence - b.sequence).map(field => (
//                             <th key={field.name}>{field.displayName}</th>
//                         ))}
//                         <th>Actions</th>
//                     </tr>
//                 ))}
//             </thead>
//         );
//     };

//     const renderTableBody = () => {
//         return (
//             <tbody>
//                 {data.map((row, index) => (
//                     <tr key={`row-${index}`}>
//                         {fields.map(field => (
//                             <td key={`${field.name}-${index}`}>{row[field.name]}</td>
//                         ))}
//                         <td>
//                             <Tooltip title="Edit">
//                                 <IconButton size="small" onClick={() => handleEdit(row)}>
//                                     <EditIcon />
//                                 </IconButton>
//                             </Tooltip>
//                             <Tooltip title="Delete">
//                                 <IconButton size="small" onClick={() => handleDelete(row.id)}>
//                                     <DeleteIcon />
//                                 </IconButton>
//                             </Tooltip>
//                         </td>
//                     </tr>
//                 ))}
//             </tbody>
//         );
//     };

//     return (
//         <div style={{ marginTop: '3%' }}>
//             <Grid container justifyContent="center">
//                 <Grid item xs={10}>
//                     <Card>
//                         <CardContent>
//                             <Typography variant="h4" color="textPrimary" align="center">
//                                 {tableName}
//                             </Typography>
//                             <div style={{ overflowX: 'auto' }}>
//                                 <table>
//                                     {renderTableHeaders()}
//                                     {renderTableBody()}
//                                 </table>
//                             </div>
//                             <Tooltip title="Add" placement="top" arrow>
//                                 <IconButton onClick={navigateToAdd}>
//                                     <AddIcon />
//                                 </IconButton>
//                             </Tooltip>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//             </Grid>
//         </div>
//     );
// }


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
import Footer from './Footer';
import Header from './Header';

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
        <div>
        <Header/>
        <div style={{ marginTop: '3%' }}>
            <Grid container justifyContent="center">
                <Grid item xs={10}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="#71BC0A" align="center">
                                {tableName}
                            </Typography>
                            <div className="ag-theme-quartz" style={{ height: '400px', marginTop: '20px', overflow:'auto' }}>
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
        <Footer/>
        </div>
    );
}
