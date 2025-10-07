import { Module, forwardRef } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './users.controller'
import { WinstonLogger } from '../common/logger/logger'
import { DrizzleModule } from '@/drizzleModule/drizzle.module'
import { HashService } from './services/hash.services'
import { UserToResponseDataMapper } from './data-mappers/user-to-response.data-mapper'
import { JwtAuthModule } from '@/jwt/jwt.module'

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    WinstonLogger,
    HashService,
    UserToResponseDataMapper,
  ],
  exports: [UsersService, HashService],
  imports: [DrizzleModule, forwardRef(() => JwtAuthModule)],
})
export class UsersModule {}
