# BookReader PWA

The goal of this project is to make [Archive.org](https://archive.org/)'s eBooks available for download and offline usage with Progressive Web App technology.

Check out the [demo](https://joecoyle.net/other/BookReaderPWA/) (you may need to refresh your cache/clear site data as I update the page).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Configuration

### Enable install button for Progressive Web App

1. If hosting on your own web server, make sure you're in compliance with the [PWA checklist](https://developers.google.com/web/progressive-web-apps/checklist)
2. After building, be sure to set *"start_url"* in *public/manifest.json* to the correct path. For example, if you hosted
the contents of the build directory at *joecoyle.net/stuff/brpwa/*, *"start_url"* should be */stuff/brpwa/index.html*


## Todos
- [x] Ensure requests for leaf images don't come in too quickly to alleviate HTTP 429 errors (especially for larger books)
- [ ] Allow previously cached images to bypass request delay
- [ ] Introduce categorization of books into collections
- [ ] Allow importing collections of books
- [x] Allow deletion of books
- [ ] Improve routing to support relative paths (try hosting the page in a nested directory structure, then refreshing when on the search page. Even worse, try dragging down to refresh PWA on Android...it ain't pretty)
- [ ] Make brview.html channel messaging more robust. Currently accepts messages of any type on any port from anywhere
- [x] Make download button remain grayed out and display 'downloaded' when complete
- [ ] When loading library, check library list and if any of the values don't have corresponding keys in indexedDb, delete them from list
- [ ] For books already in library, have download button automatically grayed-out, displaying 'downloaded'
- [ ] Prevent multiple simultaneous book downloads (queue, perhaps?)
- [x] Download progress bar
- [ ] Have title reflect download progress
- [ ] Push notification when download complete
- [ ] See if there's a less workaround-y way of bypassing CORS restriction with getDataUri function in general.js

## Bugs
- [ ] When navigating from search page to library, 'No books in library' displayed briefly, then changes to the list of books
- [ ] Searching within book does not work
- [ ] If disconnected from network and searching, loads forever


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.


## License

The source code license is AGPL v3, as described in the [LICENSE.md](LICENSE.md) file.


## Acknowledgments

* Richard Caceres, Hank Bromley, Mek Karpeles, and everyone involved in the [Internet Archive Bookreader](https://openlibrary.org/dev/docs/bookreader) project
* [TylerMcGinnis.com's Free React.js Bootcamp](https://www.youtube.com/watch?v=8GXXGJRDMdQ)
* Dominik Fiala's helpful article on [generating PWA icons](https://dev.to/dominikfiala/hassle-free-pwa-icons-and-splash-screen-generation-3c24)


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
