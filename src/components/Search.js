import React from 'react';
import { getDataUri, setLocalStorage, modifyLibraryList } from '../scripts/general.js';
import $ from 'jquery';

class DownloadBtn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      downloading: false,
      downloaded: false,
      downloadBtnTxt: 'Download',
      numLeafs: undefined,
      downloadProgress: 0
    };

    this.handleDownloadBook = this.handleDownloadBook.bind(this);
  }

  handleDownloadBook(id) {
    this.setState({
      downloading: true,
      downloadBtnTxt: 'Getting page info...'
    });

    //todo: disable other books being downloaded while this is happening
    new Promise((resolve, reject) => {
      //get book metadata which will provide us with information needed to construct
      //a URL we can use to call BookReaderJSIA.php, which will provide book leaf URIs
      $.ajax({
        url: '///archive.org/metadata/' + id,
        type: 'GET',
        dataType: 'jsonp',
        success: function(res) {
          console.log('response', res);
          resolve(res);
        },
        error: function(jqXHR) {
          reject(jqXHR);
        }
      });
		}).then((metadata) => {
      const imageStack = metadata.files.filter((file) => {
        return (
          file.format === 'Single Page Processed JP2 Tar' ||
          file.format === 'Single Page Processed JP2 ZIP' ||
          file.format === 'Single Page Processed JPEG Tar' ||
          file.format === 'Single Page Processed JPEG ZIP' ||
          file.format === 'Single Page Processed TIFF ZIP'
        )
      });

      if(imageStack.length === 0) throw 'Error: No Image Stack Found';

      const firstImgStackName = imageStack[0].name;   //get name from first result (some books
                                                      //have multiple image stacks; we'll ignore)
      const subPrefix = firstImgStackName.split('_jp2')[0]; //strip format-specific endings

      //construct URL with which we will call BookReaderJSIA.php
      const reqUrl =
        '///' + metadata.server + '/BookReader/BookReaderJSIA.php?id='
        + metadata.metadata.identifier + '&itemPath=' + metadata.dir
        + '&server=' + metadata.server + '&format=jsonp&subPrefix=' + subPrefix;

      return new Promise((resolve, reject) => {
        $.ajax({
          url: reqUrl,
          type: 'GET',
          dataType: 'jsonp',
          success: function(res) {
            resolve(res.data);
          },
          error: function(jqXHR) {
            reject(jqXHR);
          }
        });
      }).then((bookData) => { //leaf information contained in this object
        const bookImgArrays = [].concat(bookData.brOptions.data); //multiple arrays of leaf objects
        let bookImgs = [];
        //concatenate into a single array of leaf objects
        bookImgArrays.forEach(function(bookImgArray) {
          bookImgs = bookImgs.concat(bookImgArray);
        });

        this.setState({
          downloadBtnTxt: 'Downloading...',
          numLeafs: bookImgs.length
        });

        //create an object to hold book data which will be stored in IndexedDB. This data will be
        //needed to instantiate BookReader
        let bookObj = {
          identifier: bookData.metadata.identifier,
          data: bookData.brOptions.data,
          bookTitle: bookData.metadata.title,
          author: bookData.metadata.creator, //for library view
          metadata: [
            {
              label: 'Title',
              value: bookData.metadata.title
            },
            {
              label: 'Author',
              value: bookData.metadata.creator
            }
          ],
          leafs: []
        };
        
        //sequentially-chained promises courtesy of https://stackoverflow.com/a/36672042/2969615
        //to alleviate load on the server and prevent HTTP status 429 responses
        // Create a new empty promise (don't do that with real people ;)
        let sequence = Promise.resolve();

        // Loop over each leaf, and add on a promise to the
        // end of the 'sequence' promise.
        bookImgs.forEach((leaf) => {
          // Chain one computation onto the sequence
          sequence = sequence.then(() => {
            return getDataUri(leaf.uri);
          }).then((base64img) => {
            bookObj.leafs.push(base64img); // Resolves for each file, one at a time.
            
            this.setState({
              downloadProgress: this.state.downloadProgress+=1
            });
          });
        });

        // This resolves after the entire chain is resolved
        sequence.then(() => {
          const ebookKey = 'ebook_' + bookData.brOptions.bookId;

          setLocalStorage(ebookKey, bookObj);
          modifyLibraryList('add', ebookKey);
          alert(bookData.metadata.title + ' successfully downloaded.');

          this.setState({
            downloading: false,
            downloaded: true,
            downloadBtnTxt: 'Downloaded'
          });
        });
      }).catch((error) => {
        console.log(error);
      });
    });
  }

  render() {
    let downloadProgressTxt = '';
    //if in process of downloading & 
    if(this.state.downloading === true && this.state.numLeafs) {
      downloadProgressTxt = ' (' + this.state.downloadProgress;
      downloadProgressTxt += '/' + this.state.numLeafs + ')';
    }

    return (
      <button
        onClick={() => this.handleDownloadBook(this.props.identifier)}
        disabled={this.state.downloading || this.state.downloaded}
      >{this.state.downloadBtnTxt}{downloadProgressTxt}</button>
    );
  }
}

function SearchResults(props) {
  if(!props.query) //default view, no searches performed
    return (
      <div>
      </div>
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
                 target="_blank"
                 rel="noopener noreferrer">
                <img
                  src={`https://archive.org/services/img/${book.identifier}`}
                  alt=''
                />
                <p>
                  {book.title}
                </p>
              </a>
              <DownloadBtn
                identifier = {book.identifier}
              />
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

    const maxRows = 25; //set to 0 for default (50); setting lower reduces server load
    let query = //construct search URL (determined from https://archive.org/advancedsearch.php)
      '///archive.org/advancedsearch.php?q=%28'
      + this.state.input + '%29%20AND%20mediatype%3A%28texts%29'
      + '%20AND%20-collection%3A%28printdisabled%29' //selects books that don't require borrowing
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
          reject(jqXHR);
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

  render() {
    return (
      <div>
        <h1>Search The Internet Archive</h1>
        <p>
          Be warned! These books can be very large in size, as they consist of many image
          files. If you're concerned about conserving storage space, consider only
          downloading books with small page counts.
        </p>
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
