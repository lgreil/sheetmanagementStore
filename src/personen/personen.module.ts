import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonenController } from './personen.controller';
import { PersonenService } from './personen.service';

@Module({
    imports: [PrismaModule],
    controllers: [PersonenController],
    providers: [PersonenService],
    exports: [PersonenService],
})
export class PersonenModule {}
