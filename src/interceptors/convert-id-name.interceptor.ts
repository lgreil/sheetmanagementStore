import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { map } from 'rxjs/operators';

@Injectable()
export class ConvertIdNameInterceptor implements NestInterceptor {
  private readonly prisma = new PrismaClient();
  private readonly personService = this.prisma.person;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data) => {
        if (Array.isArray(data)) {
          // Process array of items
          return Promise.all(data.map((item) => this.convertIdToName(item)));
        } else {
          // Process single item
          return this.convertIdToName(data);
        }
      }),
    );
  }

  private async convertIdToName(
    item: Record<string, any>,
  ): Promise<Record<string, any>> {
    if (!item) return item;

    // Convert composer and arranger ids to names (reusable function for both)
    if (item.komponiert) {
      item.composers = await this.convertIdsToNames(item.komponiert);
      delete item.komponiert;
    }

    if (item.arrangiert) {
      item.arrangers = await this.convertIdsToNames(item.arrangiert);
      delete item.arrangiert;
    }

    return item;
  }

  private async convertIdsToNames(ids: any[]): Promise<string[]> {
    if (!ids || ids.length === 0) return [];

    // Collect all unique person IDs to query in one go
    const personIds = ids.map((entry) => entry.person.pid);
    const persons = await this.personService.findMany({
      where: {
        pid: {
          in: personIds,
        },
      },
    });

    // Create a map of person IDs to person objects
    const personMap = new Map(persons.map((person) => [person.pid, person]));

    // Return the names in the "Vorname Nachname" format
    return ids.map((entry) => {
      const person = personMap.get(entry.person.pid);
      if (person) {
        return `${person.vorname || ''} ${person.name}`.trim();
      }
      return ''; // Return an empty string if person not found
    });
  }
}
