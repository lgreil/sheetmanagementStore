import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { Person, Prisma } from '@prisma/client';

@Injectable()
export class PersonenRepository extends BaseRepository<Person> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(): Promise<Person[]> {
    return this.prisma.person.findMany();
  }

  async findById(id: number): Promise<Person | null> {
    return this.prisma.person.findUnique({
      where: { pid: id }
    });
  }

  async create(data: Prisma.PersonCreateInput): Promise<Person> {
    return this.prisma.person.create({
      data
    });
  }

  async update(id: number, data: Prisma.PersonUpdateInput): Promise<Person> {
    return this.prisma.person.update({
      where: { pid: id },
      data
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.person.delete({
      where: { pid: id }
    });
  }

  async findOrCreate(data: { name: string; vorname: string }): Promise<Person> {
    return this.prisma.person.upsert({
      where: {
        name_vorname_unique: {
          name: data.name,
          vorname: data.vorname
        }
      },
      update: {},
      create: data
    });
  }
} 