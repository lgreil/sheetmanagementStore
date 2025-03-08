import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResolvePersonsInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        if (request.method === 'GET') {
            return next.handle();
        }

        if (!request.body) {
            throw new BadRequestException('Request body is missing');
        }

        const { composerNames, arrangerNames } = request.body;

        try {
            if (Array.isArray(composerNames) && composerNames.length) {
                request.body.composerIds = await this.resolvePersons(composerNames);
                delete request.body.composerNames;
            }

            if (Array.isArray(arrangerNames) && arrangerNames.length) {
                request.body.arrangerIds = await this.resolvePersons(arrangerNames);
                delete request.body.arrangerNames;
            }

            return next.handle();
        } catch (error) {
            throw new BadRequestException('Error resolving persons: ' + error.message);
        }
    }

    private async resolvePersons(names: string[]): Promise<number[]> {
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
}
