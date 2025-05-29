import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

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
}
