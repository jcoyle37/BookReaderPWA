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
      console.log('instantiate bookreader with', bookData);
      
      let selector = selector || '#BookReader';

      const options = {
        data: bookData.data,

        // Book title and the URL used for the book title link
        bookTitle: bookData.bookTitle,
        //bookUrlTitle: 'This is the book URL title',

        // Metadata is optional, but it is used in the info dialog
        metadata: [
          {label: 'Title', value: bookData.metadata.title},
          {label: 'Author', value: bookData.metadata.creator}
          //{label: 'Demo Info', value: 'This demo shows how one could use BookReader with their own content.'},
        ],

        // Override the path used to find UI images
        imagesBaseURL: '../BookReader/images/',

        ui: 'full', // embed, full (responsive)

        el: selector,
      };
      //Object.assign(options);
      var br = new window.BookReader(options);
      br.init();
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
          <div id="BookReader" style={{
            width: '100%',
            bottom: 28,
            position: 'fixed',
            top: 38,
            zIndex: -1
          }}></div>
        </div>
      )
    }
  }
}

export default Home;