import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VerifyCodeDto } from './verify-code.dto';
import { SendCodeDto } from './send-code.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

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
  async getMe(
    @Req()
    req: Request & {
      user: { userId: string };
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        metamaskId: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendVerificationCode(dto.email);
  }

  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }
}
