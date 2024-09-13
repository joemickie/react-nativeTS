import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from authorization header
      ignoreExpiration: false, // Do not allow expired tokens
      secretOrKey: configService.get('JWT_SECRET'), // Use the secret key from the .env file
    });
  }

  /**
   * Validates the JWT payload and returns the user info.
   * @param payload - The JWT payload containing user info.
   */
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email }; // Return user info for authenticated requests
  }
}
