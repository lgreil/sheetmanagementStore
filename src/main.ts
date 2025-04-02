import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Load environment variables
  const result = dotenv.config();
  if (result.error) {
    logger.warn('No .env file found, using environment variables');
  }

  // Validate required environment variables
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

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

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
