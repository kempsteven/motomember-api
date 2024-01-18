import { User } from "@prisma/client";

export interface UserNoPassword extends Omit<User, 'password'> {}