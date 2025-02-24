import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonenController } from './personen.controller';
import { PersonenService } from './personen.service';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [PersonenController],
    providers: [PersonenService],
    exports: [PersonenService],
})
export class PersonenModule {}
