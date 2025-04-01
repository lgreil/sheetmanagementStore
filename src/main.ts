import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";

async function bootstrap() {
  dotenv.config(); // Load the environment variables

  const app = await NestFactory.create(AppModule);

  // Add validation pipe for proper DTO validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle("Sheet Database")
    .setDescription("The Sheet Database API description")
    .setVersion("0.2")
    .addTag("sheet")
    .addBearerAuth() // Add bearer auth support for swagger
    .build();

  // Include all modules explicitly to ensure complete documentation
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    extraModels: [],
  });

  // Setup swagger with additional options
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
    },
  });

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://bachkreis.netlify.app",
      "https://bachkreis.netlify.app",
    ], // Allow requests from frontend and production over both http and https
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  });
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
