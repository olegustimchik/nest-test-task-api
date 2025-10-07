import { Inject, Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { notes, Note } from '../database/schema/notes.schema'
import { CreateNoteType, NoteFilterType, UpdateNoteType } from './dto/note.dto'
import { DrizzleAsyncProvider, schema } from '@/drizzleModule/drizzle.provider'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

@Injectable()
export class NotesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(userId: string, noteData: CreateNoteType): Promise<Note> {
    const [newNote] = await this.db
      .insert(notes)
      .values({
        title: noteData.title,
        content: noteData.content,
        userId,
      })
      .returning()

    return newNote
  }

  async findAll(userId: string): Promise<Note[]> {
    const userNotes = await this.db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(notes.createdAt)

    return userNotes
  }

  async findOneById(id: string): Promise<Note | null> {
    const [note] = await this.db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1)
    return note || null
  }
  async findOne(id: string, userId: string): Promise<Note> {
    const [note] = await this.db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .limit(1)

    return note
  }

  async update(id: string, updateData: UpdateNoteType): Promise<Note> {
    const [updatedNote] = await this.db
      .update(notes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning()

    return updatedNote
  }

  async remove(id: string): Promise<Array<Note>> {
    const result = await this.db
      .delete(notes)
      .where(and(eq(notes.id, id)))
      .returning()

    return result
  }

  // Admin method to get all notes (for admin purposes)
  async findAllNotes(filter: NoteFilterType): Promise<Note[]> {
    return await this.db
      .select()
      .from(notes)
      .orderBy(notes.createdAt)
      .limit(filter.limit)
      .offset(filter.page ? (filter.page - 1) * filter.limit : 0)
  }
}
