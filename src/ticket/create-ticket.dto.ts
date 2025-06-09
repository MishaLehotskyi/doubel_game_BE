import { IsUUID, IsEthereumAddress } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  gameId: string;

  @IsEthereumAddress()
  metamaskId: string;
}
