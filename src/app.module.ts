import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PersonenModule } from './personen/personen.module';
import { StueckeModule } from './stuecke/stuecke.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [StueckeModule, PersonenModule, PrismaModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}

