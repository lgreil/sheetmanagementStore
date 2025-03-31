import {
  Injectable,
  NotFoundException,
  UseInterceptors,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConvertIdNameInterceptor } from 'src/interceptors/convert-id-name.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma, stuecke } from '@prisma/client';

// Define types for better type safety
export interface FilterParams {
  name?: string;
  genre?: string;
  isdigitalisiert?: boolean;
  composerName?: string;
  arrangerName?: string;
}

export interface SortParams {
  sortBy?: 'name' | 'genre' | 'jahr' | 'schwierigkeit';
  sortOrder?: 'asc' | 'desc';
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

@ApiTags('stuecke')
@Injectable()
export default class StueckeService {
  private readonly logger = new Logger(StueckeService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiOperation({ summary: 'Create a new Stück' })
  @ApiResponse({
    status: 201,
    description: 'The Stück has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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

      // Prisma Accelerate automatically caches query results
      // We don't need to manually invalidate caches as Accelerate handles it
      return stuecke;
    } catch (error) {
      this.logger.error(
        `Failed to create Stück: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get a Stück by ID' })
  @ApiResponse({ status: 200, description: 'Return the Stück.' })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  @UseInterceptors(ConvertIdNameInterceptor)
  async findOne(id: number): Promise<FormattedStuecke> {
    try {
      // With Prisma Accelerate, we can use the built-in caching
      // The query results are automatically cached based on the query parameters
      const stuecke = await this.prisma.stuecke.findUnique({
        where: { stid: id },
        include: this.getFullIncludeObject(),
        // Prisma Accelerate automatically caches this query result
      });

      if (!stuecke) {
        throw new NotFoundException(`Stück with id ${id} not found`);
      }

      return this.formatStuecke(stuecke);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error retrieving Stück ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async update(
    id: number,
    updateStueckeDto: UpdateStueckeDto,
  ): Promise<FormattedStuecke> {
    try {
      const { composerIds, arrangerIds, ...data } = updateStueckeDto;

      const existing = await this.prisma.stuecke.findUnique({
        where: { stid: id },
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
          include: this.getFullIncludeObject(),
        });
      });

      // Prisma Accelerate automatically updates its cache
      return this.formatStuecke(updatedStuecke);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error updating Stück ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Delete a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  async remove(id: number): Promise<stuecke> {
    try {
      // Using transaction to ensure all related operations succeed or fail together
      const result = await this.prisma.$transaction(async (tx) => {
        // First delete related records to maintain referential integrity
        await tx.komponiert.deleteMany({ where: { stid: id } });
        await tx.arrangiert.deleteMany({ where: { stid: id } });

        // Then delete the main record
        return await tx.stuecke.delete({ where: { stid: id } });
      });

      // Prisma Accelerate automatically updates its cache
      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting Stück ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Get all Stücke with filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (1-100)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by name (partial match)',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    type: String,
    description: 'Filter by genre',
  })
  @ApiQuery({
    name: 'isdigitalisiert',
    required: false,
    type: Boolean,
    description: 'Filter by digitalization status',
  })
  @ApiQuery({
    name: 'composerName',
    required: false,
    type: String,
    description: 'Filter by composer name (partial match)',
  })
  @ApiQuery({
    name: 'arrangerName',
    required: false,
    type: String,
    description: 'Filter by arranger name (partial match)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'genre', 'jahr', 'schwierigkeit'],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (ascending or descending)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return filtered, sorted, and paginated Stücke.',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            lastPage: { type: 'number' },
            limit: { type: 'number' },
            filters: { type: 'object' },
            sorting: { type: 'object' },
          },
        },
      },
    },
  })
  @UseInterceptors(ConvertIdNameInterceptor)
  async findAll(
    queryParams?: QueryParams,
  ): Promise<PaginatedResponse<FormattedStuecke>> {
    try {
      // Validate pagination parameters
      const page = this.validatePageParam(queryParams?.page);
      const limit = this.validateLimitParam(queryParams?.limit);
      const skip = (page - 1) * limit;

      const filters: FilterParams = {
        name: queryParams?.name,
        genre: queryParams?.genre,
        isdigitalisiert: queryParams?.isdigitalisiert,
        composerName: queryParams?.composerName,
        arrangerName: queryParams?.arrangerName,
      };

      const sorting: SortParams = {
        sortBy: queryParams?.sortBy,
        sortOrder: queryParams?.sortOrder || 'asc',
      };

      const where = this.buildWhereClause(filters);
      const orderBy = this.buildOrderByClause(sorting);

      // Prisma Accelerate will automatically cache this query
      // Note: Using two separate queries is more efficient with Accelerate
      // as each can be cached and reused independently

      // First query: Get total count
      const countResult = await this.prisma.stuecke.count({ where });

      // Second query: Get paginated results
      const stuecke = await this.prisma.stuecke.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: this.getFullIncludeObject(),
      });

      const formattedData: FormattedStuecke[] = stuecke.map((item) =>
        this.formatStuecke(item),
      );
      const lastPage = Math.ceil(countResult / limit);

      const response: PaginatedResponse<FormattedStuecke> = {
        data: formattedData,
        meta: {
          total: countResult,
          page,
          lastPage,
          limit,
          filters:
            Object.keys(filters).filter(
              (k) => filters[k as keyof FilterParams] !== undefined,
            ).length > 0
              ? filters
              : undefined,
          sorting: sorting.sortBy ? sorting : undefined,
        },
      };

      return response;
    } catch (error) {
      this.logger.error(
        `Error retrieving Stücke list: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Validates the page parameter to ensure it's a positive integer
   */
  private validatePageParam(page?: number): number {
    if (page === undefined) return 1;
    const parsedPage = Number(page);
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    return parsedPage;
  }

  /**
   * Validates the limit parameter to ensure it's within acceptable range
   */
  private validateLimitParam(limit?: number): number {
    if (limit === undefined) return 10;
    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    return parsedLimit;
  }

  /**
   * Builds the where clause for database queries based on filters
   */
  private buildWhereClause(filters: FilterParams): Prisma.stueckeWhereInput {
    const where: Prisma.stueckeWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.genre) {
      where.genre = { equals: filters.genre };
    }

    if (filters.isdigitalisiert !== undefined) {
      where.isdigitalisiert = { equals: filters.isdigitalisiert };
    }

    if (filters.composerName) {
      where.komponiert = {
        some: {
          person: {
            OR: [
              { name: { contains: filters.composerName, mode: 'insensitive' } },
              {
                vorname: {
                  contains: filters.composerName,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      };
    }

    if (filters.arrangerName) {
      where.arrangiert = {
        some: {
          person: {
            OR: [
              { name: { contains: filters.arrangerName, mode: 'insensitive' } },
              {
                vorname: {
                  contains: filters.arrangerName,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      };
    }

    return where;
  }

  /**
   * Returns a consistent include object for Prisma queries
   */
  private getFullIncludeObject() {
    return {
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
    };
  }

  /**
   * Builds the orderBy clause for database queries based on sorting parameters
   */
  private buildOrderByClause(
    sorting: SortParams,
  ): Prisma.stueckeOrderByWithRelationInput {
    if (!sorting.sortBy) {
      return { name: 'asc' };
    }

    const direction = sorting.sortOrder === 'desc' ? 'desc' : 'asc';

    switch (sorting.sortBy) {
      case 'name':
        return { name: direction };
      case 'genre':
        return { genre: direction };
      case 'jahr':
        return { jahr: direction };
      case 'schwierigkeit':
        return { schwierigkeit: direction };
      default:
        return { name: 'asc' };
    }
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
}
