import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';

@Injectable()
export class StueckeService {
    constructor(private prisma: PrismaService) { }

    async create(createStueckeDto: CreateStueckeDto) {
        const { composerIds, arrangerIds, ...data } = createStueckeDto;
        const stuecke = await this.prisma.stuecke.create({
            data: {
                ...data,
                // Create join records for composers
                komponiert: {
                    create: composerIds?.map(pid => ({
                        person: { connect: { pid } },
                    })),
                },
                // Create join records for arrangers
                arrangiert: {
                    create: arrangerIds?.map(pid => ({
                        person: { connect: { pid } },
                    })),
                },
            },
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });
        return this.formatStuecke(stuecke);
    }

    async findAll() {
        const stuecke = await this.prisma.stuecke.findMany({
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });
        return stuecke.map(st => this.formatStuecke(st));
    }

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

    async update(id: number, updateStueckeDto: UpdateStueckeDto) {
        const { composerIds, arrangerIds, ...data } = updateStueckeDto;
        // Update the base fields
        await this.prisma.stuecke.update({
            where: { stid: id },
            data,
        });

        // If composer IDs are provided, update composer relations:
        if (composerIds) {
            // Remove current composer relations:
            await this.prisma.komponiert.deleteMany({ where: { stid: id } });
            // Add new composer relations:
            await this.prisma.komponiert.createMany({
                data: composerIds.map(pid => ({ stid: id, pid })),
            });
        }

        // If arranger IDs are provided, update arranger relations:
        if (arrangerIds) {
            await this.prisma.arrangiert.deleteMany({ where: { stid: id } });
            await this.prisma.arrangiert.createMany({
                data: arrangerIds.map(pid => ({ stid: id, pid })),
            });
        }

        // Retrieve and return the updated record
        const updatedStuecke = await this.prisma.stuecke.findUnique({
            where: { stid: id },
            include: {
                komponiert: { include: { person: true } },
                arrangiert: { include: { person: true } },
            },
        });
        return this.formatStuecke(updatedStuecke);
    }

    async remove(id: number) {
        // Clean up join table entries first
        await this.prisma.komponiert.deleteMany({ where: { stid: id } });
        await this.prisma.arrangiert.deleteMany({ where: { stid: id } });
        return this.prisma.stuecke.delete({ where: { stid: id } });
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
            // Combine first name (vorname) and last name (name) for composers:
            composer_names: stuecke.komponiert?.map(
                k => `${k.person.vorname || ''} ${k.person.name || ''}`.trim(),
            ),
            // And for arrangers:
            arranger_names: stuecke.arrangiert?.map(
                a => `${a.person.vorname || ''} ${a.person.name || ''}`.trim(),
            ),
        };
    }
}
