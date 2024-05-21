const swaggerJSDoc = require("swagger-jsdoc");
const apiOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Management API",
      version: "1.0.0",
      description: "Documentation",
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(apiOptions);
module.exports = swaggerSpec;
