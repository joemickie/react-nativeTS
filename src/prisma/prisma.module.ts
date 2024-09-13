import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available globally without re-importing in other modules
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService so it's accessible in other modules
})
export class PrismaModule {}
