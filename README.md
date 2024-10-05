
# Vehicle Data Service

A robust and scalable service to parse, transform, and manage vehicle data using the latest technologies in a modern development stack.

[![CI/CD Pipeline](https://github.com/exagonsoft/Backend-Developer-Chalange/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/exagonsoft/Backend-Developer-Chalange/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/exagonsoft/Backend-Developer-Chalange/branch/master/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/exagonsoft/repo)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1e27ade79c4c4f858256dcb5ab4a6c97)](https://app.codacy.com/gh/exagonsoft/Backend-Developer-Chalange/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## 🚀 Project Overview
The **Vehicle Data Service** is designed to fetch vehicle makes and types from the [NHTSA API](https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML), transform the data into JSON format, and expose it via a GraphQL API for easy access. The service is built with scalability and performance in mind, ensuring it can handle high traffic and provide low-latency responses.

## 📋 Table of Contents
1. [Technology Stack](#-technology-stack)
2. [Features](#-features)
3. [Setup Instructions](#-setup-instructions)
4. [Running Tests](#-running-tests)
5. [Dockerization](#-dockerization)
6. [CI/CD Pipeline](#-cicd-pipeline)
7. [Design Decisions](#-design-decisions)
8. [Performance Considerations](#-performance-considerations)
9. [Future Improvements](#-future-improvements)
10. [Contributors](#-contributors)

## 🛠️ Technology Stack
- **Node.js 18**: Runtime environment for executing JavaScript server-side.
- **TypeScript**: Type-safe language that builds on JavaScript.
- **Prisma**: Next-generation ORM for database management and migrations.
- **GraphQL**: API query language for exposing data with flexibility.
- **PostgreSQL**: SQL database for storing and managing vehicle data.
- **Docker**: Containerization for consistent deployment and environment setup.
- **ESLint & Prettier**: Linting and formatting tools for maintaining code quality.
- **GitHub Actions**: CI/CD pipeline setup for automated testing and deployment.

## ✨ Features
- **Data Parsing**: Fetches vehicle makes and types from an external API and transforms XML into structured JSON.
- **Persistent Storage**: Saves transformed data in a PostgreSQL database.
- **GraphQL API**: Exposes data through a highly queryable API with support for filtering, pagination, and complex queries.
- **Scalable Architecture**: Designed to handle high concurrent requests with low response times.
- **Error Handling**: Implements comprehensive error handling for network failures, invalid data, and partial failures.
- **CI/CD Integration**: Includes a complete CI/CD pipeline for testing and deployment using GitHub Actions.

## 🔧 Setup Instructions
### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL instance (only for local environment)

### Step-by-Step Setup
1. **Create a `.env` file in the root directory:**

   ```plaintext
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/vehicle_database
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

3. **Run the database migrations:**

   ```bash
   npx prisma migrate deploy
   ```

4. **Start the service locally:**

   ```bash
   npm run dev
   ```

5. **Access the GraphQL Playground:**

   Open [http://localhost:4000/graphql](http://localhost:4000/graphql) in your browser.

## 🧪 Running Tests
### Unit and Integration Tests
To run tests, ensure you have set up the environment variables (`DATABASE_URL`) and execute the following command:

```bash
npm run test
```

### Linting
Ensure code quality by running ESLint:

```bash
npm run lint
```

## 🐳 Dockerization
To run the application using Docker, ensure Docker is installed and run the following command:

```bash
docker-compose up -d
```

This will:
1. Build the Docker image for the service.
2. Start the PostgreSQL database container.
3. Run the `vehicle-service` container.

## 📑 APP FEATURES
1. Data fetching service
   - Get all the Vehicles From the registry
   - Runs only if the DB is outdated
   - While running check for duplicated values
   - Run in an isolated thread
2. REST API Endpoints
   - getAllMakes (return all vehicles using pagination)
     ```graphql
     query GetAllMakes ($page: Int, $pageSize: Int) {
         getAllMakes(page: $page, pageSize : $pageSize){
             makes {
                makeId
                makeName
                vehicleTypes{
                    typeId
                    typeName
                }
             }
             totalCount
             totalPages
             currentPage
         }
      }
      ------------------------------------
      {
          "page": 1, 
          "pageSize": 10
      }
      ```
   - getMakeById (return details of an specific vehicle)
     ```graphql
     query GetMakeById ($makeId: Int!) {
          getMakeById(makeId: $makeId){
              makeId
              makeName
              vehicleTypes{
                  typeId
                  typeName
              }
          }
      }
      ------------------------------------
      {
          "makeId": 440
      }
      ```
   - getAllVehicleTypes (return the list of vehicles types)
     ```graphql
     query GetAllVehicleTypes {
         getAllVehicleTypes {
             typeId
             typeName
         }
      }
      ------------------------------------
      {
         
      }
      ```


## 🔄 CI/CD Pipeline
The CI/CD pipeline is implemented using **GitHub Actions** and is designed to:

1. **Build** the service image.
2. **Run Linting and Tests**.
3. **Deploy** the service image to a container registry (Docker Hub).

### Deployment Rules
- Deployment is triggered only for pushes to the `master` branch.
- Ensure `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set as GitHub secrets for Docker Hub login.

## 📐 Design Decisions
### Database Schema
- Chose PostgreSQL for its reliability and support for complex queries.
- Prisma is used for database migrations and schema management due to its strong TypeScript support.

### API Design
- Implemented a GraphQL API to allow for flexible querying and data retrieval.
- Resolvers are structured to handle nested queries and associations efficiently.

### Error Handling
- Used `try-catch` blocks around all external API calls to handle network errors.
- Implemented a retry mechanism for transient failures with exponential backoff.

## ⚡ Performance Considerations
- **Asynchronous Programming**: All I/O operations (database queries, API requests) are non-blocking.
- **Connection Pooling**: Prisma uses connection pooling to handle high load efficiently.
- **Horizontal Scalability**: The service can be scaled horizontally using Docker Compose or Kubernetes.
- **Caching**: Implemented caching for frequently accessed data to reduce database load.

### Load Testing
- Used `Artillery` for load testing to simulate 500-1000 concurrent requests.
- Ensured a 95th percentile response time under 500ms during testing.

## 🚀 Future Improvements
- Implement Redis for caching to improve performance.
- Add support for more vehicle data sources.
- Implement a rate limiter to handle high traffic more gracefully.
- Set up Kubernetes for more scalable deployments.

## 👥 Contributors
- **Your Name** - [@yourusername](https://github.com/yourusername)


---

## OBSERVATIONS

- Issue in [NHTSA API](https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML)
  * The NHTSA API has a concurrency restrictions blocking access for a short time to prevent sever overload; Therefore the data fetch can not be implemented in big bulks but in small packages.