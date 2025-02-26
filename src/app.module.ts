import { Module } from '@nestjs/common';
import { StueckeController } from './app.controller';
import { AppService } from './app.service';
import { PersonenModule } from './personen/personen.module';
import { StueckeModule } from './stuecke/stuecke.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [StueckeModule, PersonenModule, PrismaModule],
  controllers: [StueckeController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

