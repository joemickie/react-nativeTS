import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'; // Import NotFoundException for cases when biometric key is not found
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';  // Import bcrypt for hashing and comparing keys
import { User } from './user.model';  // Import the User model for type reference

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user in the system with hashed password.
   * @param email - The user's email.
   * @param password - Plaintext password to be hashed before storing.
   * @returns The created user object.
   * @throws ConflictException if user already exists.
   */
  async createUser(email: string, password: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing
    return this.prisma.user.create({
      data: { email, password: hashedPassword, biometricKeys: [] }, // Ensure biometricKeys is initialized as an empty array
    });
  }

  /**
   * Add a biometric key for an existing user.
   * @param userId - The user's ID.
   * @param biometricKey - The biometric key to be hashed and added.
   * @returns The updated user object.
   * @throws ConflictException if the biometric key already exists.
   */
  async addBiometricKey(userId: number, biometricKey: string): Promise<User> {
    const hashedBiometricKey = await bcrypt.hash(biometricKey, 10);

    // Check if the biometric key already exists in any user's biometric keys
    const existingUser = await this.findUserByBiometricKey(biometricKey);
    if (existingUser) {
      throw new ConflictException('Biometric key already exists for another user');
    }

    // Append the new biometric key to the array of existing biometric keys
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        biometricKeys: {
          push: hashedBiometricKey, // Add the new hashed key to the array
        },
      },
    });
  }

  /**
   * Find a user by their email address.
   * @param email - The user's email address.
   * @returns The user object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Fetch all users from the database.
   * @returns A list of all user objects.
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Find a user by their biometric key.
   * @param biometricKey - The biometric key to search for.
   * @returns The user object or null if no matching biometric key is found.
   */
  async findUserByBiometricKey(biometricKey: string): Promise<User | null> {
    const users = await this.prisma.user.findMany(); // Get all users since we can't filter hashed keys directly

    for (const user of users) {
      // Compare each stored hashed biometric key with the provided key
      for (const storedKey of user.biometricKeys || []) {
        const isMatch = await bcrypt.compare(biometricKey, storedKey);
        if (isMatch) {
          return user; // Return the user if a match is found
        }
      }
    }

    return null; // Return null if no match is found
  }

  /**
   * Check if a specific biometric key already exists for a user.
   * @param userId - The user's ID.
   * @param biometricKey - The biometric key to check.
   * @returns True if the biometric key exists, otherwise false.
   */
  async biometricKeyExists(userId: number, biometricKey: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user && user.biometricKeys) {
      for (const storedKey of user.biometricKeys) {
        if (await bcrypt.compare(biometricKey, storedKey)) {
          return true; // Return true if a match is found
        }
      }
    }

    return false; // Return false if no match is found
  }
}
