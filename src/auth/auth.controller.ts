import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(
    @Body() body: { email: string; password: string; metamaskId: string },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.metamaskId,
    );
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);

    if (!result) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @Req()
    req: Request & {
      user: { userId: string; email: string; metamaskId: string };
    },
  ) {
    return req.user;
  }
}
