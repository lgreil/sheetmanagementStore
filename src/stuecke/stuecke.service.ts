import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('stuecke')
@Injectable()
export default class StueckeService {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: 'Create a new Stück' })
  @ApiResponse({
    status: 201,
    description: 'The Stück has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(createStueckeDto: CreateStueckeDto) {
    // To be implemented: Logic for handling composers and arrangers
    const { ...data } = createStueckeDto;

    const stuecke = await this.prisma.stuecke.create({
      data: {
        ...data,
        // To be implemented: Logic for handling composers and arrangers
      },
      include: {
        // To be implemented: Logic for including composers and arrangers
      },
    });
    return this.formatStuecke(stuecke);
  }

  @ApiOperation({ summary: 'Get all Stücke' })
  @ApiResponse({ status: 200, description: 'Return all Stücke.' })
  async findAll() {
    const stuecke = await this.prisma.stuecke.findMany({
      include: {
        // To be implemented: Logic for including composers and arrangers
      },
    });
    return stuecke.map((st) => this.formatStuecke(st));
  }

  @ApiOperation({ summary: 'Get a Stück by ID' })
  @ApiResponse({ status: 200, description: 'Return the Stück.' })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async findOne(id: number) {
    const stuecke = await this.prisma.stuecke.findUnique({
      where: { stid: id },
      include: {
        // To be implemented: Logic for including composers and arrangers
      },
    });
    if (!stuecke) {
      throw new NotFoundException(`Stück with id ${id} not found`);
    }
    return this.formatStuecke(stuecke);
  }

  @ApiOperation({ summary: 'Update a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async update(id: number, updateStueckeDto: UpdateStueckeDto) {
    // To be implemented: Logic for handling composers and arrangers
    const { ...data } = updateStueckeDto;

    const existing = await this.prisma.stuecke.findUnique({
      where: { stid: id },
    });
    if (!existing) {
      throw new NotFoundException(`Stück with id ${id} not found`);
    }

    await this.prisma.komponiert.deleteMany({ where: { stid: id } });
    await this.prisma.arrangiert.deleteMany({ where: { stid: id } });
    const updatedStuecke = await this.prisma.stuecke.update({
      where: { stid: id },
      data: {
        ...data,
        // To be implemented: Logic for handling composers and arrangers
      },
      include: {
        // To be implemented: Logic for including composers and arrangers
      },
    });

    return this.formatStuecke(updatedStuecke);
  }

  @ApiOperation({ summary: 'Delete a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async remove(id: number) {
    // To be implemented: Logic for deleting composers and arrangers
    await this.prisma.komponiert.deleteMany({ where: { stid: id } });
    await this.prisma.arrangiert.deleteMany({ where: { stid: id } });

    return this.prisma.stuecke.delete({ where: { stid: id } });
  }

  private formatStuecke(stuecke: any) {
    return {
      stid: stuecke.stid,
      name: stuecke.name,
      genre: stuecke.genre,
      jahr: stuecke.jahr,
      schwierigkeit: stuecke.schwierigkeit,
      isdigitalisiert: stuecke.isdigitalisiert,
      // To be implemented: Logic for formatting composers and arrangers
    };
  }
}
