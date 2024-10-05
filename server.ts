import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { json } from 'express';
import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import resolvers from './src/graphql/resolvers';
import prisma from './src/config/config';
import { fork } from 'child_process';

async function initializeDatabaseInBackground() {
  const scriptPath = path.join(__dirname, './src/scripts/populateDatabase.ts');

  console.log(`Starting child process with script path: ${scriptPath}`);

  const childProcess = fork(scriptPath, [], { detached: true, stdio: 'ignore' });

  console.log(`Database population started in a detached process with PID: ${childProcess.pid}`);

  childProcess.on('error', (err) => {
    console.error(`Failed to start child process: ${err.message}`);
  });

  childProcess.on('exit', (code, signal) => {
    if (code === 0) {
      console.log('Child process completed successfully.');
    } else {
      console.error(`Child process exited with code ${code} and signal ${signal}.`);
    }
  });

  childProcess.unref();
  console.log('Parent process detached from child process.');
}

export async function initializeDatabase() {
  console.log('Checking if the database is updated...');
  const makeCount = await prisma.make.count();

  // Correct way (implement a function to request the all makes from the api and get the total)
  if (makeCount < 11556) {
    console.log('Database is empty. Starting background population...');
    initializeDatabaseInBackground();
  } else {
    console.log('Database is up to date.');
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
  try {
    await initializeDatabase();

    await startApolloServer();
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
