import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { hash } from 'bcrypt'
import { Public } from 'src/auth/auth.service';
import { UserNoPassword } from './user.type';
import { search } from 'superagent';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Public()
    @Get()
    getAllPendingUsers(
        @Query() query: {
            search: string
        }
    ): Promise<UserNoPassword[]> {
        const searchText = query.search || ''
        return this.userService.users({
            where: {
                is_approved: null,
                is_admin: false,
                OR: [
                    {
                        first_name: {
                            contains: searchText,
                            mode: 'insensitive'
                         }
                    },
                    {
                        last_name: {
                            contains: searchText,
                            mode: 'insensitive'
                         }
                    }
                ]
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
        @Param('is_approved') is_approved: string,
        @Res() response: Response
    ): Promise<UserNoPassword | Response> {
        const user = await this.userService.user({ id:  Number(id) })
        if (!user) {
            return response
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .send(`User doesn't exists.`);
        }
        
        const allowedValues = ['true', 'false']
        const isAllowed = allowedValues.includes(is_approved)
        if(!isAllowed) {
            return response
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .send(`"is_approved" value should only be true or false.`);
        }

        if (user.is_admin || user.is_approved !== null) {
            return response
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .send(`User has already been verified.`);
        }

        await this.userService.updateUser({
            where: { id: Number(id) },  
            data: {
                is_approved: Boolean(is_approved)
            },
        });

        return response
            .status(HttpStatus.OK)
            .send(`User has been verified.`);
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
