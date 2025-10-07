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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
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

@ApiTags('Notes')
@Controller('notes')
@ActiveUser(true)
@UsePipes(ZodValidationPipe)
@UseGuards(AuthGuard, AllowBlockedGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a new note for the authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Note created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Note created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user notes',
    description: 'Retrieves all notes for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Notes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notes retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              content: { type: 'string' },
              userId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all notes (Admin only)',
    description:
      'Retrieves all notes from all users. Only admins can access this endpoint.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Number of items per page (1-100)',
    example: '10',
  })
  @ApiOkResponse({
    description: 'All notes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'All notes retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              content: { type: 'string' },
              userId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get note by ID',
    description:
      'Retrieves a specific note by ID. Users can only view their own notes unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Note ID',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Note retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Note retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Note not found or access denied',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update note',
    description:
      'Updates a note. Users can only update their own notes unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Note ID to update',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Note updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Note updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Note not found or access denied',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete note',
    description:
      'Deletes a note. Users can only delete their own notes unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Note ID to delete',
    format: 'uuid',
  })
  @ApiNoContentResponse({
    description: 'Note deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Note deleted successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Note not found or permission denied',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
