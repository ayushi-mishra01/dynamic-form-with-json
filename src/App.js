import React from 'react';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import Display from './display';
import Input from './inputForm';
import EditForm from './editForm.js';
import Entities from './EntityList';
import Table from './table.js'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

export default function App() {
  return (
    <div>
      <Router>
        <Header/>
          <Routes>
            <Route path="/" element={<Entities/>} />
            <Route path="/display" element={<Display/>} />
            <Route path="/table/:tableName" element={<Table/>} />
            <Route path="/add/:tableName" element={<Input/>} />
            <Route path="/edit/:tableName/:id" element={<EditForm/>} />
          </Routes>
        <Footer/>
      </Router>
    </div>
  );
}