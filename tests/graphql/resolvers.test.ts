import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-core';
import resolvers from '../../src/graphql/resolvers';
import prisma from '../../src/config/config';

jest.mock('../../src/config/config', () => ({
    make: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
    },
    vehicleType: {
        findMany: jest.fn(),
    },
}));

const typeDefs = gql`
  type VehicleType {
    typeId: Int!
    typeName: String!
    makeId: Int!
  }

  type Make {
    makeId: Int!
    makeName: String!
    vehicleTypes: [VehicleType]
  }

  type MakePage {
    makes: [Make]
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type Query {
    getAllMakes(page: Int!, pageSize: Int!): MakePage!
    getMakeById(makeId: Int!): Make
  }
`;

function isSingleResult(responseBody: any): responseBody is { kind: 'single'; singleResult: { data?: any; errors?: any } } {
    return responseBody && responseBody.kind === 'single';
}

describe('GraphQL Resolvers', () => {
    let server: ApolloServer;

    beforeAll(() => {
        const schema = makeExecutableSchema({ typeDefs, resolvers });
        server = new ApolloServer({
            schema,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Query: getAllMakes', () => {
        it('should return a paginated list of makes', async () => {
            const mockMakes = [
                { makeId: 1, makeName: 'Toyota' },
                { makeId: 2, makeName: 'Honda' },
            ];
            (prisma.make.findMany as jest.Mock).mockResolvedValue(mockMakes);
            (prisma.make.count as jest.Mock).mockResolvedValue(2);

            const query = `
        query GetAllMakes($page: Int!, $pageSize: Int!) {
          getAllMakes(page: $page, pageSize: $pageSize) {
            makes {
              makeId
              makeName
            }
            totalCount
            totalPages
            currentPage
          }
        }
      `;

            const result = await server.executeOperation({
                query,
                variables: { page: 1, pageSize: 2 },
            });

            if (isSingleResult(result.body)) {
                expect(result.body.singleResult.errors).toBeUndefined();
                expect(result.body.singleResult.data).toEqual({
                    getAllMakes: expect.objectContaining({
                      makes: expect.any(Array),
                      totalCount: expect.any(Number),
                      totalPages: expect.any(Number),
                      currentPage: expect.any(Number)
                    })
                  });
            } else {
                throw new Error(`Unexpected response format: ${JSON.stringify(result.body)}`);
            }

            expect(prisma.make.count).toBe;
        });

        it('should return an empty list if no makes are found', async () => {
            (prisma.make.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.make.count as jest.Mock).mockResolvedValue(0);

            const query = `
        query GetAllMakes($page: Int!, $pageSize: Int!) {
          getAllMakes(page: $page, pageSize: $pageSize) {
            makes {
              makeId
              makeName
            }
            totalCount
            totalPages
            currentPage
          }
        }
      `;

            const result = await server.executeOperation({
                query,
                variables: { page: 1, pageSize: 2 },
            });

            if (isSingleResult(result.body)) {
                expect(result.body.singleResult.errors).toBeUndefined();
                expect(result.body.singleResult.data).toEqual({
                    getAllMakes: expect.objectContaining({
                      makes: expect.any(Array),
                      totalCount: expect.any(Number),
                      totalPages: expect.any(Number),
                      currentPage: expect.any(Number)
                    })
                  });
            } else {
                throw new Error(`Unexpected response format: ${JSON.stringify(result.body)}`);
            }

            expect(prisma.make.count).toBe;
        });
    });

    describe('Query: getMakeById', () => {
        it('should return a specific make by ID', async () => {
            const mockMake = { makeId: 440, makeName: 'ASTON MARTIN', vehicleTypes: [] };
            (prisma.make.findUnique as jest.Mock).mockResolvedValue(mockMake);

            const query = `
        query GetMakeById($makeId: Int!) {
          getMakeById(makeId: $makeId) {
            makeId
            makeName
            vehicleTypes {
              typeId
              typeName
            }
          }
        }
      `;

            const result = await server.executeOperation({
                query,
                variables: { makeId: 440 },
            });

            if (isSingleResult(result.body)) {
                expect(result.body.singleResult.errors).toBeUndefined();
                expect(result.body.singleResult.data).toEqual({
                    getMakeById: {
                        makeId: 440,
                        makeName: 'ASTON MARTIN',
                        vehicleTypes: [],
                    },
                });
            } else {
                throw new Error(`Unexpected response format: ${JSON.stringify(result.body)}`);
            }

            expect(prisma.make.findUnique).toBe;
        });

        it('should return null if make ID does not exist', async () => {
            (prisma.make.findUnique as jest.Mock).mockResolvedValue(null);

            const query = `
        query GetMakeById($makeId: Int!) {
          getMakeById(makeId: $makeId) {
            makeId
            makeName
            vehicleTypes {
              typeId
              typeName
            }
          }
        }
      `;

            const result = await server.executeOperation({
                query,
                variables: { makeId: 999999 },
            });

            if (isSingleResult(result.body)) {
                expect(result.body.singleResult.errors).toBe;
                expect(result.body.singleResult.data).toBeNull;
            } else {
                throw new Error(`Unexpected response format: ${JSON.stringify(result.body)}`);
            }

            expect(prisma.make.findUnique).toBe;
        });
    });
});
