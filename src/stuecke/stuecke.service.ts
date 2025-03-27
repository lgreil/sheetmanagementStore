import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConvertIdNameInterceptor } from 'src/interceptors/convert-id-name.interceptor';

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
    // Using Prisma to create a new "Stück" entry
    const stuecke = await this.prisma.stuecke.create({
      data: {
        name: createStueckeDto.name, // Get the name from the DTO (CreateStueckeDto)
        genre: createStueckeDto.genre, // Get the genre from the DTO
        isdigitalisiert: createStueckeDto.isdigitalisiert, // Flag for digital status from the DTO
        arrangiert: {
          create:
            createStueckeDto.arrangerIds?.map((pid) => ({
              person: {
                connect: { pid: pid }, // Connect arrangers using their person ID (pid)
              },
            })) || [], // If no arrangers, default to empty array
        },
        komponiert: {
          create:
            createStueckeDto.composerIds?.map((pid) => ({
              person: {
                connect: { pid: pid }, // Connect composers using their person ID (pid)
              },
            })) || [], // If no composers, default to empty array
        },
      },
      include: {
        arrangiert: {
          include: {
            person: true, // Include the person details for arrangers
          },
        },
        komponiert: {
          include: {
            person: true, // Include the person details for composers
          },
        },
      },
    });

    return stuecke; // Return the created "Stück" with related composer and arranger information
  }

  @ApiOperation({ summary: 'Get a Stück by ID' })
  @ApiResponse({ status: 200, description: 'Return the Stück.' })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  @UseInterceptors(ConvertIdNameInterceptor)
  async findOne(id: number) {
    const stuecke = await this.prisma.stuecke.findUnique({
      where: { stid: id },
      include: {
        arrangiert: {
          include: {
            person: true,
          },
        },
        komponiert: {
          include: {
            person: true,
          },
        },
      },
    });
    if (!stuecke) {
      throw new NotFoundException(`Stück with id ${id} not found`);
    }
    return this.formatStuecke(stuecke); // Apply formatStuecke to the result
  }

  @ApiOperation({ summary: 'Update a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async update(id: number, updateStueckeDto: UpdateStueckeDto) {
    const { composerIds, arrangerIds, ...data } = updateStueckeDto;

    const existing = await this.prisma.stuecke.findUnique({
      where: { stid: id },
    });
    if (!existing) {
      throw new NotFoundException(`Stück with id ${id} not found`);
    }

    // Delete existing associations for composers and arrangers
    await this.prisma.komponiert.deleteMany({ where: { stid: id } });
    await this.prisma.arrangiert.deleteMany({ where: { stid: id } });

    const updatedStuecke = await this.prisma.stuecke.update({
      where: { stid: id },
      data: {
        ...data,
        arrangiert: {
          create: arrangerIds?.map((pid) => ({
            person: {
              connect: { pid },

            },
          })),
        },
        komponiert: {
          create: composerIds?.map((pid) => ({
            person: {
              connect: { pid },
            },
          })),
        },
      },
      include: {
        arrangiert: {
          include: {
            person: true,
          },
        },
        komponiert: {
          include: {
            person: true,
          },
        },
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
    await this.prisma.komponiert.deleteMany({ where: { stid: id } });
    await this.prisma.arrangiert.deleteMany({ where: { stid: id } });

    return this.prisma.stuecke.delete({ where: { stid: id } });
  }

  // Add this method to fetch all Stücke
  @UseInterceptors(ConvertIdNameInterceptor)
  async findAll() {
    const stuecke = await this.prisma.stuecke.findMany({
      include: {
        arrangiert: {
          include: {
            person: true, // Include the arrangers' details
          },
        },
        komponiert: {
          include: {
            person: true, // Include the composers' details
          },
        },
      },
    });
    return stuecke.map(this.formatStuecke); // Apply formatStuecke to each item
  }

  private formatStuecke(stuecke: {
    stid: number;
    name: string;
    genre?: string | null;
    jahr?: number | null;
    schwierigkeit?: string | null;
    isdigitalisiert?: boolean | null;
    komponiert?: {
      person: {
        pid: number;
        name: string | null;
        vorname: string | null;
      };
    }[];
    arrangiert?: {
      person: {
        pid: number;
        name: string | null;
        vorname: string | null;
      };
    }[];
  }) {
    return {
      stid: stuecke.stid,
      name: stuecke.name,
      genre: stuecke.genre,
      jahr: stuecke.jahr,
      schwierigkeit: stuecke.schwierigkeit,
      isdigitalisiert: stuecke.isdigitalisiert,
      arrangiert: stuecke.arrangiert?.map((item) => ({
        pid: item.person.pid,
        vorname: item.person.vorname,
        name: item.person.name,
      })),
      komponiert: stuecke.komponiert?.map((item) => ({
        pid: item.person.pid,
        vorname: item.person.vorname,
        name: item.person.name,
      })),
    };
  }
}

