import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common'
import { NotesService } from '@/notes/notes.service'

@Injectable()
export class NotesRuleGuard implements CanActivate {
  constructor(private readonly notesService: NotesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { id } = request.params

    if (!id) {
      return false
    }
    const user = request.user

    if (!user) {
      return false
    }
    const note = await this.notesService.findOneById(id)
    console.log('note', note, user)
    if (!note || user.id !== note.userId || user.user_role !== 'admin') {
      throw new BadRequestException('Note not found')
    }
    return user.id
  }
}
