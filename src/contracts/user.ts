import { Role } from "@prisma/client";

export interface UserContract {
  id: string;
  email: string;
  name: string;
  role: Role;
  address: string | null;
  phone: string | null;
}