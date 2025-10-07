import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HashService {
  constructor() {}
  async hashPassword(str: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(str, saltRounds) // should return salt and hash. Change this next time
  }

  async comparePassword(str: string, hash: string): Promise<boolean> {
    return bcrypt.compare(str, hash)
  }
}
