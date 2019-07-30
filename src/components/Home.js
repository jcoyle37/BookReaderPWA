import React from 'react';
import { getLibrary } from '../scripts/general.js';
import localforage from 'localforage';

function LibraryItems(props) {
  if(props.bookData.length === 0) { //if no book data
    return (
      <span>No books downloaded to library</span>
    );
  }
  else if(props.loading) {
    return (
      <div>
        Loading...
      </div>
    );
  } else {
    return (
      <ul className='libraryBooks'>
        {props.bookData.map((book) => (
          <li key={'libraryBook_' + book.bookTitle}>
            <span>{book.bookTitle}</span>
            &nbsp;<button onClick={() => props.onOpenBook(book.identifier)}>Open</button>
          </li>
        ))}
      </ul>
    );
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'bookData': [],
      bookOpen: false,
      loading: true //set 'false' once library loaded from indexedDB
    };

    this.handleOpenBook = this.handleOpenBook.bind(this);
  }

  handleOpenBook(id) {
    localforage.getItem('ebook_' + id).then((bookData) => {
      this.setState({
        bookOpen: true
      });

      const brIframe = document.getElementById('brIframe');
      
      //wait for the iframe to load
      brIframe.addEventListener('load', function() {
        //send message via channel messaging to iFrame containing bookData
        brIframe.contentWindow.postMessage(bookData);
      });

      //todo: fix possible mutation not recommended by React
      document.getElementById('brIframe').src = 'brview.html';
    }).catch((error) => {
      console.log(error);
    });
  }

  componentDidMount() { //init
    getLibrary().then((bookData) => {
      this.setState({
        'bookData': bookData,
        loading: false
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  render() {
    if(!this.state.bookOpen) {
      return (
        <div>
          <h1>Your Library</h1>
          <hr />
          <LibraryItems
            bookData={this.state.bookData}
            loading={this.state.loading}
            onOpenBook={this.handleOpenBook}
          />
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={() => this.setState({
            bookOpen: false
          })}>Return to Library</button>
          <br />
          <iframe id="brIframe" style={{
            width: '100%',
            bottom: 28,
            position: 'fixed',
            top: 38,
            zIndex: -1
          }}></iframe>
        </div>
      )
    }
  }
}

export default Home;