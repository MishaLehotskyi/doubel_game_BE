import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { VrfService } from './vrf.service';
import { TicketSecretGuard } from '../ticket/ticket-secret.guard';

@Controller('vrf')
export class VrfController {
  constructor(private readonly vrfService: VrfService) {}

  @Post('request')
  @UseGuards(TicketSecretGuard)
  request(@Query('nativePayment') nativePayment: string) {
    return this.vrfService.requestRandom(nativePayment === 'true');
  }
}
