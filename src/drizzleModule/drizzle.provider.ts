import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as notesSchema from '../database/schema/notes.schema'
import * as userSchema from '../database/schema/user.schema'
import { ConfigService } from '@nestjs/config'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider'

export const schema = { ...userSchema, ...notesSchema }

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL')
      const pool = new Pool({
        connectionString,
      })

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>
    },
  },
]
