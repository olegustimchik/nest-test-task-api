import { Module } from '@nestjs/common'
import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { DrizzleModule } from '@/drizzleModule/drizzle.module'
import { JwtAuthModule } from '@/jwt/jwt.module'
import { UsersModule } from '@/users/users.module'

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService, NotesModule],
  imports: [DrizzleModule, JwtAuthModule, UsersModule],
})
export class NotesModule {}
