import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Set up the testing module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(), // Mock implementation for UserService's findByEmail
            findUserByBiometricKey: jest.fn(), // Mock implementation for UserService's findUserByBiometricKey
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockJwtToken'), // Mock implementation for JwtService's sign method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should successfully validate user credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mock user with hashed password
    const mockUser = { 
      id: 1, 
      email, 
      password: hashedPassword, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

    // Verify that user credentials are validated correctly
    const result = await authService.validateUser(email, password);
    expect(result).toEqual(mockUser); // Expect the returned user to match the mocked user
  });

  it('should fail to validate user with incorrect password', async () => {
    const email = 'test@example.com';
    const password = 'wrongPassword';

    // Mock user with a different password
    const mockUser = { 
      id: 1, 
      email, 
      password: await bcrypt.hash('password123', 10), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

    // Verify that incorrect password results in validation failure
    const result = await authService.validateUser(email, password);
    expect(result).toBeNull(); // Expect no user to be returned for incorrect password
  });

  it('should generate a JWT token upon successful login', async () => {
    const mockUser = { 
      id: 1, 
      email: 'test@example.com', 
      password: 'hashedPassword', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    // Simulate login to generate a JWT token
    const jwtToken = await authService.login(mockUser);
    expect(jwtToken.access_token).toBe('mockJwtToken'); // Verify the JWT token is as expected
    expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id }); // Ensure JwtService sign method was called with correct payload
  });

  it('should authenticate user using biometric key and return JWT token', async () => {
    const biometricKey = 'validBiometricKey';
    const mockUser = { 
      id: 1, 
      email: 'test@example.com', 
      password: 'hashedPassword', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    // Mock successful retrieval of user by biometric key
    jest.spyOn(userService, 'findUserByBiometricKey').mockResolvedValue(mockUser);

    // Verify JWT token generation upon biometric login
    const jwtToken = await authService.biometricLogin(biometricKey);
    expect(jwtToken.access_token).toBe('mockJwtToken'); // Verify the JWT token is as expected
    expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id }); // Ensure JwtService sign method was called with correct payload
  });

  it('should throw an error if biometric key is invalid', async () => {
    // Simulate invalid biometric key by returning null
    jest.spyOn(userService, 'findUserByBiometricKey').mockResolvedValue(null);

    // Verify that an error is thrown for invalid biometric key
    await expect(authService.biometricLogin('invalidBiometricKey')).rejects.toThrow('Invalid biometric key'); // Expect an error to be thrown with the specified message
  });
});
