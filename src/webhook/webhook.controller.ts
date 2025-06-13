import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { formatUnits, parseUnits, ethers } from 'ethers';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { TicketService } from '../ticket/ticket.service';
import { GameService } from '../game/game.service';

const MINI = '0x62939d201C1c4beFbA34A1DFE85f35B64bc1BcfB'.toLowerCase();
const STANDARD = '0x0A59e974890265660BC9f3c2182e5cAA9c036723'.toLowerCase();
const MEGA = '0x740B45a8E7C01AAFC6CD823e5a794F172eE9cCD0'.toLowerCase();
const DBE = '0x86Aa748baC7BDe8Cd1A7bEf7236Ab4279554b6B6'.toLowerCase();

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

function decodeVrfData(data: string): {
  requestId: string;
  randomWord: string;
} {
  const [requestId, randomWord] = ethers.AbiCoder.defaultAbiCoder().decode(
    ['uint256', 'uint256'],
    data,
  );

  return {
    requestId: requestId.toString(),
    randomWord: randomWord.toString(),
  };
}

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly gameService: GameService,
  ) {}

  @Post('transfer')
  async handleWebhook(
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
      const rawValueHex = act.rawContract?.rawValue;
      const tokenAddress = act.rawContract?.address?.toLowerCase();

      if (!rawValueHex || tokenAddress !== DBE) continue;

      const amount: bigint = BigInt(rawValueHex);
      const amountStr = formatUnits(amount, 18);

      console.log(to === MINI, amountStr);
      let gameType: 'MINI' | 'STANDARD' | 'MEGA' | null = null;

      if (to === MINI && amount === parseUnits('100', 18)) gameType = 'MINI';
      else if (to === STANDARD && amount === parseUnits('500', 18))
        gameType = 'STANDARD';
      else if (to === MEGA && amount === parseUnits('500', 18))
        gameType = 'MEGA';

      if (gameType) {
        const res = await this.gameService.getLatestByType(gameType);
        if (res?.id) {
          await this.ticketService.create({ gameId: res.id, metamaskId: from });
        }
      }
    }

    return res.sendStatus(200);
  }

  @Post('vrf')
  handleWebhookSecond(
    @Req() req: Request,
    @Headers('x-alchemy-signature') signature: string,
    @Res() res: Response,
  ) {
    if (!req.body) {
      return res.status(HttpStatus.BAD_REQUEST).send('Error');
    }

    const rawBody = (req as any).body.toString('utf8');
    const signingKey = process.env.ALCHEMY_SIGNING_KEY_2;

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

    const logs = parsed.event?.data?.block?.logs ?? [];

    for (const log of logs) {
      const topics = log.topics;
      const data = log.data;

      // Check topic0 === keccak256("RequestFulfilled(uint256,uint256)")
      if (
        topics?.[0] ===
        '0x5c69e7026b653d866b5613bb00fd8c4b0504b1cbe8db600c406faac180924d5'
      ) {
        const { requestId, randomWord } = decodeVrfData(data);
        console.log(
          `🎲 VRF fulfilled: requestId=${requestId}, randomWord=${randomWord}`,
        );
      }
    }

    return res.sendStatus(200);
  }
}
