import React from 'react';
import { getLibrary } from '../scripts/general.js';

function LibraryItems(props) {
  if(props.loading) {
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
      loading: true //set 'false' once library loaded from indexedDB
    };
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
    return (
      <div>
        <h1>Your Library</h1>
        <hr />
        <LibraryItems
          bookData={this.state.bookData}
          loading={this.state.loading}
        />
      </div>
    )
  }
}

export default Home;