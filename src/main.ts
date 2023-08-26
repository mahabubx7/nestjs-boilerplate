import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000', '*'], // '*' is for wildcard support
    methods: 'GET, HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  };

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.APP_PORT || 5000);
}
bootstrap();
