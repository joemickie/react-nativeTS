# NestJS Backend Test Task: Biometric and Standard Authentication API

## Overview

This project is a **NestJS** API service that implements user registration and authentication with both **standard email/password** and **biometric login**. It exposes a **GraphQL API** and leverages **Prisma** as the ORM with **PostgreSQL** as the database. The service includes robust security using **JWT-based authentication**, secure password handling with **bcrypt**, and support for **biometric authentication**.

The solution is designed to be highly scalable, secure, and flexible for enterprise-grade applications, adhering to industry best practices in code structure, error handling, and security.

---

## Key Features

- **User Registration** (Standard and Biometric)
- **User Authentication** (Email/Password and Biometric Login)
- **JWT Authentication**
- **Secure password hashing** with **bcrypt**
- **GraphQL API** with mutations for user operations
- **Prisma ORM** integration with PostgreSQL
- **Docker** for streamlined PostgreSQL setup
- **Unit testing** for critical registration and login processes
- **Custom exception handling** for improved security and error clarity

---

## Table of Contents

1. [Requirements](#requirements)
2. [Project Setup](#project-setup)
3. [GraphQL API Documentation](#graphql-api-documentation)
4. [Security Practices](#security-practices)
5. [Testing](#testing)
6. [Technologies Used](#technologies-used)
7. [Folder Structure](#folder-structure)
8. [Environment Variables](#environment-variables)
9. [How to Run](#how-to-run)
10. [Postman Collection](#postman-collection)

---

## Requirements

To successfully run this project, ensure you have the following tools installed:

- **Node.js** (v16.x or higher)
- **Docker** (for PostgreSQL setup)
- **npm** or **yarn**
- **Postman** (or any GraphQL client)
  
---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/joemickie/userauth-biometric.git
cd userauth-biometric
```

### 2. Install Dependencies

Install the project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```
### 3. Set up Prisma:

Initialize Prisma and create the database schema. This creates a .env file with a DATABASE_URL key. Replace the value with your PostgreSQL URL.

```bash
npx prisma init
```

### 4. Database Setup (PostgreSQL using Docker)

If you have **Docker** installed, you can easily set up the PostgreSQL instance:

```bash
docker run --name nest-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

Alternatively, if you're not using Docker, ensure you have PostgreSQL installed and configured.

### 5. Prisma ORM Setup

Run the following Prisma commands to generate the client and migrate the database schema:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Configure Environment Variables

Copy the `.env.example` file and edit the .env or create a new `.env` file.

```bash
cp .env.example .env
```

Set your database connection and JWT secret in the `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yourdb?schema=public"
JWT_SECRET="your_jwt_secret"
```

### 7. Running the Application

Once all the configurations are set up, start the application:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`.

---

## GraphQL API Documentation

### GraphQL Playground

Access the **GraphQL Playground** at `http://localhost:3000/graphql`.

### Mutations

#### 1. **User Registration**

**Mutation**: `register`

**Input**:
- `email`: `String!`
- `password`: `String!`

**Response**:
- A success message.

```graphql
mutation {
  register(email: "user@example.com", password: "password123") {
    message
  }
}
```

#### 2. **Registered User Biometric Setup**

**Mutation**: `registerWithBiometric`

**Input**:
- `email`: `String!`
- `password`: `String!`
- `biometricKey`: `String!`

**Response**:
- A success message.

```graphql
mutation {
  registerWithBiometric(email: "user@example.com", password: "password123", biometricKey: "fingerprintHash") {
    message
  }
}
```

#### 3. **Standard Login**

**Mutation**: `login`

**Input**:
- `email`: `String!`
- `password`: `String!`

**Response**:
- A JWT access token.

```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    access_token
  }
}
```

#### 4. **Biometric Login**

**Mutation**: `biometricLogin`

**Input**:
- `biometricKey`: `String!`

**Response**:
- A JWT access token.

```graphql
mutation {
  biometricLogin(biometricKey: "fingerprintHash") {
    access_token
  }
}
```

---

## Security Practices

- **Password Hashing**: Passwords are hashed using **bcrypt** before being stored in the database to prevent leakage of plaintext passwords.
- **JWT Authentication**: Secure JSON Web Tokens are used for authenticating users. Tokens are generated on login and must be provided in subsequent requests for authorization.
- **Biometric Key**: Simulated biometric key handling ensures uniqueness and secure login via biometric data.
- **Error Handling**: Custom exception handling ensures that sensitive information is never leaked through GraphQL responses.

---

## Testing

This project uses **Jest** for unit testing. Tests are focused on critical components like user registration, login (both email/password and biometric), and JWT token generation.

### Run Tests

```bash
npm run test
```

### Code Coverage

```bash
npm run test:cov
```

---

## Technologies Used

- **NestJS**: Framework for building scalable server-side applications.
- **GraphQL**: API schema language for exposing the service.
- **Prisma ORM**: Database ORM for seamless database interactions.
- **PostgreSQL**: Database solution for storing user data.
- **Docker**: Simplified database setup and management.
- **JWT**: Authentication mechanism to ensure secure login.
- **bcryptJS**: Password hashing for secure storage.
- **Jest**: Testing framework for ensuring code functionality and security.

---

## Folder Structure

```bash
src/
│
├── auth/
│   ├── model
│       ├── auth.model.ts
│   ├── service
│       ├── auth.service.ts
│   ├── strategy
│       ├── jwt.strategy.ts
│   ├── auth.module.ts
│
├── prisma/
│   ├── service
│       ├── prisma.service.ts 
│   ├── prisma.module.ts
│
├── user/
|   ├──model
│      ├── user.model.ts
|   ├── resolver
│       ├── user.resolver.ts
|   ├── sevice
│       ├── user.service.ts
│   ├── user.module.ts
│
├── app.module.ts
├── main.ts
```

---

## Environment Variables

Ensure you have the following environment variables configured in your `.env` file:

```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
```

---

## How to Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Prisma:

```bash
npx prisma init
```

### 3. Start PostgreSQL (via Docker)

```bash
docker run --name nest-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the Application

```bash
npm run start:dev
```

### 6. Access GraphQL Playground

Navigate to `http://localhost:3000/graphql` to explore the GraphQL API.

---

## Postman Collection

For easy testing, use the following [Postman Collection](https://documenter.getpostman.com/view/30896875/2sAXqnfQUP) to interact with the API. The collection includes all GraphQL queries and mutations for registration and login processes.

---

## Conclusion

This project implements a robust, enterprise-ready authentication system using **NestJS**, **GraphQL**, and **Prisma ORM**. With its focus on scalability, security, and maintainability, it serves as a strong foundation for further development and integration into larger systems.

---