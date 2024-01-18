import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
) {}

  async login (email, pass) {
    const user = await this.userService.user({ email: email })
    if (!user || (!user?.is_approved && !user?.is_admin)) {
        return false
    }

    const isPassCorrect = await compare(pass, user.password)
    if (!isPassCorrect) {
        return false
    }

    const payload = {
        sub: user.id,
        username: user.email
    }

    return this.jwtService.signAsync(payload)
  }
}