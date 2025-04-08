import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StueckeModule } from './stuecke/stuecke.module';
import { PersonenModule } from './personen/personen.module';
import { StueckeRepository } from './repositories/stuecke.repository';
import { PersonenRepository } from './repositories/personen.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StueckeModule,
    PersonenModule,
  ],
  providers: [StueckeRepository, PersonenRepository],
})
export class AppModule {}
