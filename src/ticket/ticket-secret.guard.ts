import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TicketSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedSecret = request.headers['x-ticket-secret'];
    const expectedSecret = process.env.TICKET_SECRET;

    if (!providedSecret || providedSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid secret token');
    }

    return true;
  }
}
