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
  Patch,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
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
import { UserData } from '@/common/decorators/user-data.decorator'
import { User } from '@/database/schema/user.schema'
import { AllowBlockedGuard } from '@/common/guards/allow-blocked.guard'
import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Permissions } from '@/common/decorators/permission.decorator'
import { NotesRuleGuard } from '@/notes/note-rules.guard'
import { generateSuccess } from '@/common/generate-success'

@ApiTags('Notes')
@Controller('notes')
@ActiveUser(true)
@UsePipes(ZodValidationPipe)
@UseGuards(AllowBlockedGuard)
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
    return generateSuccess('Note created successfully', note)
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
    return generateSuccess('Notes retrieved successfully', notes)
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
    return generateSuccess('All notes retrieved successfully', notes)
  }

  @Get(':id')
  @UseGuards(RolesGuard, NotesRuleGuard)
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
  async findOne(@Param('id') id: string) {
    const note = await this.notesService.findOneById(id)
    return generateSuccess('Note retrieved successfully', note)
  }

  @Patch(':id')
  @UseGuards(RolesGuard, NotesRuleGuard)
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
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    const note = await this.notesService.update(id, updateNoteDto)
    return generateSuccess('Note updated successfully', note)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard, NotesRuleGuard)
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
  async remove(@Param('id') id: string) {
    await this.notesService.remove(id)
    return generateSuccess('Note deleted successfully')
  }
}
