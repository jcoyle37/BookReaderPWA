import React from 'react';
import {
  Link
} from 'react-router-dom';
import $ from 'jquery';
//according to https://archive.org/advancedsearch.php#raw    title contains rabbit and mediatype is texts,
//https://archive.org/advancedsearch.php?q=title:(rabbit)%20AND%20mediatype:(texts)&output=json&callback=IAE.search_hits
// =
// https://archive.org/search.php?query=title%3A%28rabbit%29%20AND%20mediatype%3A%28texts%29#raw
/*export default function Search () {
  return (
    <span>search here</span>
  )
}*/


//todo: determine how to get the following URL:
////ia800701.us.archive.org/BookReader/BookReaderJSIA.php?id=rabbitforeaster00carr&itemPath=/8/items/rabbitforeaster00carr&server=ia800701.us.archive.org&format=jsonp&subPrefix=rabbitforeaster00carr&requestUri=/details/rabbitforeaster00carr
//based off the ID, rabbitforeaster00carr. This contains all the images which I can download

/*questions to address:
-are there additional legal aspects to consider now that I'm downloading books locally?
*/

function SearchResults(props) {
  if(!props.query)
    return (
      <div></div>
    )
  else if(props.loading)
    return (
      <div>
        Loading...
      </div>
    );
  else {
    return (
      <div>
        <h2>{props.results.length} Results for {props.query}</h2>
        <ul className='bookResults'>
          {props.results.map((book) => (
            <a
              href={`https://archive.org/details/${book.identifier}`}
              target="_blank">
                <li key={'bookResult_' + book.identifier}>
                  <img
                    src={`https://archive.org/services/img/${book.identifier}`} />
                  <p>
                    {book.title}
                  </p>
                </li>
            </a>
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
      input: '',
      lastQuery: '',
      searchResults: [],
      loading: true
    };

    this.updateInput = this.updateInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }
  updateInput(e) {
    const value = e.target.value;

    this.setState({
      input: value
    });
  }
  handleSearch() {
    this.setState((currentState) => {
      return {
        loading: true,
        lastQuery: currentState.input
      }
    });

    const maxRows = 10; //defaults to 50; setting lower reduces server load
    let query = 
      'https://archive.org/advancedsearch.php?q=%28'
      + this.state.input + '%29%20AND%20mediatype%3A%28texts%29'
      + '&fl%5B%5D=creator&fl%5B%5D=description&fl%5B%5D=identifier'
      + '&fl%5B%5D=item_size&fl%5B%5D=publisher&fl%5B%5D=title'
      + '&fl%5B%5D=year&sort%5B%5D=downloads+desc&sort%5B%5D=&sort&page=1'
      + '&output=json&callback=IAE.search_hits';

    if(maxRows > 0)
      query += '&rows=' + maxRows;

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
      console.log('response', res);
      
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
  render() {
    return (
      <div>
        <h1>Search The Internet Archive</h1>
        <input
          type='Text'
          placeholder='Author and/or title'
          value={this.state.input}
          onChange={this.updateInput}
        />
        <button onClick={this.handleSearch}>Search</button>

        <hr />

        <SearchResults
          results={this.state.searchResults}
          query={this.state.lastQuery}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default Search;
