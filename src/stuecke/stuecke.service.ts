import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('stuecke')
@Injectable()
export class StueckeService {
    constructor(private prisma: PrismaService) { }

    @ApiOperation({ summary: 'Create a new Stück' })
    @ApiResponse({ status: 201, description: 'The Stück has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async create(createStueckeDto: CreateStueckeDto) {
        const { composerIds, arrangerIds, composerNames, arrangerNames, ...data } = createStueckeDto;

        // Resolve composer and arranger relations
        const komponiertData = await this.resolvePersons(composerIds, composerNames);
        const arrangiertData = await this.resolvePersons(arrangerIds, arrangerNames);

        const stuecke = await this.prisma.stuecke.create({
            data: {
                ...data,
                komponiert: {
                    create: komponiertData.map(pid => ({ person: { connect: { pid } } })),
                },
                arrangiert: {
                    create: arrangiertData.map(pid => ({ person: { connect: { pid } } })),
                },
            },
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });

        return this.formatStuecke(stuecke);
    }

    @ApiOperation({ summary: 'Get all Stücke' })
    @ApiResponse({ status: 200, description: 'Return all Stücke.' })
    async findAll() {
        const stuecke = await this.prisma.stuecke.findMany({
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });
        return stuecke.map(st => this.formatStuecke(st));
    }

    @ApiOperation({ summary: 'Get a Stück by ID' })
    @ApiResponse({ status: 200, description: 'Return the Stück.' })
    @ApiResponse({ status: 404, description: 'Stück not found.' })
    async findOne(id: number) {
        const stuecke = await this.prisma.stuecke.findUnique({
            where: { stid: id },
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });
        if (!stuecke) {
            throw new NotFoundException(`Stück with id ${id} not found`);
        }
        return this.formatStuecke(stuecke);
    }

    @ApiOperation({ summary: 'Update a Stück by ID' })
    @ApiResponse({ status: 200, description: 'The Stück has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Stück not found.' })
    async update(id: number, updateStueckeDto: UpdateStueckeDto) {
        const { composerIds, arrangerIds, composerNames, arrangerNames, ...data } = updateStueckeDto;

        // Ensure the Stück exists
        const existing = await this.prisma.stuecke.findUnique({ where: { stid: id } });
        if (!existing) throw new NotFoundException(`Stück with id ${id} not found`);

        // Resolve composer and arranger relations
        const komponiertData = await this.resolvePersons(composerIds, composerNames);
        const arrangiertData = await this.resolvePersons(arrangerIds, arrangerNames);

        // Remove existing relations and update
        await this.prisma.komponiert.deleteMany({ where: { stid: id } });
        await this.prisma.arrangiert.deleteMany({ where: { stid: id } });

        const updatedStuecke = await this.prisma.stuecke.update({
            where: { stid: id },
            data: {
                ...data,
                komponiert: {
                    create: komponiertData.map(pid => ({ person: { connect: { pid } } })),
                },
                arrangiert: {
                    create: arrangiertData.map(pid => ({ person: { connect: { pid } } })),
                },
            },
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });

        return this.formatStuecke(updatedStuecke);
    }

    @ApiOperation({ summary: 'Delete a Stück by ID' })
    @ApiResponse({ status: 200, description: 'The Stück has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Stück not found.' })
    async remove(id: number) {
        // Clean up join table entries first
        await this.prisma.komponiert.deleteMany({ where: { stid: id } });
        await this.prisma.arrangiert.deleteMany({ where: { stid: id } });

        return this.prisma.stuecke.delete({ where: { stid: id } });
    }

    // Helper function to resolve persons from IDs or names
    private async resolvePersons(ids?: number[], names?: string[]): Promise<number[]> {
        let personIds: number[] = [];

        if (ids) {
            personIds.push(...ids);
        }

        if (names) {
            const createdOrFoundPersons = await Promise.all(
                names.map(async fullName => {
                    const [vorname, ...rest] = fullName.split(' ');
                    const name = rest.join(' ');

                    const person = await this.prisma.person.upsert({
                        where: { name_vorname_unique: { name, vorname } },
                        update: {},
                        create: { name, vorname },
                    });

                    return person.pid;
                })
            );
            personIds.push(...createdOrFoundPersons);
        }

        return personIds;
    }

    // Helper method to transform the returned data into the desired format.
    private formatStuecke(stuecke: any) {
        return {
            stid: stuecke.stid,
            name: stuecke.name,
            genre: stuecke.genre,
            jahr: stuecke.jahr,
            schwierigkeit: stuecke.schwierigkeit,
            isdigitalisiert: stuecke.isdigitalisiert,
            composer_names: stuecke.komponiert?.map(
                k => `${k.person.vorname || ''} ${k.person.name || ''}`.trim(),
            ),
            arranger_names: stuecke.arrangiert?.map(
                a => `${a.person.vorname || ''} ${a.person.name || ''}`.trim(),
            ),
        };
    }
}
