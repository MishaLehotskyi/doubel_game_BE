import { Module } from '@nestjs/common';
import { VrfService } from './vrf.service';
import { VrfController } from './vrf.controller';

@Module({
  providers: [VrfService],
  controllers: [VrfController],
  exports: [VrfService],
})
export class VrfModule {}
