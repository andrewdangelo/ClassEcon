/**
 * Custom GraphQL Scalars
 */

import { GraphQLScalarType, Kind } from 'graphql';

/**
 * DateTime scalar for handling Date objects
 */
export const GraphQLDateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A date-time string at UTC, such as 2019-12-03T09:54:33Z',

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    throw new Error('DateTime cannot represent an invalid date-time value');
  },

  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('DateTime cannot represent an invalid date-time value');
      }
      return date;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return value;
    }
    throw new Error('DateTime cannot represent an invalid date-time value');
  },

  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error('DateTime cannot represent an invalid date-time value');
      }
      return date;
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    throw new Error('DateTime cannot represent an invalid date-time value');
  },
});
