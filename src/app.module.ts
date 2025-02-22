import { Module } from '@nestjs/common';
import {  StueckeController } from './app.controller';
import { AppService } from './app.service';
import { PersonenModule } from './personen/personen.module';
import { StueckeModule } from './stuecke/stuecke.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [StueckeModule, PersonenModule],
  controllers: [ StueckeController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

