import { relations } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { notes } from './notes.schema'

export const userRolesEnum = pgEnum('user_role_enum', ['user', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  user_role: userRolesEnum('user_role').default('user').notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
