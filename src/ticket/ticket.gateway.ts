import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // или укажи свой домен
  },
})
export class TicketGateway {
  @WebSocketServer()
  server: Server;

  emitNewTicket(ticket: any) {
    this.server.emit('new-ticket', ticket);
  }
}
