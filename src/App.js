import React from 'react';
import './App.css';
import Display from './Display.js';
import Input from './InputFormUsingJson.js';
import EditForm from './EditFormUsingJson.js';
import Entities from './EntityList';
import Table from './Table.js'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HeaderTableInputForm from './HeaderTableInputForm.js';
import HeaderTableEditForm from './HeaderTableEditForm.js';

export default function App() {
  return (
    <div>
      <Router>
          <Routes>
            <Route path="/" element={<Entities/>} />
            <Route path="/display" element={<Display/>} />
            <Route path="/table/:tableName" element={<Table/>} />
            <Route path="/add/:tableName" element={<Input/>} />
            <Route path="/edit/:tableName/:id" element={<EditForm/>} />
            <Route path="/headerAdd/:tableName" element={<HeaderTableInputForm/>} />
            <Route path="/headerEdit/:tableName/:id" element={<HeaderTableEditForm/>} />
          </Routes>
      </Router>
    </div>
  );
}