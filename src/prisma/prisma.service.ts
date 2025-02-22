import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async $connect(): Promise<void> {
        return super.$connect();  // Fix: Ensure it's returning a Promise
    }

    async $disconnect(): Promise<void> {
        return super.$disconnect();  // Fix: Ensure it's returning a Promise
    }
}
