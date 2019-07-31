import React from 'react';
import {
  NavLink
} from 'react-router-dom';

//<NavLink exact={true} className="nav-link" to={{pathname: './'}} activeClassName='active'>
//<NavLink exact={true} className="nav-link" to={{pathname: './search'}} activeClassName='active'>

export default function Header () {
  return (
    <nav className='header'>
      <button id='installBtn' style={{display: 'none'}}>Install for Offline Use</button>

      <ul className="linkList">
        <li className="nav-item">
          <NavLink exact={true} className="nav-link" to="/" activeClassName='active'>
            <span>My Library</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink exact={true} className="nav-link" to="/search" activeClassName='active'>
            <span>Search</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  )
};