import {
  Injectable,
  NotFoundException,
  UseInterceptors,
  Inject,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStueckeDto } from "./dto/create-stuecke.dto";
import { UpdateStueckeDto } from "./dto/update-stuecke.dto";
import { ConvertIdNameInterceptor } from "src/interceptors/convert-id-name.interceptor";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Prisma, stuecke } from "@prisma/client";
import { StueckeRepository } from "../repositories/stuecke.repository";

// Define types for better type safety
export interface FilterParams {
  name?: string;
  genre?: string;
  isdigitalisiert?: boolean;
  composerName?: string;
  arrangerName?: string;
}

export interface SortParams {
  sortBy?: "name" | "genre" | "jahr" | "schwierigkeit";
  sortOrder?: "asc" | "desc";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface QueryParams
  extends PaginationParams,
    FilterParams,
    SortParams {}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    filters?: FilterParams;
    sorting?: SortParams;
  };
}

// Define type for formatted Stücke
export interface FormattedStuecke {
  stid: number;
  name: string;
  genre?: string | null;
  jahr?: number | null;
  schwierigkeit?: string | null;
  isdigitalisiert?: boolean | null;
  arrangiert: {
    pid: number;
    vorname: string | null;
    name: string | null;
  }[];
  komponiert: {
    pid: number;
    vorname: string | null;
    name: string | null;
  }[];
}

// Define type for Stücke with relations
export interface StueckeWithRelations extends stuecke {
  arrangiert?: {
    person: {
      pid: number;
      name: string | null;
      vorname: string | null;
    };
  }[];
  komponiert?: {
    person: {
      pid: number;
      name: string | null;
      vorname: string | null;
    };
  }[];
}

