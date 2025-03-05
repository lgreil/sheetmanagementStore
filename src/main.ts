import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sheet Database')
    .setDescription('The Sheet Database API description')
    .setVersion('0.1')
    .addTag('sheet')
    .build();

  // Ensure JSON body parsing is enabled
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors(
   {
     origin: 'http://localhost:3000', // Allow reuests from frontend
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
     allowedHeaders: 'Content-Type, Authorization',
   }
  );
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
