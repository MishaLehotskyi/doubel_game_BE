import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, metamaskId: string) {
    const user = await this.userService.createUser(email, password, metamaskId);
    const payload = {
      sub: user.id,
      email: user.email,
      metamaskId: user.metamaskId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) return null;
    const payload = {
      sub: user.id,
      email: user.email,
      metamaskId: user.metamaskId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendVerificationCode(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new Error('Пользователь не найден');

    const code = crypto.randomInt(100000, 999999).toString();
    const now = new Date();

    await this.userService.updateVerificationCode(email, code, now);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"DoubleGame" <admin@doubelgame.ru>',
      to: email,
      subject: 'Подтверждение почты',
      text: `Ваш код подтверждения: ${code}`,
    });

    return { success: true };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || user.emailVerified)
      throw new Error('Некорректный пользователь');

    const isExpired =
      !user.emailCodeSentAt ||
      new Date().getTime() - user.emailCodeSentAt.getTime() > 3600 * 60 * 1000;

    if (isExpired || user.emailCode !== code) {
      throw new Error('Неверный или просроченный код');
    }

    await this.userService.confirmEmail(email);

    const payload = {
      sub: user.id,
      email: user.email,
      metamaskId: user.metamaskId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
