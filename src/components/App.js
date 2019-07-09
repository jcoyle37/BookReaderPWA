import React, { Component } from 'react';
import Home from './Home';
import Header from './Header';
import Search from './Search';
import {
  BrowserRouter,
  Route,
  NavLink
} from 'react-router-dom';
import $ from 'jquery';

//https://facebook.github.io/create-react-app/docs/deployment#serving-apps-with-client-side-routing

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    return (
      <BrowserRouter>
        <div id="wrapper">
          <div id="content-wrapper" className="d-flex flex-column">
            <Header />

            <div id="content">

              <div className="container-fluid">
                <Route exact path='/' component={Home} />
                <Route path='/search' component={Search} />
              </div>
            </div>

            <footer className="footer">
              <span>Powered by The Internet Archive BookReader</span>
            </footer>

          </div>
        </div>

        <a className="scroll-to-top rounded" href="#page-top">
          <i className="fas fa-angle-up"></i>
        </a>
      </BrowserRouter>
    );
  }
}

export default App;
