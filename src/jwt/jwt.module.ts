import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { AuthGuard } from './auth.guard'
import { DrizzleModule } from '@/drizzleModule/drizzle.module'
import { UsersModule } from '@/users/users.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
    DrizzleModule,
    forwardRef(() => UsersModule),
  ],
  exports: [JwtModule, AuthGuard],
  providers: [AuthGuard],
})
export class JwtAuthModule {}
