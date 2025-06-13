import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { TicketModule } from '../ticket/ticket.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [TicketModule, GameModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
