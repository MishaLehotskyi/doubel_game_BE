import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
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
