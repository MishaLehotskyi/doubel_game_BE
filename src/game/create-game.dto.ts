import { IsEnum } from 'class-validator';
import { GameType } from '@prisma/client';

export class CreateGameDto {
  @IsEnum(GameType)
  type: GameType;
}
