//This script alters the functionality of BookReader.js

BookReader.prototype.getPageURI = function(index, reduce, rotate) {
    return bookData.leafs[index];
};
  