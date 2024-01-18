import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserNoPassword } from './user.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserNoPassword[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        motorcycle: true,
        created_at: true,
        is_admin: true,
        is_approved: true
      }
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<UserNoPassword> {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        motorcycle: true,
        created_at: true,
        is_admin: true,
        is_approved: true
      }
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<UserNoPassword> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        motorcycle: true,
        created_at: true,
        is_admin: true,
        is_approved: true
      }
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<UserNoPassword> {
    return this.prisma.user.delete({
      where,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        motorcycle: true,
        created_at: true,
        is_admin: true,
        is_approved: true
      }
    });
  }
}