const swaggerJSDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Management API",
      version: "1.0.0",
      description: "API documentation for the Finance Management API",
    },
    servers: [
      {
        url: "http://localhost:3000", // Update this to your server URL if different
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
