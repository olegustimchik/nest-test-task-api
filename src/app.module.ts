import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { UsersModule } from './users/users.module'
import { NotesModule } from './notes/notes.module'
import { WinstonLogger } from './common/logger/logger'
import { JwtAuthModule } from './jwt/jwt.module'
import { DrizzleModule } from './drizzleModule/drizzle.module'
import { AuthGuard } from './jwt/auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    NotesModule,
    JwtAuthModule,
    DrizzleModule,
  ],
  controllers: [],
  providers: [
    WinstonLogger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
