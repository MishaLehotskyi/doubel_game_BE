import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameGateway } from './game.gateway';
import { VrfService } from '../vrf/vrf.service';

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService, GameGateway, VrfService],
  exports: [GameService],
})
export class GameModule {}
