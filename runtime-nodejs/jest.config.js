module.exports = {
  testEnvironment: 'node',
  reporters: [
    "default",
    ["<rootDir>/jest.kubernetes-assertions-reporter.js", {}]
  ],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup-global-fetch.js"
  ]
};
