import { localforage } from 'localforage';
import $ from 'jquery';

//enable cross-origin iamge requests
//source: https://stackoverflow.com/a/44199382/2969615
var getDataUri = function (targetUrl, callback) { //todo: find better method
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    xhr.open('GET', proxyUrl + targetUrl);
    xhr.responseType = 'blob';
    xhr.send();
};

function setLocalStorage(key, value) {
    localforage.setDriver([
      localforage.INDEXEDDB,
      //localforage.WEBSQL,
      //localforage.LOCALSTORAGE
    ]).then(function() {
      localforage.setItem(key, value, function() {
        var displayValue = value;
  
        if(typeof value === 'string') {
          if(value.length > 80) displayValue = value.substr(0, 80) + "...";
        }
  
        console.log('Saved value using: ' + localforage.driver(), displayValue);
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