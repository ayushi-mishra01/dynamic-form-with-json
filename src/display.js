import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react'; 
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import tableInfo from './tableInfo.json';
import tableData from './tableData.json';

export default function Display() {

    const navigate = useNavigate();

    const columnDefs = tableInfo.fields.map(field => ({
        headerName: field.displayName,
        field: field.fieldName,
        sortable: true,
        filter: true,
        resizable: true,
    }));


  const handleAdd=()=>{
    navigate('/add');
  }

  return (
    <div style={{marginTop:"5%"}}>
        <Grid >
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" align="center">
                {tableInfo.tableName}
              </Typography>
              <div className="ag-theme-quartz-dark" style={{ width: '100%', height: '400px' }}>
                <AgGridReact
                  columnDefs={columnDefs}
                  rowData={tableData.users}
                  pagination={true}
                />
              </div>
              <Tooltip title="Add" placement="top" arrow="true">
                <button className="styled-icon" onClick={handleAdd}><AddIcon/></button>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>
    </div>
  );
}