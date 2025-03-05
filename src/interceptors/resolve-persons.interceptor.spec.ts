import { Test, TestingModule } from '@nestjs/testing';
import { ResolvePersonsInterceptor } from './resolve-persons.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, of } from 'rxjs';

describe('ResolvePersonsInterceptor', () => {
  let interceptor: ResolvePersonsInterceptor;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResolvePersonsInterceptor, PrismaService],
    }).compile();

    interceptor = module.get<ResolvePersonsInterceptor>(ResolvePersonsInterceptor);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through GET requests', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET' }),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };

    const result = await interceptor.intercept(context, next);
    expect(result).toBeInstanceOf(Observable);
  });

  it('should resolve persons for non-GET requests', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: { composerNames: ['John Doe'], arrangerNames: ['Jane Doe'] },
        }),
      }),
    } as ExecutionContext;

    prisma.person.upsert = jest.fn().mockResolvedValue({ pid: 1 });

    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };

    const result = await interceptor.intercept(context, next);
    expect(result).toBeInstanceOf(Observable);
  });

  it('should throw BadRequestException if request body is missing', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', body: null }),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };

    await expect(interceptor.intercept(context, next)).rejects.toThrow(BadRequestException);
  });
});
