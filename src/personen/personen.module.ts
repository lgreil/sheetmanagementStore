import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { PersonenController } from './personen.controller';

@Module({
    imports: [ConfigModule],
    controllers: [PersonenController],
})
export class PersonenModule {}
