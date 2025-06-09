import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { GameModule } from './game/game.module';
import { TicketModule } from './ticket/ticket.module';
import { VrfModule } from './vrf/vrf.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    GameModule,
    TicketModule,
    VrfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
