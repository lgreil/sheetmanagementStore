import { Module } from "@nestjs/common";
// Comment out or remove the import for @nestjs/config until you install it
// import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from "./prisma/prisma.module";
import { StueckeModule } from "./stuecke/stuecke.module";
import { PersonenModule } from "./personen/personen.module";
import { StueckeRepository } from "./repositories/stuecke.repository";
import { PersonenRepository } from "./repositories/personen.repository";

@Module({
  imports: [
    // Comment out ConfigModule usage until the package is installed
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    PrismaModule,
    StueckeModule,
    PersonenModule,
  ],
  providers: [StueckeRepository, PersonenRepository],
})
export class AppModule {}
