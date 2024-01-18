import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { PrismaService } from './prisma.service'
import { UserService } from './user/user.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWTSECRET,
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [AppController, UserController, AuthController],
  providers: [AppService, PrismaService, UserService, AuthService, {
    provide: APP_GUARD,
    useClass: AuthGuard
  }],
})
export class AppModule {}
