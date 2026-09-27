import swaggerUi from "swagger-ui-express";
import { swaggerComponents } from "./components";
import { swaggerPaths, swaggerSchemas } from "./modules";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Yopos Customer API",
    description: "API documentation",
    version: "1.0.0",
  },
  servers: [{ url: "/api/v1", description: "API Server" }],
  security: [{ bearerAuth: [] }],
  paths: swaggerPaths,
  components: {
    ...swaggerComponents,
    schemas: {
      ...swaggerComponents.schemas,
      ...swaggerSchemas,
    },
  },
};

const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Yopos Customer API",
};

export const setupSwagger = (app: any, basePath: string = "/api-docs") => {
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  return basePath;
};
