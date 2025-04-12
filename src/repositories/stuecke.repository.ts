import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BaseRepository } from "./base.repository";
import { stuecke as Stuecke, Prisma } from "@prisma/client";
import { QueryParams } from "src/stuecke/stuecke.service";

@Injectable()
export class StueckeRepository extends BaseRepository<Stuecke> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(queryParams?: QueryParams): Promise<Stuecke[]> {
    const {
      page = 1,
      limit = 10,
      name,
      genre,
      isdigitalisiert,
      composerName,
      arrangerName,
      sortBy,
      sortOrder,
    } = queryParams || {};

    const where: Prisma.stueckeWhereInput = {
      AND: [
        name ? { name: { contains: name, mode: "insensitive" } } : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
        isdigitalisiert !== undefined ? { isdigitalisiert } : {},
        composerName
          ? {
              komponiert: {
                some: {
                  person: {
                    OR: [
                      { name: { contains: composerName, mode: "insensitive" } },
                      {
                        vorname: {
                          contains: composerName,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            }
          : {},
        arrangerName
          ? {
              arrangiert: {
                some: {
                  person: {
                    OR: [
                      { name: { contains: arrangerName, mode: "insensitive" } },
                      {
                        vorname: {
                          contains: arrangerName,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            }
          : {},
      ],
    };

    const orderBy: Prisma.stueckeOrderByWithRelationInput = sortBy
      ? {
          [sortBy]: sortOrder || "asc",
        }
      : {};

    return this.prisma.stuecke.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        komponiert: {
          include: {
            person: true,
          },
        },
        arrangiert: {
          include: {
            person: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Stuecke | null> {
    return this.prisma.stuecke.findUnique({
      where: { stid: id },
      include: {
        komponiert: {
          include: {
            person: true,
          },
        },
        arrangiert: {
          include: {
            person: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.stueckeCreateInput): Promise<Stuecke> {
    return this.prisma.stuecke.create({
      data,
      include: {
        komponiert: {
          include: {
            person: true,
          },
        },
        arrangiert: {
          include: {
            person: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.stueckeUpdateInput): Promise<Stuecke> {
    return this.prisma.stuecke.update({
      where: { stid: id },
      data,
      include: {
        komponiert: {
          include: {
            person: true,
          },
        },
        arrangiert: {
          include: {
            person: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.stuecke.delete({
      where: { stid: id },
    });
  }

  async count(queryParams?: QueryParams): Promise<number> {
    const { name, genre, isdigitalisiert, composerName, arrangerName } =
      queryParams || {};

    const where: Prisma.stueckeWhereInput = {
      AND: [
        name ? { name: { contains: name, mode: "insensitive" } } : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
        isdigitalisiert !== undefined ? { isdigitalisiert } : {},
        composerName
          ? {
              komponiert: {
                some: {
                  person: {
                    OR: [
                      { name: { contains: composerName, mode: "insensitive" } },
                      {
                        vorname: {
                          contains: composerName,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            }
          : {},
        arrangerName
          ? {
              arrangiert: {
                some: {
                  person: {
                    OR: [
                      { name: { contains: arrangerName, mode: "insensitive" } },
                      {
                        vorname: {
                          contains: arrangerName,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            }
          : {},
      ],
    };

    return this.prisma.stuecke.count({ where });
  }
}
