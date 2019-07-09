import React from 'react';
import {
  Link
} from 'react-router-dom';

export default function Home () {
  return (
    <div>
      <Link className="homeLink" to="/search">
        <span>Search</span>
      </Link>
    </div>
  )
}
