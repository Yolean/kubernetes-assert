
// TODO
const promFetch = require('node-fetch');
const promValue = require('node-fetch');

// The recommended approach for assert_completions is ...
// - Check test health indirectly through Prometheus
// - For example existence of some key metric of the system under test
// - Actual system specs are done in properly names .spec.js files

describe("Assert completion", () => {

  // This is quite imporant to keep up-to-date while we're learning non-interactive jest watch
  const ASSERT_FILES_MIN = 2;

  it(`Has seen at least ${ASSERT_FILES_MIN} spec files`, () => {
    // TODOOO
  });

  it("The runtime has produced metrics", () => {

  });

});
