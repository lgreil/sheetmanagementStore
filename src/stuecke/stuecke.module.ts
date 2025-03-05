import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StueckeService } from './stuecke.service';
import { StueckeController } from './stuecke.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ResolvePersonsInterceptor } from '../interceptors/resolve-persons.interceptor';

@Module({
  imports: [PrismaModule],
  controllers: [StueckeController],
  providers: [
    StueckeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResolvePersonsInterceptor,
    },
  ],
  exports: [StueckeService],
})
export class StueckeModule {}
