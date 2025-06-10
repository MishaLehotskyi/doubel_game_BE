import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameType } from '@prisma/client';
import { CreateGameDto } from './create-game.dto';
import { GameGateway } from './game.gateway';
import { VrfService } from '../vrf/vrf.service';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private readonly gameGateway: GameGateway,
    private vrf: VrfService,
  ) {}

  async getLatestByType(type: GameType) {
    return this.prisma.game.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
      include: {
        tickets: true,
      },
    });
  }

  async create(dto: CreateGameDto) {
    return this.prisma.game.create({
      data: {
        type: dto.type,
        status: 'open',
        winners: [],
      },
    });
  }

  async applyRandomNumber(
    number: string,
    transactionHash: string,
    isMega = false,
  ) {
    let game;
    if (isMega) {
      game = await this.findEligibleGame('MEGA');
    } else {
      game = await this.findEligibleGame('MINI');

      if (!game) {
        game = await this.findEligibleGame('STANDARD');
      }
    }

    if (!game) {
      return;
    }

    const previousWinners = game.winners as {
      number: string;
      transactionHash: string;
    }[];

    const updatedWinners = [...previousWinners, { number, transactionHash }];

    let newStatus: 'first_number' | 'second_number' | 'finished' = 'finished';
    if (updatedWinners.length === 1) newStatus = 'first_number';
    else if (updatedWinners.length === 2) newStatus = 'second_number';

    await this.prisma.game.update({
      where: { id: game.id },
      data: {
        winners: updatedWinners,
        status: newStatus,
      },
    });

    this.gameGateway.emitGameStatusChange(
      game.id,
      newStatus,
      number,
      updatedWinners.length - 1,
      transactionHash,
    );

    if (newStatus !== 'finished') {
      await this.vrf.requestRandom(false, isMega);
    }
  }

  private async findEligibleGame(type: 'MINI' | 'STANDARD' | 'MEGA') {
    return this.prisma.game
      .findFirst({
        where: {
          type,
          status: {
            not: 'open',
          },
        },
        orderBy: { createdAt: 'desc' },
        include: { tickets: true },
      })
      .then((game) => {
        if (!game) return null;
        const winners = Array.isArray(game.winners) ? game.winners : [];
        const has10Tickets = game.tickets.length >= 10;
        const hasLessThan3Winners = winners.length < 3;
        return has10Tickets && hasLessThan3Winners ? game : null;
      });
  }

  async getFinishedGames() {
    return this.prisma.game.findMany({
      where: {
        status: 'finished',
      },
      include: { tickets: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWinners({
    id,
    metamaskId1,
    payHash1,
    metamaskId2,
    payHash2,
    metamaskId3,
    payHash3,
  }: {
    id: string;
    metamaskId1: string;
    payHash1: string;
    metamaskId2: string;
    payHash2: string;
    metamaskId3: string;
    payHash3: string;
  }) {
    const game = await this.prisma.game.findUnique({
      where: { id: id },
      include: { tickets: true },
    });

    if (!game || !game.winners) return null;

    const updatedWinners = [
      { ...game.winners[0], metamaskId: metamaskId1, payHash: payHash1 },
      { ...game.winners[1], metamaskId: metamaskId2, payHash: payHash2 },
      { ...game.winners[2], metamaskId: metamaskId3, payHash: payHash3 },
    ];

    await this.prisma.game.update({
      where: { id: id },
      data: {
        winners: updatedWinners,
      },
    });
  }
}
