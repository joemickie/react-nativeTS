import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import * as bcrypt from 'bcryptjs';  // Import bcrypt for hashing and comparing
import { User } from '../../user/model/user.model';  // Import User model for type reference
import { AuthResponse } from '../model/auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate a user's email and password.
   * @param email - The user's email.
   * @param password - The user's plaintext password.
   * @returns The user object if valid, otherwise null.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user; // Return user if password matches
    }
    return null; // Return null if credentials are invalid
  }

  /**
   * Authenticate a user via biometric key.
   * @param biometricKey - The biometric key for authentication.
   * @returns An AuthResponse object containing the JWT access token.
   * @throws BadRequestException if authentication fails.
   */
  async biometricLogin(biometricKey: string): Promise<AuthResponse> {
    const user = await this.userService.findUserByBiometricKey(biometricKey);
    if (!user) {
      throw new BadRequestException('Invalid biometric key'); // Throw if biometric key does not match
    }
    return this.login(user); // Use the login method to generate the token
  }

  /**
   * Generate a JWT token for the authenticated user.
   * @param user - The user object for which to generate the token.
   * @returns An AuthResponse object containing the JWT access token.
   */
  async login(user: User): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
