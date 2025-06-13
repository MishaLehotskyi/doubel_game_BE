import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { TicketService } from '../ticket/ticket.service';
import { GameService } from '../game/game.service';

const MINI = '0x62939d201C1c4beFbA34A1DFE85f35B64bc1BcfB'.toLowerCase();
const STANDARD = '0x0A59e974890265660BC9f3c2182e5cAA9c036723'.toLowerCase();
const MEGA = '0x740B45a8E7C01AAFC6CD823e5a794F172eE9cCD0'.toLowerCase();

function isValidSignatureForStringBody(
  body: string,
  signature: string,
  signingKey: string,
): boolean {
  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  return signature === digest;
}

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly gameService: GameService,
  ) {}

  @Post('transfer')
  handleWebhook(
    @Req() req: Request,
    @Headers('x-alchemy-signature') signature: string,
    @Res() res: Response,
  ) {
    if (!req.body) {
      return res.status(HttpStatus.BAD_REQUEST).send('Error');
    }

    const rawBody = (req as any).body.toString('utf8');
    const signingKey = process.env.ALCHEMY_SIGNING_KEY;

    const valid = isValidSignatureForStringBody(
      rawBody,
      signature,
      signingKey as string,
    );

    if (!valid) {
      console.warn('🚨 Неверная подпись Alchemy Webhook!');
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
    }

    const parsed = JSON.parse(rawBody);

    const activities = parsed?.event?.activity || [];

    for (const act of activities) {
      const from = act.fromAddress?.toLowerCase();
      const to = act.toAddress?.toLowerCase();
      const value = Number(act.value);
      const tokenAddress = act.rawContract?.address?.toLowerCase();

      if (
        tokenAddress !==
        '0x86Aa748baC7BDe8Cd1A7bEf7236Ab4279554b6B6'.toLowerCase()
      ) {
        continue;
      }

      console.log(to === MINI, act.value);
      let gameType: 'MINI' | 'STANDARD' | 'MEGA' | null = null;

      if (to === MINI && value === 100.0) gameType = 'MINI';
      else if (to === STANDARD && value === 500.0) gameType = 'STANDARD';
      else if (to === MEGA && value === 500.0) gameType = 'MEGA';

      //if (gameType) {
      console.log(`🎟 Создание тикета: ${gameType} для ${from}`);
      //  const res = await this.gameService.getLatestByType(gameType);
      //  if (res?.id) {
      //    await this.ticketService.create({ gameId: res.id, metamaskId: from });
      //  }
      //}
    }

    return res.sendStatus(200);
  }
}
