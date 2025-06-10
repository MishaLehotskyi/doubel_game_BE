import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  emitGameStatusChange(
    gameId: string,
    newStatus: string,
    number?: string,
    index?: number,
    transactionHash?: string,
  ) {
    this.server.emit('game-status-changed', {
      gameId,
      newStatus,
      number,
      index,
      transactionHash,
    });
  }
}
