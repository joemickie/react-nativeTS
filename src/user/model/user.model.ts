import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: number; // The user's unique ID

  @Field()
  email: string; // The user's email

  @Field({ nullable: true }) // Password field, can be nullable if you want to avoid exposing it in some contexts
  password?: string; // Password field (make sure it's hashed before storage and not exposed in GraphQL queries)

  @Field(() => [String], { nullable: 'itemsAndList' }) // Array of biometric keys, can be nullable
  biometricKeys?: string[]; // Optional array of biometric keys

  @Field()
  createdAt: Date; // Timestamp of user creation

  @Field()
  updatedAt: Date; // Timestamp of last update
}
