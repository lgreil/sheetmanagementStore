import { Module } from '@nestjs/common';
import StueckeService from './stuecke.service';
import { StueckeController } from './stuecke.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StueckeController],
  providers: [StueckeService],
  exports: [StueckeService],
})
export class StueckeModule {}
