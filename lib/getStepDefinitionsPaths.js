const glob = require("glob");
const cosmiconfig = require("cosmiconfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const { getStepDefinitionPathsFrom } = require("./getStepDefinitionPathsFrom");

const getStepDefinitionsPaths = filePath => {
  let paths = [];
  const explorer = cosmiconfig("cypress-cucumber-preprocessor-single-steps", {
    sync: true
  });
  const loaded = explorer.load();
  if (loaded && loaded.config && loaded.config.nonGlobalStepDefinitions) {
    const nonGlobalPattern = `${getStepDefinitionPathsFrom(
      filePath
    )}/**/*.+(js|ts)`;
    const commonDefinitionsPattern = `${stepDefinitionPath()}/common/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(nonGlobalPattern));
    paths = paths.concat(glob.sync(commonDefinitionsPattern));
  } else {
    const pattern = `${stepDefinitionPath()}/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(pattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
