import localforage from 'localforage';
import $ from 'jquery';

//get base64 image. Method enables cross-origin image requests
//source: https://stackoverflow.com/a/44199382/2969615
function getDataUri(targetUrl, approxImgWidth, minImgFetchTime, maxFailedFetches) {
  let errorCount = 0; //failed image fetch count
  let delay = 0;

  return new Promise(function(resolve, reject) {
    const fetchTimeStart = parseInt(new Date().getTime());
    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
      if(xhr.status == 4 || xhr.status == 200) {
        const resDate = parseInt(new Date(xhr.getResponseHeader('Date')).getTime());

        if(resDate > fetchTimeStart) { //if not loaded from cache, compute a delay
          const fetchDuration = new Date().getTime() - fetchTimeStart;

          if(fetchDuration < minImgFetchTime)
            delay = minImgFetchTime - fetchDuration;
        }

        //interpret blob as text
        var reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result, delay);
        };
        reader.readAsDataURL(xhr.response);
      } else { //error
        reject(null);
      }
    };
    xhr.onerror = function() {
      if(errorCount <= maxFailedFetches) {
        //retry image fetch after delay
        setTimeout(() => {
          this.open('GET', proxyUrl + targetUrl + '&width=' + approxImgWidth);
          this.responseType = 'blob';
          this.send();
        }, minImgFetchTime);
      } else {
        reject(null);
      }

      errorCount++;
    }
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    xhr.open('GET', proxyUrl + targetUrl);
    xhr.responseType = 'blob';
    xhr.send();
  }).then(base64img => new Promise(resolve => setTimeout(() => resolve(base64img), delay) //delay return
  )).catch(function(err) {
    return err;
  });
}

function setLocalStorage(key, value) {
  localforage.setDriver([
    localforage.INDEXEDDB
  ]).then(function() {
    localforage.setItem(key, value).then(function(value) { //todo: test error handling here
      var displayValue = value;

      if(typeof value === 'string') {
        if(value.length > 80) displayValue = value.substr(0, 80) + "...";
      }

      console.log('Saved value using: ' + localforage.driver(), displayValue);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function removeLocalStorage(key) {
  return new Promise(function(resolve, reject) {
    localforage.removeItem(key).then(() => {
      resolve(key);
    }).catch(function(error) {
      reject(error);
    });
  }).catch(function(error) {
    console.log(error);
  });
}

function modifyLibraryList(type, key, cb) {
  localforage.getItem('booksInLibrary').then((booksInLibrary) => {
    let updatedBooksInLibrary;

    if(booksInLibrary)
      updatedBooksInLibrary = booksInLibrary;
    else
      updatedBooksInLibrary = [];

    localforage.setDriver([
      localforage.INDEXEDDB
    ]).then(() => {
      if(type === 'add') {
        updatedBooksInLibrary.push(key);
      } else if(type === 'remove') {
        //filter out matching book ID
        updatedBooksInLibrary = updatedBooksInLibrary.filter((id) => id !== key);
      }
      localforage.setItem('booksInLibrary', updatedBooksInLibrary).then((value) => { //todo: test error handling here
        if(type === 'remove') 
          //if removing, send updated array back to Home.js
          cb(value);
        console.log('Saved value using: ' + localforage.driver(), value);
      });
    });
  }).catch((error) => {
    console.log(error);
  });
}

function getLibrary() {
  return new Promise(function(resolve, reject) {
    localforage.getItem('booksInLibrary').then(function(booksInLibrary) {
      //assemble array of promises to get book data
      let promiseArr = [];
      booksInLibrary.forEach(function(book) {
        promiseArr.push(localforage.getItem(book));
      });

      return Promise.all(promiseArr).then((bookData) => {
        resolve(bookData);
      });
    }).catch((error) => {
      reject(error);
    });
  });
}
  
//PWA stuff:
$(document).ready(function() {
  if ('serviceWorker' in navigator) {
    // Register a service worker hosted at the root of the
    // site using the default scope.
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Service worker registration succeeded:', registration);
    }, //catch
    function(error) {
      console.log('Service worker registration failed:', error);
    });
  } else {
    console.log('Service workers are not supported.');
  }

  let deferredPrompt;
  var btnAdd = document.getElementById('installBtn');

  //show install button for PWA
  window.addEventListener('beforeinstallprompt', function(e) {
    console.log("beforeinstallprompt fired", e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can add to home screen
    btnAdd.style.display = 'block';
  });

  btnAdd.addEventListener('click', function(e) {
    // hide our user interface that shows our A2HS button
    btnAdd.style.opacity = .5;
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
      .then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});

function stretchToBottom(selector) {
  const distFromTop = selector.offsetTop;
  selector.style.height = (window.innerHeight - distFromTop) + 'px';
}

$(window).on('resize', function() {
  const iframe = document.querySelector("#brIframe");
  
  if(iframe)
      stretchToBottom(iframe);
});


export { getDataUri, setLocalStorage, removeLocalStorage, modifyLibraryList, getLibrary, stretchToBottom }