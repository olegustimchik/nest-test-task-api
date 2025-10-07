import { ConsoleLogger, Injectable } from '@nestjs/common'
import * as winston from 'winston'
import * as path from 'path'

@Injectable()
export class WinstonLogger extends ConsoleLogger {
  private readonly logger: winston.Logger

  constructor() {
    super()
    const logDir = path.join(process.cwd(), process.env.LOG_DIR || 'logs')
    console.log(`Log directory: ${logDir}`)

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`
        }),
      ),
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, 'application.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ], // should be files for each level (info, warn, error, etc.)
    })

    this.logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          //   winston.format.simple(),
        ),
      }),
    )
  }

  log(message: any, context?: string) {
    const formattedMessage = context ? `[${context}] ${message}` : message
    this.logger.info(formattedMessage)
    super.log(message, context)
  }

  createMessage(message: any, context?: string): string {
    const formattedMessage = context
      ? `[${context}] ${JSON.stringify(message)}`
      : JSON.stringify(message)
    return formattedMessage
  }

  error(message: any, trace?: string, context?: string) {
    const formattedMessage = this.createMessage(message, context)
    this.logger.error(formattedMessage, { trace })
    super.error(message, trace, context)
  }

  warn(message: any, context?: string) {
    const formattedMessage = this.createMessage(message, context)
    this.logger.warn(formattedMessage)
    super.warn(message, context)
  }

  debug(message: any, context?: string) {
    const formattedMessage = this.createMessage(message, context)
    this.logger.debug(formattedMessage)
    super.debug(message, context)
  }

  verbose(message: any, context?: string) {
    const formattedMessage = this.createMessage(message, context)
    this.logger.verbose(formattedMessage)
    super.verbose(message, context)
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta)
  }

  getWinstonLogger(): winston.Logger {
    return this.logger
  }
}
