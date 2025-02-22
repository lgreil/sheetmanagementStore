import { Module } from '@nestjs/common';
import { StueckeService } from './stuecke.service';
import { StueckeController } from './stuecke.controller';
import { PrismaModule } from '../prisma/prisma.module';  // Import PrismaModule

@Module({
    imports: [PrismaModule],  // Add PrismaModule here
    controllers: [StueckeController],
    providers: [StueckeService],
    exports: [StueckeService],  // Export so other modules can use it
})
export class StueckeModule { }
