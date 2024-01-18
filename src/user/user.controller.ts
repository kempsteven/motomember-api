import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { hash } from 'bcrypt'
import { Public } from 'src/auth/auth.service';
import { UserNoPassword } from './user.type';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Public()
    @Get()
    getAllPendingUsers(): Promise<UserNoPassword[]> {
        return this.userService.users({
            where: {
                is_approved: null
            }
        })
    }

    @Public()
    @Post()
    async createUser(
        @Body() postData: {
            email: string,
            first_name: string,
            last_name: string,
            motorcycle: string,
            password: string,
        },
    ): Promise<UserNoPassword | string> {
        const user = await this.userService.user({ email: postData.email })
        if (user) {
            return 'Email already exists'
        }

        const saltRounds = 10;
        const password = postData.password
        const passwordHash = await hash(password, saltRounds)
        
        const createdUser = await this.userService.createUser({
            ...postData,
            password: passwordHash
        })
        return createdUser
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() postData: {
            first_name: string,
            last_name: string,
            motorcycle: string,
        },
    ): Promise<UserNoPassword | string> {
        const user = await this.userService.user({ id:  Number(id) })
        if (!user) {
            return `User doesn't exists`
        }

        const {
            first_name,
            last_name,
            motorcycle
        } = postData;

        return this.userService.updateUser({
            where: { id: Number(id) },  
            data: {
                first_name,
                last_name,
                motorcycle
            },
          });
    }

    @Public()
    @Put(':id/verify/:is_approved')
    async approveUser(
        @Param('id') id: string,
        @Param('is_approved') is_approved: 'true' | 'false',
    ): Promise<UserNoPassword | string> {
        const user = await this.userService.user({ id:  Number(id) })
        if (!user) {
            return `User doesn't exists`
        }

        const isApproved = Boolean(is_approved)

        if (isApproved) {
            return this.userService.updateUser({
                where: { id: Number(id) },  
                data: {
                    is_approved: isApproved
                },
            });
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<UserNoPassword | string> {
        const user = await this.userService.user({ id:  Number(id) })
        if (!user) {
            return `User doesn't exists`
        }

        return this.userService.deleteUser({ id: Number(id) });
    }
}
