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
  @Post('transfer')
  handleWebhook(
    @Req() req: Request,
    @Headers('x-alchemy-signature') signature: string,
    @Res() res: Response,
  ) {
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
    console.log('✅ Валидная подпись. Данные:', parsed);

    return res.sendStatus(200);
  }
}
