import { XmlParserService } from './src/services/xmlParserService';
import { getTransformedVehicleData } from './src/services/mainService';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { json } from 'express';
import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import resolvers from './src/graphql/resolvers';
import prisma from './src/config/config';

async function initializeDatabase(xmlParserService: XmlParserService) {
  console.log('Checking if the database is already populated...');
  const makeCount = await prisma.make.count();

  if (makeCount === 0) {
    console.log('Database is empty. Populating with transformed vehicle data...');
    await getTransformedVehicleData(xmlParserService, 100, 10);
    console.log('Database has been successfully populated.');
  } else {
    console.log('Database is already populated.');
  }
}

async function startApolloServer() {
  const typeDefs = readFileSync(path.join(__dirname, './src/graphql/schema.graphql'), 'utf8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const app = express();
  app.use(json());

  await server.start();

  const httpServer = http.createServer(app);

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

async function main() {
  const xmlParserService = new XmlParserService();

  try {
    await initializeDatabase(xmlParserService);

    await startApolloServer();
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
