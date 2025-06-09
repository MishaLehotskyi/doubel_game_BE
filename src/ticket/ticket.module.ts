import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketSecretGuard } from './ticket-secret.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketGateway } from './ticket.gateway';
import { VrfService } from '../vrf/vrf.service';

@Module({
  imports: [],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketSecretGuard,
    PrismaService,
    TicketGateway,
    VrfService,
  ],
})
export class TicketModule {}
