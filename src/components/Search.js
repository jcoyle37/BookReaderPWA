import React from 'react';
import {
  Link
} from 'react-router-dom';
import $ from 'jquery';

/*
questions to address:
- Are there additional legal aspects to consider now that we're downloading books locally?
- What about these pay-to-preview books? Only leafs available to the preview show up. Should
  I just exclude those from the search and if so, how?
*/

function SearchResults(props) {
  if(!props.query) //default view, no searches performed
    return (
      <div></div>
    )
  else if(props.loading) //if loading search query
    return (
      <div>
        Loading...
      </div>
    );
  else { //display search query
    return (
      <div>
        <h2>{props.results.length} Results for {props.query}</h2>
        <ul className='bookResults'>
          {props.results.map((book) => (
            <li key={'bookResult_' + book.identifier}>
              <a href={`https://archive.org/details/${book.identifier}`}
                 target="_blank">
                <img
                  src={`https://archive.org/services/img/${book.identifier}`} />
                <p>
                  {book.title}
                </p>
              </a>
              <button onClick={() => props.onDownloadBook(book.identifier)}>Download</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '', //current query input
      lastQuery: '', //last search query performed
      searchResults: [],
      loading: false //set 'true' when loading a search query
    };

    this.updateInput = this.updateInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  updateInput(e) { //as user types into query input, update text
    const value = e.target.value;

    this.setState({
      input: value
    });
  }

  handleSearch() { //triggered by clicking 'download' button
    this.setState((currentState) => {
      return {
        loading: true,
        lastQuery: currentState.input
      }
    });

    const maxRows = 10; //set to 0 for default (50); setting lower reduces server load
    let query = //construct search URL (determined from https://archive.org/advancedsearch.php)
      '///archive.org/advancedsearch.php?q=%28'
      + this.state.input + '%29%20AND%20mediatype%3A%28texts%29'
      + '&fl%5B%5D=creator&fl%5B%5D=description&fl%5B%5D=identifier'
      + '&fl%5B%5D=item_size&fl%5B%5D=publisher&fl%5B%5D=title'
      + '&fl%5B%5D=year&sort%5B%5D=downloads+desc&sort%5B%5D=&sort&page=1'
      + '&output=json&callback=IAE.search_hits';
    if(maxRows > 0)
      query += '&rows=' + maxRows;
  
    //perform search
    new Promise((resolve, reject) => {
			$.ajax({
        url: query,
        type: 'GET',
        dataType: 'jsonp',
        success: function(res) {
          resolve(res);
        },
        error: function(jqXHR) {
          reject('error', jqXHR);
        }
      });
		}).then((res) => {
      this.setState(() => {
        return {
          searchResults: res.response.docs,
          loading: false
        }
      });
		}).catch((error) => {
      console.log(error);
		});
  }

  handleDownloadBook(id) {
    new Promise((resolve, reject) => {
      //get book metadata which will provide us with information needed to construct
      //a URL we can use to call BookReaderJSIA.php, which will provide book leaf URIs
      $.ajax({
        url: '///archive.org/metadata/' + id,
        type: 'GET',
        dataType: 'jsonp',
        success: function(res) {
          resolve(res);
        },
        error: function(jqXHR) {
          reject('error', jqXHR);
        }
      });
		}).then((metadata) => {
      //construct URL with which we will call BookReaderJSIA.php
      const reqUrl =
        '///' + metadata.server + '/BookReader/BookReaderJSIA.php?id='
        + metadata.metadata.identifier + '&itemPath=' + metadata.dir
        + '&server=' + metadata.server + '&format=jsonp';

      return new Promise((resolve, reject) => {
        $.ajax({
          url: reqUrl,
          type: 'GET',
          dataType: 'jsonp'
        }).then(function(res) {
          resolve(res.data);
        });
      });
    }).then((bookData) => { //leaf information contained in this object
      console.log('bookData', bookData);
		}).catch((error) => {
      console.log(error);
		});
  }

  render() {
    return (
      <div>
        <h1>Search The Internet Archive</h1>
        <input
          type='Text'
          placeholder='Query'
          value={this.state.input}
          onChange={this.updateInput}
        />
        <button onClick={this.handleSearch}>Search</button>

        <hr />

        <SearchResults
          results={this.state.searchResults}
          query={this.state.lastQuery}
          loading={this.state.loading}
          onDownloadBook={this.handleDownloadBook}
        />
      </div>
    );
  }
}

export default Search;
