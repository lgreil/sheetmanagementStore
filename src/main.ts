import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sheet Database')
    .setDescription('The Sheet Database API description')
    .setVersion('0.1')
    .addTag('sheet')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://localhost:3000', 
      'http://bachkreis.netlify.app', 
      'https://bachkreis.netlify.app'
    ], // Allow requests from frontend and production over both http and https
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
