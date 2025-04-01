import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { CreateStueckeDto } from "./dto/create-stuecke.dto";
import StueckeService, { QueryParams } from "./stuecke.service";
import { UpdateStueckeDto } from "./dto/update-stuecke.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ConvertIdNameInterceptor } from "src/interceptors/convert-id-name.interceptor";

@ApiTags("stuecke")
@Controller("stuecke")
export class StueckeController {
  constructor(private readonly stueckeService: StueckeService) {}

  @ApiOperation({ summary: "Create a new Stück" })
  @ApiResponse({
    status: 201,
    description: "The Stück has been successfully created.",
    schema: {
      type: "object",
      properties: {
        stid: { type: "number" },
        name: { type: "string" },
        genre: { type: "string", nullable: true },
        jahr: { type: "number", nullable: true },
        schwierigkeit: { type: "string", nullable: true },
        isdigitalisiert: { type: "boolean", nullable: true },
        arrangiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              person: {
                type: "object",
                properties: {
                  pid: { type: "number" },
                  name: { type: "string", nullable: true },
                  vorname: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        komponiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              person: {
                type: "object",
                properties: {
                  pid: { type: "number" },
                  name: { type: "string", nullable: true },
                  vorname: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @Post()
  async create(@Body() createStueckeDto: CreateStueckeDto) {
    return this.stueckeService.create(createStueckeDto);
  }

  @ApiOperation({
    summary: "Get all Stücke with filtering, sorting, and pagination",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page (1-100)",
    example: 10,
  })
  @ApiQuery({
    name: "name",
    required: false,
    type: String,
    description: "Filter by name (partial match)",
    example: "Symphony",
  })
  @ApiQuery({
    name: "genre",
    required: false,
    type: String,
    description: "Filter by genre",
    example: "Classical",
  })
  @ApiQuery({
    name: "isdigitalisiert",
    required: false,
    type: Boolean,
    description: "Filter by digitalization status",
    example: true,
  })
  @ApiQuery({
    name: "composerName",
    required: false,
    type: String,
    description: "Filter by composer name (partial match)",
    example: "Mozart",
  })
  @ApiQuery({
    name: "arrangerName",
    required: false,
    type: String,
    description: "Filter by arranger name (partial match)",
    example: "Bach",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["name", "genre", "jahr", "schwierigkeit"],
    description: "Field to sort by",
    example: "name",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (ascending or descending)",
    example: "asc",
  })
  @ApiResponse({
    status: 200,
    description: "Return filtered, sorted, and paginated Stücke.",
    schema: {
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stid: { type: "number" },
              name: { type: "string" },
              genre: { type: "string", nullable: true },
              jahr: { type: "number", nullable: true },
              schwierigkeit: { type: "string", nullable: true },
              isdigitalisiert: { type: "boolean", nullable: true },
              arrangiert: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    pid: { type: "number" },
                    vorname: { type: "string", nullable: true },
                    name: { type: "string", nullable: true },
                  },
                },
              },
              komponiert: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    pid: { type: "number" },
                    vorname: { type: "string", nullable: true },
                    name: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
            page: { type: "number" },
            lastPage: { type: "number" },
            limit: { type: "number" },
            filters: {
              type: "object",
              nullable: true,
              properties: {
                name: { type: "string", nullable: true },
                genre: { type: "string", nullable: true },
                isdigitalisiert: { type: "boolean", nullable: true },
                composerName: { type: "string", nullable: true },
                arrangerName: { type: "string", nullable: true },
              },
            },
            sorting: {
              type: "object",
              nullable: true,
              properties: {
                sortBy: {
                  type: "string",
                  enum: ["name", "genre", "jahr", "schwierigkeit"],
                  nullable: true,
                },
                sortOrder: {
                  type: "string",
                  enum: ["asc", "desc"],
                  nullable: true,
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @UseInterceptors(ConvertIdNameInterceptor)
  @Get()
  async findAll(@Query() queryParams?: QueryParams) {
    return this.stueckeService.findAll(queryParams);
  }

  @ApiOperation({ summary: "Get a Stück by ID" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "The ID of the Stück to retrieve",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Return the Stück.",
    schema: {
      type: "object",
      properties: {
        stid: { type: "number" },
        name: { type: "string" },
        genre: { type: "string", nullable: true },
        jahr: { type: "number", nullable: true },
        schwierigkeit: { type: "string", nullable: true },
        isdigitalisiert: { type: "boolean", nullable: true },
        arrangiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pid: { type: "number" },
              vorname: { type: "string", nullable: true },
              name: { type: "string", nullable: true },
            },
          },
        },
        komponiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pid: { type: "number" },
              vorname: { type: "string", nullable: true },
              name: { type: "string", nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Stück not found." })
  @UseInterceptors(ConvertIdNameInterceptor)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.stueckeService.findOne(+id);
  }

  @ApiOperation({ summary: "Update a Stück by ID" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "The ID of the Stück to update",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "The Stück has been successfully updated.",
    schema: {
      type: "object",
      properties: {
        stid: { type: "number" },
        name: { type: "string" },
        genre: { type: "string", nullable: true },
        jahr: { type: "number", nullable: true },
        schwierigkeit: { type: "string", nullable: true },
        isdigitalisiert: { type: "boolean", nullable: true },
        arrangiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pid: { type: "number" },
              vorname: { type: "string", nullable: true },
              name: { type: "string", nullable: true },
            },
          },
        },
        komponiert: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pid: { type: "number" },
              vorname: { type: "string", nullable: true },
              name: { type: "string", nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Stück not found." })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateStueckeDto: UpdateStueckeDto,
  ) {
    return this.stueckeService.update(+id, updateStueckeDto);
  }

  @ApiOperation({ summary: "Delete a Stück by ID" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "The ID of the Stück to delete",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "The Stück has been successfully deleted.",
    schema: {
      type: "object",
      properties: {
        stid: { type: "number" },
        name: { type: "string" },
        genre: { type: "string", nullable: true },
        jahr: { type: "number", nullable: true },
        schwierigkeit: { type: "string", nullable: true },
        isdigitalisiert: { type: "boolean", nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Stück not found." })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.stueckeService.remove(+id);
  }
}
