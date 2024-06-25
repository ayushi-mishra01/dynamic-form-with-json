import React from 'react';
import './App.css';
import Display from './display';
import Input from './inputForm';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Display/>} />
          <Route path="/add" element={<Input/>} />
        </Routes>
      </Router>
    </div>
  );
}