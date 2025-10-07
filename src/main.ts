import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WinstonLogger } from './common/logger/logger'
import * as dotenv from 'dotenv'
import { AllExceptionFilter } from './common/filters/all-exception.filter'
import { ZodValidationPipe } from 'nestjs-zod'

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
  const port = process.env.PORT || 3000
  await app.listen(port)
  winstonLogger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  )
}

bootstrap()
