/* eslint-disable prefer-template */
const axios = require("axios");
const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");

const stepTest = function(stepDetails) {
  cy.log(`${stepDetails.keyword} ${stepDetails.text}`);
  resolveAndRunStepDefinition.call(this, stepDetails);
};

const replaceParameterTags = (rowData, text) =>
  Object.keys(rowData).reduce(
    (value, key) => value.replace(`<${key}>`, rowData[key]),
    text
  );

const createTestFromScenario = (
  scenario,
  backgroundSection,
  featureTags,
  scenarioTags
) => {
  if (scenario.examples) {
    scenario.examples.forEach(example => {
      const exampleValues = [];

      example.tableBody.forEach((row, rowIndex) => {
        example.tableHeader.cells.forEach((header, headerIndex) => {
          exampleValues[rowIndex] = Object.assign({}, exampleValues[rowIndex], {
            [header.value]: row.cells[headerIndex].value
          });
        });
      });

      exampleValues.forEach((rowData, index) => {
        // eslint-disable-next-line prefer-arrow-callback
        const scenarioName = replaceParameterTags(rowData, scenario.name);
        describe(`${scenarioName} (example #${index + 1})`, () => {
          if (backgroundSection) {
            backgroundSection.steps.forEach(step => {
              axios
                .post("http://localhost:3000/add", {
                  keyword: step.keyword,
                  sentence: step.text,
                  scenario: `${scenarioName} (example #${index + 1})`,
                  featureTags,
                  scenarioTags
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {});

              it(step.text, function() {
                stepTest.call(this, step);
              });
            });
          }

          scenario.steps.forEach(step => {
            const newStep = Object.assign({}, step);
            newStep.text = replaceParameterTags(rowData, newStep.text);

            axios
              .post("http://localhost:3000/add", {
                keyword: newStep.keyword,
                sentence: newStep.text,
                scenario: `${scenarioName} (example #${index + 1})`,
                featureTags,
                scenarioTags
              })
              // eslint-disable-next-line no-unused-vars
              .catch(error => {});

            it(newStep.text, function() {
              stepTest.call(this, newStep);
            });
          });
        });
      });
    });
  } else {
    if (backgroundSection) {
      backgroundSection.steps.forEach(step => {
        axios
          .post("http://localhost:3000/add", {
            keyword: step.keyword,
            sentence: step.text,
            scenario: scenario.name,
            featureTags,
            scenarioTags
          })
          // eslint-disable-next-line no-unused-vars
          .catch(error => {});

        it(step.text, function() {
          stepTest.call(this, step);
        });
      });
    }

    scenario.steps.forEach(step => {
      axios
        .post("http://localhost:3000/add", {
          keyword: step.keyword,
          sentence: step.text,
          scenario: scenario.name,
          featureTags,
          scenarioTags
        })
        // eslint-disable-next-line no-unused-vars
        .catch(error => {});

      it(step.text, function() {
        stepTest.call(this, step, featureTags, scenarioTags, scenario);
      });
    });
  }
};

module.exports = {
  createTestFromScenario
};
