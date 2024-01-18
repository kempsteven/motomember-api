import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService, Public } from 'src/auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Public()
    @Post('/login')
    async login(
        @Body() postData: {
            email: string,
            password: string,
        },
        @Res() response: Response
    ): Promise<Response> {
        const userJwt = await this.authService.login(
            postData.email,
            postData.password
        )

        if (!userJwt) {
            return response
                .status(HttpStatus.FORBIDDEN)
                .send('Invalid Combination.');
        }
    
        return response
            .status(HttpStatus.ACCEPTED)
            .send({
                access_token: userJwt
            });
    }
}
