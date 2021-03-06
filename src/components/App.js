import React, { Component } from 'react';
import Home from './Home';
import Header from './Header';
import Search from './Search';
import {
  BrowserRouter,
  Route
} from 'react-router-dom';

//https://facebook.github.io/create-react-app/docs/deployment#serving-apps-with-client-side-routing

//todo: consider rewriting as function, not class
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    const pathArr = window.location.pathname.split('/');
    let pathStart = pathArr.slice(1,pathArr.length-1).join('/');

    if(pathStart)
      pathStart = '/' + pathStart;

      //<BrowserRouter basename={pathStart}>
    
    return (
      <BrowserRouter basename={pathStart}>
        <div id="wrapper">
          <div id="content-wrapper" className="d-flex flex-column">
            <Header />

            <div id="content">
              <div className="container-fluid">
                <Route exact path='/' component={Home} />
                <Route path='/search' component={Search} />
              </div>
            </div>
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
