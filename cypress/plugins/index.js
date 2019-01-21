const cucumber = require("cypress-cucumber-preprocessor-single-steps").default; // eslint-disable-line

module.exports = on => {
  on("file:preprocessor", cucumber());
};
