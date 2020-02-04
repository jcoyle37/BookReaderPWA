import React from 'react';
import { getLibrary, stretchToBottom, setLocalStorage, modifyLibraryList, removeLocalStorage } from '../scripts/general.js';
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
          <li key={'libraryBook_' + book.identifier}>
            <span>{book.bookTitle}</span>
            &nbsp;<button onClick={() => props.onOpenBook(book.identifier)}>Open</button>
            &nbsp;<button onClick={() => props.onExportBook(book.identifier)}>Export</button>
            &nbsp;<button onClick={() => props.onDeleteBook(book.identifier)}>Delete</button>
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
    this.handleDeleteBook = this.handleDeleteBook.bind(this);
    this.handleImportBook = this.handleImportBook.bind(this);
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
        brIframe.contentWindow.postMessage(bookData, window.location.origin);
      });

      stretchToBottom(brIframe);
    }).catch((error) => {
      console.log(error);
    });
  }

  handleExportBook(id) {
    localforage.getItem('ebook_' + id).then((bookData) => {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + JSON.stringify(bookData));
      element.setAttribute('download', bookData.identifier + '.arcOrgBk');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }).catch((error) => {
      console.log(error);
    });
  }

  handleDeleteBook(id) {
    let confirmed = window.confirm('Are you sure you want to delete ' + id + '?');
    if(confirmed) {
      const ebookKey = 'ebook_' + id;

      //function which will update bookData to reflect new library list. Relies on callback
      //from modifyLibraryList to get list state after item removal
      let newBookData = (currKeys) => {
        let updatedBookData = this.state.bookData.filter((e) => {
          return(currKeys.indexOf('ebook_' + e.identifier) !== -1);
        });

        this.setState({
          bookData: updatedBookData
        });
      };
      
      //relies on a successful removal from indexedDB before calling modifyLibraryList
      removeLocalStorage(ebookKey).then((key) => {
        modifyLibraryList('remove', key, newBookData);
      });
    }
  }

  handleImportBook(fileList) {
    const numFiles = fileList.length;
    for(var i=0; i < numFiles; i++) {
      let tmpUrl = URL.createObjectURL(fileList[i]);
      let xhr = new XMLHttpRequest();
      xhr.open('GET', tmpUrl, true);
      xhr.onreadystatechange = () => {
          if (xhr.readyState == 4 && xhr.status == 200)
          {
              const newBookData = JSON.parse(xhr.responseText);
              
              const ebookKey = 'ebook_' + newBookData.identifier;
              setLocalStorage(ebookKey, newBookData);
              modifyLibraryList('add', ebookKey);

              URL.revokeObjectURL(tmpUrl);

              var newBookDataState = this.state.bookData;
              newBookDataState.push(newBookData);
              this.setState({
                bookData: newBookDataState,
              });
          }
      }
      xhr.send();
    }
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
          Inport eBook(s): <input type='file' multiple size='10'
            onChange={(e) => { this.handleImportBook(e.target.files) }}
          />
          <hr />
          <LibraryItems
            bookData={this.state.bookData}
            loading={this.state.loading}
            onOpenBook={this.handleOpenBook}
            onExportBook={this.handleExportBook}
            onDeleteBook={this.handleDeleteBook}
          />
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={() => this.setState({
            bookOpen: false
          })}>Return to Library</button>
          <iframe id='brIframe' src='./brview.html'></iframe>
        </div>
      )
    }
  }
}

export default Home;