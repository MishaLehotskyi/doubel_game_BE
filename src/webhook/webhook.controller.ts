import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('webhook')
export class WebhookController {
  @Post('transfer')
  handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
  ) {
    console.log('📬 Заголовки запроса:');
    console.dir(headers, { depth: null });

    console.log('📦 Тело запроса:');
    console.dir(req.body, { depth: null });

    res.status(HttpStatus.OK).send('✅ Принято');
  }
}
