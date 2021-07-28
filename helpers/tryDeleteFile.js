
const appRoot = require('app-root-path');
const unlink = require('util').promisify(require('fs').unlink);

module.exports = async (path) =>
  unlink(`${appRoot}/${path}`).catch((err) => {
    console.log(err);
  });