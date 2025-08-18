import { Role } from "@prisma/client";


export interface UserRO {
  id: string;

  email: string;

  role: Role;

  createdAt: Date;
  
  updatedAt: Date;
}