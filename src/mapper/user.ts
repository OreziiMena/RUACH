import { UserContract } from '@/contracts/user';
import { User } from '@prisma/client';

export const userMapper = (user: User): UserContract => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  address: user.address,
  phone: user.phone,
});
