import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketGateway } from './ticket.gateway';
import { VrfService } from '../vrf/vrf.service';
import { GameService } from '../game/game.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private gateway: TicketGateway,
    private vrf: VrfService,
    private gameService: GameService,
  ) {}

  async create(dto: CreateTicketDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
      select: {
        id: true,
        status: true,
        type: true,
        winners: true,
        tickets: true,
      },
    });

    if (!game) throw new NotFoundException('Game not found');

    let ticketLimit = 0;
    switch (game.type) {
      case 'MINI':
      case 'STANDARD':
        ticketLimit = 10;
        break;
      case 'MEGA':
        ticketLimit = 100;
        break;
      default:
        throw new BadRequestException('Unknown game type');
    }

    if (game.tickets.length >= ticketLimit) {
      throw new BadRequestException('Ticket limit reached for this game');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        gameId: dto.gameId,
        metamaskId: dto.metamaskId.toLowerCase(),
      },
    });

    this.gateway.emitNewTicket(ticket);

    const totalTickets = game.tickets.length + 1;
    if (totalTickets === ticketLimit) {
      await this.vrf.requestRandom(false, ticketLimit === 100);
      await this.gameService.create({ type: game.type });
    }

    return ticket;
  }
}
