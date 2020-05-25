module.exports = {
  reporters: [
    "default",
    ["<rootDir>/kubernetes-assertions-reporter.js", {}]
  ],
  testMatch: [
    "<rootDir>/src/**/*.js"
  ]
};
