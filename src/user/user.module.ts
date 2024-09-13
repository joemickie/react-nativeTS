import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule, // Provides access to PrismaService
    PassportModule, // Adds Passport authentication strategy
    JwtModule.registerAsync({
      imports: [ConfigModule], // Load environment variables from ConfigModule
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // JWT token expiration set to 1 hour
      }),
    }),
    forwardRef(() => AuthModule), // Add AuthModule 
  ],
  providers: [UserService, UserResolver, JwtStrategy], // Register services and resolvers
  exports: [UserService], // Export UserService if used in other modules
})
export class UserModule {}
