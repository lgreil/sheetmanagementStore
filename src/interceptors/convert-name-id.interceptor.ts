import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
//This class is respnsible for resolving composer and arranger names and converting them to IDs whenever the api is called.
//It should look up the composer and arranger names in the database and convert them to IDs.
// If a composer or arranger name is not found in the database, it should create a new entry.
// Then the ID should be replacing the name in the request body and the request should be sent to the correct api endpoint.
import { PersonenService } from '../personen/personen.service';
import { Observable } from 'rxjs/internal/Observable';

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
    const composerNames: string[] = request.body.composer;
    const arrangerNames: string[] = request.body.arranger;

    const composerIds = await Promise.all(
      composerNames.map((name: string) =>
        this.personService.findOrCreatePerson(name, 'composer'),
      ),
    );
    const arrangerIds = await Promise.all(
      arrangerNames.map((name: string) =>
        this.personService.findOrCreatePerson(name, 'arranger'),
      ),
    );

    request.body.composer = composerIds;
    request.body.arranger = arrangerIds;

    return next.handle();
  }
}
