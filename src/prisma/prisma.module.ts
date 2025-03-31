import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { withOptimize } from '@prisma/extension-optimize';

@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => {
        const optimizeApiKey = process.env.OPTIMIZE_API_KEY;
        if (!optimizeApiKey) {
          throw new Error(
            'OPTIMIZE_API_KEY is not defined in environment variables',
          );
        }
        return new PrismaClient()
          .$extends(withOptimize({ apiKey: optimizeApiKey }))
          .$extends(withAccelerate());
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
