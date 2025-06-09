import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketSecretGuard } from './ticket-secret.guard';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(TicketSecretGuard)
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }
}
