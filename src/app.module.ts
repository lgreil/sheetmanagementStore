import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { PersonenModule } from './personen/personen.module';
import { StueckeModule } from './stuecke/stuecke.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
    }),
    StueckeModule,
    PersonenModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
