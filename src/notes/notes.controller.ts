import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UsePipes,
  UseGuards,
  BadRequestException,
  Put,
} from '@nestjs/common'
import { NotesService } from './notes.service'
import { CreateNoteDto, NoteFilterDto, UpdateNoteDto } from './dto/note.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from '@/jwt/auth.guard'
import { UserData } from '@/common/decorators/user-data.decorator'
import { User } from '@/database/schema/user.schema'
import { AllowBlockedGuard } from '@/common/guards/allow-blocked.guard'
import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Permissions } from '@/common/decorators/permission.decorator'

@Controller('notes')
@ActiveUser(true)
@UsePipes(ZodValidationPipe)
@UseGuards(AuthGuard, AllowBlockedGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @UserData() userData: User,
  ) {
    const note = await this.notesService.create(userData.id, createNoteDto)
    return {
      success: true,
      message: 'Note created successfully',
      data: note,
    }
  }

  @Get()
  async findAllUsersNotes(@UserData() userData: User) {
    const notes = await this.notesService.findAll(userData.id)
    return {
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    }
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Permissions(['admin'])
  async findAllNotes(@Query() noteFilterData: NoteFilterDto) {
    const notes = await this.notesService.findAllNotes(noteFilterData)
    return {
      success: true,
      message: 'All notes retrieved successfully',
      data: notes,
    }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Permissions(['user', 'admin'])
  async findOne(@Param('id') id: string, @UserData() userData: User) {
    const note = await this.notesService.findOneById(id)
    if (
      !note ||
      userData.id !== note.userId ||
      userData.user_role !== 'admin'
    ) {
      throw new BadRequestException('Note not found')
    }
    return {
      success: true,
      message: 'Note retrieved successfully',
      data: note,
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Permissions(['user', 'admin'])
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @UserData() userData: User,
  ) {
    const existingNote = await this.notesService.findOneById(id)
    if (
      !existingNote ||
      (userData.id !== existingNote.userId && userData.user_role !== 'admin')
    ) {
      throw new BadRequestException('Note not found')
    }

    const note = await this.notesService.update(id, updateNoteDto)
    return {
      success: true,
      message: 'Note updated successfully',
      data: note,
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Permissions(['user', 'admin'])
  async remove(@Param('id') id: string, @UserData() userData: User) {
    const note = await this.notesService.findOneById(id)
    if (!note) {
      throw new BadRequestException('Note not found')
    }
    if (userData.id !== note.userId || userData.user_role !== 'admin') {
      throw new BadRequestException(
        'You do not have permission to delete this note or note not found',
      )
    }

    await this.notesService.remove(id)
    return {
      success: true,
      message: 'Note deleted successfully',
    }
  }
}
