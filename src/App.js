import React from 'react';
import './App.css';
import Display from './display';
import Input from './inputForm';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Entities from './EntityList';

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Entities/>} />
          <Route path="/display" element={<Display/>} />
          <Route path="/add" element={<Input/>} />
        </Routes>
      </Router>
    </div>
  );
}