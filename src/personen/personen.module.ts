import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PersonenController } from "./personen.controller";
import { PersonenService } from "./personen.service";
import { PersonenRepository } from "src/repositories/personen.repository";

@Module({
  imports: [PrismaModule],
  controllers: [PersonenController],
  providers: [PersonenService, PersonenRepository],
  exports: [PersonenService],
})
export class PersonenModule {}