@Injectable()
export default class StueckeService {
  private readonly logger = new Logger(StueckeService.name);
  private readonly cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly stueckeRepository: StueckeRepository,
  ) {}

  private getCacheKey(id: number): string {
    return `stuecke:${id}`;
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  async create(
    createStueckeDto: CreateStueckeDto,
  ): Promise<StueckeWithRelations> {
    try {
      // Using transaction to ensure all related operations succeed or fail together
      const stuecke = await this.prisma.$transaction(async (tx) => {
        return await tx.stuecke.create({
          data: {
            name: createStueckeDto.name,
            genre: createStueckeDto.genre,
            isdigitalisiert: createStueckeDto.isdigitalisiert,
            arrangiert: {
              create:
                createStueckeDto.arrangerIds?.map((pid) => ({
                  person: {
                    connect: { pid },
                  },
                })) || [],
            },
            komponiert: {
              create:
                createStueckeDto.composerIds?.map((pid) => ({
                  person: {
                    connect: { pid },
                  },
                })) || [],
            },
          },
          include: this.getFullIncludeObject(),
        });
      });

      return stuecke;
    } catch (error) {
      this.logger.error(
        `Failed to create Stück: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @UseInterceptors(ConvertIdNameInterceptor)
  async findOne(id: number): Promise<FormattedStuecke> {
    try {
      const cacheKey = this.getCacheKey(id);
      const cached = this.getCache(cacheKey);
      if (cached) return cached;

      const stuecke = await this.prisma.stuecke.findUnique({
        where: { stid: id },
        select: {
          stid: true,
          name: true,
          genre: true,
          jahr: true,
          schwierigkeit: true,
          isdigitalisiert: true,
          arrangiert: {
            select: {
              person: {
                select: {
                  pid: true,
                  name: true,
                  vorname: true,
                },
              },
            },
          },
          komponiert: {
            select: {
              person: {
                select: {
                  pid: true,
                  name: true,
                  vorname: true,
                },
              },
            },
          },
        },
      });

      if (!stuecke) {
        throw new NotFoundException(`Stück with id ${id} not found`);
      }

      const formatted = this.formatStuecke(stuecke as any);
      this.setCache(cacheKey, formatted);
      return formatted;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error retrieving Stück ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateStueckeDto: UpdateStueckeDto,
  ): Promise<FormattedStuecke> {
    try {
      const { composerIds, arrangerIds, ...data } = updateStueckeDto;

      const existing = await this.prisma.stuecke.findUnique({
        where: { stid: id },
        select: {
          stid: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(`Stück with id ${id} not found`);
      }

      // Using transaction to ensure all related operations succeed or fail together
      const updatedStuecke = await this.prisma.$transaction(async (tx) => {
        // Delete existing associations
        await tx.komponiert.deleteMany({ where: { stid: id } });
        await tx.arrangiert.deleteMany({ where: { stid: id } });

        // Update the main record and create new associations
        return await tx.stuecke.update({
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
          select: {
            stid: true,
            name: true,
            genre: true,
            jahr: true,
            schwierigkeit: true,
            isdigitalisiert: true,
            arrangiert: {
              select: {
                person: {
                  select: {
                    pid: true,
                    name: true,
                    vorname: true,
                  },
                },
              },
            },
            komponiert: {
              select: {
                person: {
                  select: {
                    pid: true,
                    name: true,
                    vorname: true,
                  },
                },
              },
            },
          },
        });
      });

      return this.formatStuecke(updatedStuecke as any);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error updating Stück ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }
  async remove(id: number): Promise<stuecke> {
    try {
      // Using transaction to ensure all related operations succeed or fail together
      const result = await this.prisma.$transaction(async (tx) => {
        // First delete related records to maintain referential integrity
        await tx.komponiert.deleteMany({ where: { stid: id } });
        await tx.arrangiert.deleteMany({ where: { stid: id } });

        // Then delete the main record
        return await tx.stuecke.delete({
          where: { stid: id },
          select: {
            stid: true,
            name: true,
            genre: true,
            jahr: true,
            schwierigkeit: true,
            isdigitalisiert: true,
          },
        });
      });

      return result as any;
    } catch (error) {
      this.logger.error(
        `Error deleting Stück ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @UseInterceptors(ConvertIdNameInterceptor)
  async findAll(
    queryParams?: QueryParams,
  ): Promise<PaginatedResponse<FormattedStuecke>> {
    try {
      const [stuecke, total] = await Promise.all([
        this.stueckeRepository.findAll(queryParams),
        this.stueckeRepository.count(queryParams),
      ]);

      const { page = 1, limit = 10 } = queryParams || {};
      const lastPage = Math.ceil(total / limit);

      const formattedData: FormattedStuecke[] = stuecke.map((item) =>
        this.formatStuecke(item as any),
      );

      return {
        data: formattedData,
        meta: {
          total,
          page,
          lastPage,
          limit,
          filters: this.extractFilters(queryParams),
          sorting: this.extractSorting(queryParams),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving Stücke list: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Returns a consistent include object for Prisma queries
   */
  private getFullIncludeObject() {
    return {
      arrangiert: {
        select: {
          person: {
            select: {
              pid: true,
              name: true,
              vorname: true,
            },
          },
        },
      },
      komponiert: {
        select: {
          person: {
            select: {
              pid: true,
              name: true,
              vorname: true,
            },
          },
        },
      },
    };
  }

  /**
   * Formats a Stück entity with its relations for API response
   */
  private formatStuecke(stuecke: StueckeWithRelations): FormattedStuecke {
    return {
      stid: stuecke.stid,
      name: stuecke.name,
      genre: stuecke.genre,
      jahr: stuecke.jahr,
      schwierigkeit: stuecke.schwierigkeit,
      isdigitalisiert: stuecke.isdigitalisiert,
      arrangiert:
        stuecke.arrangiert?.map((item) => ({
          pid: item.person.pid,
          vorname: item.person.vorname,
          name: item.person.name,
        })) || [],
      komponiert:
        stuecke.komponiert?.map((item) => ({
          pid: item.person.pid,
          vorname: item.person.vorname,
          name: item.person.name,
        })) || [],
    };
  }

  private extractFilters(queryParams?: QueryParams) {
    if (!queryParams) return undefined;
    const { name, genre, isdigitalisiert, composerName, arrangerName } =
      queryParams;
    const filters: any = {};
    if (name) filters.name = name;
    if (genre) filters.genre = genre;
    if (isdigitalisiert !== undefined)
      filters.isdigitalisiert = isdigitalisiert;
    if (composerName) filters.composerName = composerName;
    if (arrangerName) filters.arrangerName = arrangerName;
    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  private extractSorting(queryParams?: QueryParams) {
    if (!queryParams) return undefined;
    const { sortBy, sortOrder } = queryParams;
    if (!sortBy) return undefined;
    return { sortBy, sortOrder: sortOrder || "asc" };
  }
}
