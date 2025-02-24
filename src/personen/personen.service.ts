import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonenDto } from './dto/create-personen.dto';
import { UpdatePersonenDto } from './dto/update-personen.dto';

@Injectable()
export class PersonenService {
    constructor(private prisma: PrismaService) {}

    create(createPersonenDto: CreatePersonenDto) {
        return this.prisma.person.create({
            data: createPersonenDto,
        });
    }

    findAll() {
        return this.prisma.person.findMany();
    }

    findOne(pid: number) {
        return this.prisma.person.findUnique({
            where: { pid },
        });
    }

    update(pid: number, updatePersonenDto: UpdatePersonenDto) {
        return this.prisma.person.update({
            where: { pid },
            data: updatePersonenDto,
        });
    }

    remove(pid: number) {
        return this.prisma.person.delete({
            where: { pid },
        });
    }

}
