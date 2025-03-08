import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PersonenService } from '../personen/personen.service';

@Injectable()
export class ConvertNameIdInterceptor implements NestInterceptor {
  constructor(
    @Inject('PersonService') private readonly personService: PersonenService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const composerNames: string[] = request.body.composer || [];
    const arrangerNames: string[] = request.body.arranger || [];

    // Ensure both composer and arranger are arrays (to prevent errors)
    if (!Array.isArray(composerNames) || !Array.isArray(arrangerNames)) {
      throw new Error('Both composer and arranger should be arrays');
    }

    // Convert composer names to IDs
    const composerIds = await Promise.all(
      composerNames.map((name: string) =>
        this.personService.findOrCreatePerson(name, 'composer'),
      ),
    );

    // Convert arranger names to IDs
    const arrangerIds = await Promise.all(
      arrangerNames.map((name: string) =>
        this.personService.findOrCreatePerson(name, 'arranger'),
      ),
    );

    // Replace names with IDs in the request body
    request.body.composer = composerIds;
    request.body.arranger = arrangerIds;

    return next.handle();
  }
}
