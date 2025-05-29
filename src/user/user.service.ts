import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async createUser(email: string, password: string, metamaskId: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { metamaskId }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'User with this email or Metamask ID already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        metamaskId,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}
