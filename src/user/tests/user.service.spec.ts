import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  // Set up the testing module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should hash passwords correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mocking the Prisma service create method to return a user with hashed password
    const mockUser = { 
      id: 1, 
      email: 'test@example.com', 
      password: hashedPassword, 
      biometricKeys: [], // Updated to reflect biometricKeys as an empty array
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

    // Verify that password hashing works correctly when creating a user
    const user = await service.createUser('test@example.com', password);
    expect(await bcrypt.compare(password, user.password)).toBe(true); // Verify that the password matches the hashed password
  });

  it('should validate user login', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Mocking PrismaService's findUnique method to retrieve a user with a hashed password
    const mockUser = { 
      id: 1, 
      email, 
      password: await bcrypt.hash(password, 10), 
      biometricKeys: [], 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    // Verify that the login functionality correctly validates the user's password
    const result = await service.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, result.password);
    expect(isPasswordValid).toBe(true); // Ensure the password is correctly validated
  });

  it('should add a biometric key for a user', async () => {
    const userId = 1;
    const biometricKey = 'biometricKey123';

    const hashedBiometricKey = await bcrypt.hash(biometricKey, 10);
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      biometricKeys: [hashedBiometricKey],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mocking PrismaService's findUnique method to ensure biometric key doesn't already exist
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

    // Mocking PrismaService's update method to return a user with the new biometric key added
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

    const updatedUser = await service.addBiometricKey(userId, biometricKey);

    // Verify that the biometric key was hashed and added to the user's biometricKeys array
    expect(updatedUser.biometricKeys.length).toBe(1);
    expect(await bcrypt.compare(biometricKey, updatedUser.biometricKeys[0])).toBe(true);
  });

  it('should validate an existing biometric key', async () => {
    const userId = 1;
    const biometricKey = 'biometricKey123';
    const hashedBiometricKey = await bcrypt.hash(biometricKey, 10);

    const mockUser = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      biometricKeys: [hashedBiometricKey],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mocking PrismaService's findUnique method to return a user with an existing biometric key
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const exists = await service.biometricKeyExists(userId, biometricKey);

    // Verify that the biometric key is correctly validated as existing
    expect(exists).toBe(true);
  });

  it('should return null for non-existing biometric key', async () => {
    const biometricKey = 'nonExistingKey123';

    // Mocking PrismaService's findMany method to return no matching user
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

    const result = await service.findUserByBiometricKey(biometricKey);

    // Verify that the function returns null if no matching biometric key is found
    expect(result).toBe(null);
  });

  it('should throw ConflictException if biometric key exists for another user', async () => {
    const userId = 1;
    const biometricKey = 'biometricKey123';
    const hashedBiometricKey = await bcrypt.hash(biometricKey, 10);

    const mockUser = {
      id: userId + 1, // Different user
      email: 'test2@example.com',
      password: 'hashedPassword',
      biometricKeys: [hashedBiometricKey],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mocking PrismaService's findMany method to return another user with the same biometric key
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);

    // Expecting ConflictException to be thrown
    await expect(service.addBiometricKey(userId, biometricKey)).rejects.toThrow(ConflictException);
  });
});
