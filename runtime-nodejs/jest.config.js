module.exports = {
  reporters: [
    "default",
    ["<rootDir>/jest.kubernetes-assertions-reporter.js", {}]
  ],
  testMatch: [
    "<rootDir>/src/**/*.js","<rootDir>/specs/**/*.js"
  ]
};
