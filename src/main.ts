import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WinstonLogger } from './common/logger/logger'
import * as dotenv from 'dotenv'
import { AllExceptionFilter } from './common/filters/all-exception.filter'
import { ZodValidationPipe } from 'nestjs-zod'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

// Load environment variables
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })
  const winstonLogger = app.get(WinstonLogger)

  app.useLogger(winstonLogger)
  app.useGlobalPipes(new ZodValidationPipe())
  app.enableCors({
    origin: true,
    credentials: true,
  })
  app.useGlobalFilters(new AllExceptionFilter(winstonLogger))

  // Swagger OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Nest Test Task API')
    .setDescription(
      'A NestJS API for managing users and notes with authentication and authorization',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Users', 'User management and authentication endpoints')
    .addTag('Notes', 'Notes management endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT || 3000
  await app.listen(port)
  winstonLogger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  )
  winstonLogger.log(
    `API Documentation available at: http://localhost:${port}/api/docs`,
    'Bootstrap',
  )
}

bootstrap()
