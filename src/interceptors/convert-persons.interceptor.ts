import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ConvertPersonsInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.method === 'GET') {
      return next.handle().pipe(
        switchMap((data) => from(this.convertIdsToNames(data)))
      );
    } else {
      if (!request.body) {
        throw new BadRequestException('Request body is missing');
      }

      return from(this.convertNamesToIds(request.body)).pipe(
        switchMap(() => next.handle())
      );
    }
  }

  private async convertNamesToIds(body: any): Promise<void> {
    const { composerNames, arrangerNames } = body;

    if (Array.isArray(composerNames) && composerNames.length) {
      body.composerIds = await this.resolveIds(composerNames);
      delete body.composerNames;
    }

    if (Array.isArray(arrangerNames) && arrangerNames.length) {
      body.arrangerIds = await this.resolveIds(arrangerNames);
      delete body.arrangerNames;
    }
  }

  private async convertIdsToNames(data: any): Promise<any> {
    if (data.composerIds) {
      data.composerNames = await this.resolveNames(data.composerIds);
      delete data.composerIds;
    }
    if (data.arrangerIds) {
      data.arrangerNames = await this.resolveNames(data.arrangerIds);
      delete data.arrangerIds;
    }
    return data;
  }

  private async resolveIds(names: string[]): Promise<number[]> {
    const personIds: number[] = [];

    for (const fullName of names) {
      const [vorname, ...rest] = fullName.trim().split(' ');
      const name = rest.join(' ') || vorname;

      const person = await this.prisma.person.upsert({
        where: { name_vorname_unique: { name, vorname } },
        update: {},
        create: { name, vorname },
      });

      personIds.push(person.pid);
    }

    return personIds;
  }

  private async resolveNames(ids: number[]): Promise<string[]> {
    const names: string[] = [];

    for (const id of ids) {
      const person = await this.prisma.person.findUnique({
        where: { pid: id },
      });

      if (person) {
        names.push(`${person.vorname} ${person.name}`);
      }
    }

    return names;
  }
}
