import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GameType } from '@prisma/client';
import { CreateGameDto } from './create-game.dto';
import { TicketSecretGuard } from '../ticket/ticket-secret.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('latest/:type')
  async getLatestGame(@Param('type') type: string) {
    if (!['MINI', 'STANDARD', 'MEGA'].includes(type)) {
      throw new BadRequestException('Invalid game type');
    }

    return this.gameService.getLatestByType(type as GameType);
  }

  @Post()
  @UseGuards(TicketSecretGuard)
  create(@Body() dto: CreateGameDto) {
    return this.gameService.create(dto);
  }

  @Post('apply-random')
  @UseGuards(TicketSecretGuard)
  applyRandom(
    @Body() body: { number: string; transactionHash: string; isMega: boolean },
  ) {
    return this.gameService.applyRandomNumber(
      body.number,
      body.transactionHash,
      body.isMega,
    );
  }
}
