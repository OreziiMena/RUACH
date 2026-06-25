/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserContract } from '@/contracts/user';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends UserContract {}

  interface Session {
    user: UserContract;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends UserContract {}
}
