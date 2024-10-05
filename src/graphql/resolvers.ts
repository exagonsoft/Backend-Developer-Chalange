import { PrismaClient, VehicleType } from '@prisma/client';
import logger from '../utils/logger';
import { Make } from '@interfaces/interfaces';

const prisma = new PrismaClient();

interface MakePage {
  makes: Make[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const resolvers = {
  Query: {
    getAllMakes: async (_: any, args: { page: number; pageSize: number }): Promise<MakePage> => {
      const { page, pageSize } = args;
      const skip = (page - 1) * pageSize;

      try {
        logger.info(`Fetching all makes with pagination: page=${page}, pageSize=${pageSize}`);

        const totalCount = await prisma.make.count();
        const makes = await prisma.make.findMany({
          skip,
          take: pageSize,
          include: { vehicleTypes: true },
        });

        logger.info(`Successfully fetched ${makes.length} makes for page=${page} with pageSize=${pageSize}.`);

        return {
          makes,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: page,
        };
      } catch (error: any) {
        logger.error(`Error fetching makes: ${error.message}`, { error });
        throw new Error('Failed to fetch makes. Please try again later.');
      }
    },

    getMakeById: async (_: any, args: { makeId: number }) => {
      try {
        logger.info(`Fetching make details for makeId=${args.makeId}`);

        const make = await prisma.make.findUnique({
          where: { makeId: args.makeId },
          include: { vehicleTypes: true },
        });

        if (!make) {
          logger.warn(`No make found with makeId=${args.makeId}`);
          return null;
        }

        logger.info(`Successfully fetched make details for makeId=${args.makeId}`);
        return make;
      } catch (error: any) {
        logger.error(`Error fetching make with ID ${args.makeId}: ${error.message}`, { error });
        throw new Error(`Failed to fetch make with ID ${args.makeId}. Please try again later.`);
      }
    },

    getAllVehicleTypes: async (_: any, args: {  }): Promise<VehicleType[]> => {
      try {
        logger.info(`Fetching vehicle types`);

        const vehicleTypes = await prisma.vehicleType.findMany();

        logger.info(`Successfully fetched ${vehicleTypes.length} vehicle types`);
        return vehicleTypes;
      } catch (error: any) {
        logger.error(`Error fetching makes: ${error.message}`, { error });
        throw new Error('Failed to fetch makes. Please try again later.');
      }
    },
  },

  Make: {
    vehicleTypes: async (parent: any) => {
      try {
        logger.info(`Fetching vehicle types for makeId=${parent.makeId}`);

        const vehicleTypes = await prisma.vehicleType.findMany({
          where: { makeId: parent.makeId },
        });

        logger.info(`Successfully fetched ${vehicleTypes.length} vehicle types for makeId=${parent.makeId}`);
        return vehicleTypes;
      } catch (error: any) {
        logger.error(`Error fetching vehicle types for makeId=${parent.makeId}: ${error.message}`, { error });
        throw new Error(`Failed to fetch vehicle types for makeId ${parent.makeId}. Please try again later.`);
      }
    },
  },
};

export default resolvers;
