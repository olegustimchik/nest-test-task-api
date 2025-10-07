import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { NotesModule } from './notes/notes.module'
import { WinstonLogger } from './common/logger/logger'
import { JwtAuthModule } from './jwt/jwt.module'
import { DrizzleModule } from './drizzleModule/drizzle.module'

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
  providers: [WinstonLogger],
})
export class AppModule {}
