import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from '../../auth/service/auth.service'; // Import AuthService for authentication logic
import { UserService } from '../service/user.service'; // Import UserService for user-related logic
import { User } from '../model/user.model'; // Import User model for type reference
import { AuthResponse } from '../../auth/model/auth.model'; // Import AuthResponse for login response
import { ConflictException, BadRequestException } from '@nestjs/common'; // Import ConflictException for user already exists error

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly authService: AuthService, // Inject AuthService for authentication functionality
    private readonly userService: UserService, // Inject UserService for user management
  ) {}

  /**
   * Register a new user with standard email and password.
   * @param email - The user's email.
   * @param password - The user's plaintext password.
   * @returns A success message indicating registration status.
   */
  @Mutation(() => String)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    try {
      const user = await this.userService.createUser(email, password);
      return `User ${user.email} registered successfully`; // Return success message
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException('Registration failed'); // Handle registration errors
    }
  }

  /**
   * Set up biometric login for an existing user.
   * @param email - The user's email.
   * @param password - The user's plaintext password for verification.
   * @param biometricKey - The user's biometric key (e.g., fingerprint hash).
   * @returns A success message indicating biometric key setup status.
   */
  @Mutation(() => String)
  async registerWithBiometric(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('biometricKey') biometricKey: string,
  ): Promise<string> {
    try {
      // Verify email and password before setting up biometric
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new BadRequestException('Invalid email or password'); // Throw if email or password is incorrect
      }

      // Check if biometric key already exists for the user
      const biometricKeys = user.biometricKeys || [];
      if (biometricKeys.includes(biometricKey)) {
        throw new BadRequestException('Biometric key already registered');
      }

      await this.userService.addBiometricKey(user.id, biometricKey); // Add new biometric key
      return `Biometric key added successfully for ${user.email}`; // Return success message
    } catch (error) {
      throw new BadRequestException('Failed to set up biometric key'); // Handle errors in biometric setup
    }
  }

  /**
   * Authenticate a user via biometric login.
   * @param biometricKey - The biometric key used for authentication.
   * @returns An AuthResponse object containing the JWT access token if successful.
   */
  @Mutation(() => AuthResponse)
  async biometricLogin(@Args('biometricKey') biometricKey: string): Promise<AuthResponse> {
    try {
      const { access_token } = await this.authService.biometricLogin(biometricKey);
      return { access_token }; // Return the JWT access token
    } catch (error) {
      throw new BadRequestException('Login failed'); // Return a generic message for security
    }
  }

  /**
   * Authenticate user via email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns An AuthResponse object containing the JWT access token if successful.
   */
  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }
      return this.authService.login(user);
    } catch (error) {
      throw new BadRequestException('Login failed');
    }
  }

  /**
   * Fetch all users from the database.
   * @returns A list of all user objects.
   */
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.findAll(); // Return a list of all users
  }

  /**
   * Fetch a user by their email address.
   * @param email - The email address of the user to fetch.
   * @returns The user object with the specified email or null if not found.
   */
  @Query(() => User, { nullable: true })
  async user(@Args('email') email: string): Promise<User | null> {
    return this.userService.findByEmail(email); // Fetch user by email
  }
}
