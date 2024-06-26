import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Testify API",
            version: "1.0.0",
            description: "Testify API description",
        },
    },
    apis: ["src/routes/v1/*.js"], // Path to your API files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
