import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { StueckeController } from './stuecke.controller';
import { StueckeService } from './stuecke.service';

@Module({
    imports: [ConfigModule],
    controllers: [StueckeController],
    providers: [StueckeService],
})
export class StueckeModule {}
