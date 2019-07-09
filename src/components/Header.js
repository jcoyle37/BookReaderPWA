import React from 'react';
import {
  Link,
  NavLink
} from 'react-router-dom';

export default function Header () {
  return (
    <nav className="header">
      Hello, welcome to your library!

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
}
