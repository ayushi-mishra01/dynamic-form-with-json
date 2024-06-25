// src/Header.js
import React, { useState } from 'react';
import './style.css';

const Header = ({Heading}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <div className="logo">{Heading}</div>
      <nav className={`nav ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <button className="menu-toggle" onClick={toggleMenu}>
        <span className="menu-icon">&#9776;</span>
      </button>
    </header>
  );
};

export default Header;
