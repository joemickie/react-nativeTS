import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module'; // If needed, to access user services

@Module({
  imports: [
    ConfigModule, 
    PassportModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    forwardRef(() => UserModule), // Import UserModule if needed in AuthService
  ],
  providers: [AuthService, JwtStrategy], // Provide AuthService here
  exports: [AuthService], // Export AuthService to make it available in other modules
})
export class AuthModule {}
