const { defineConfig } = require("cypress");
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      config.env = {
        ...process.env,
        ...config.env,
        MONGODB_URI: 'mongodb://127.0.0.1:27017',
      };
      return config;
    },
  },
});