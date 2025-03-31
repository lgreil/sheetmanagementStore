import { Module } from '@nestjs/common';
import StueckeService from './stuecke.service';
import { StueckeController } from './stuecke.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
    }),
  ],
  controllers: [StueckeController],
  providers: [StueckeService],
  exports: [StueckeService],
})
export class StueckeModule {}
