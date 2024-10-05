import { XmlParserService } from './xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../utils/dataTransformer';
import prisma from '../config/config';
import { delay } from '../utils/delay';
import { Make, VehicleType } from '../interfaces/interfaces';
import logger from '../utils/logger';

export async function getTransformedVehicleData(
  xmlParserService = new XmlParserService(),
  requestDelay: number = 500,
  batchSize: number = 5
) {
  try {
    logger.info('Starting the transformation process for vehicle data...');
    const makeDataXml = await xmlParserService.getAllMakes();
    const makes: Make[] = makeDataXml ? transformMakeData(makeDataXml) : [];

    logger.info(`Fetched Makes: ${makes}`);

    if (!makes || makes.length === 0) {
      logger.warn('No makes found to process.');
      return { allVehicleData: [] };
    }

    const allVehicleData: Make[] = [];

    for (let i = 0; i < makes.length; i += batchSize) {
      const makeBatch = makes.slice(i, i + batchSize);
      logger.info(`Processing batch ${i / batchSize + 1} of ${Math.ceil(makes.length / batchSize)} with ${makeBatch.length} makes...`);

      const vehicleTypePromises = makeBatch.map(async (make) => {
        try {
          if (!make || !make.makeId) {
            logger.error(`Invalid makeId for make: ${JSON.stringify(make)}`);
            return { ...make, vehicleTypes: [] };
          }

          await delay(requestDelay);
          logger.info(`Fetching vehicle types for makeId=${make.makeId}...`);
          const vehicleTypeDataXml = await xmlParserService.getVehicleTypesForMakeId(make.makeId);
          const vehicleTypes: VehicleType[] = vehicleTypeDataXml ? transformVehicleTypeData(vehicleTypeDataXml) : [];

          make.vehicleTypes = vehicleTypes || [];

          logger.info(`Checking Make record: makeId=${make.makeId}, makeName=${make.makeName}`);
          const existingMake = await prisma.make.findUnique({
            where: { makeId: make.makeId },
          });

          if (!existingMake) {
            logger.info(`Inserting new Make record: ${make.makeId} - ${make.makeName}`);
            await prisma.make.create({
              data: { makeId: make.makeId, makeName: make.makeName },
            });
          } else {
            logger.info(`Make record already exists: ${make.makeId} - ${make.makeName}`);
          }

          if (vehicleTypes && vehicleTypes.length > 0) {
            for (const vehicleType of vehicleTypes) {
              logger.info(`Checking VehicleType record: ${vehicleType.typeId} - ${vehicleType.typeName}`);
              const existingVehicleType = await prisma.vehicleType.findUnique({
                where: { typeId: vehicleType.typeId },
              });

              if (!existingVehicleType) {
                logger.info(`Inserting new VehicleType record: ${vehicleType.typeId} - ${vehicleType.typeName}`);
                await prisma.vehicleType.create({
                  data: {
                    typeId: vehicleType.typeId,
                    typeName: vehicleType.typeName,
                  },
                });
              } else {
                logger.info(`VehicleType record already exists: ${vehicleType.typeId} - ${vehicleType.typeName}`);
              }

              logger.info(`Checking MakeVehicleType relation for makeId=${make.makeId} and typeId=${vehicleType.typeId}`);
              const existingMakeVehicleType = await prisma.makeVehicleType.findUnique({
                where: {
                  makeId_typeId: {
                    makeId: make.makeId,
                    typeId: vehicleType.typeId,
                  },
                },
              });

              if (!existingMakeVehicleType) {
                logger.info(
                  `Inserting new MakeVehicleType relation: makeId=${make.makeId}, typeId=${vehicleType.typeId}`
                );
                await prisma.makeVehicleType.create({
                  data: {
                    makeId: make.makeId,
                    typeId: vehicleType.typeId,
                  },
                });
              } else {
                logger.info(`MakeVehicleType relation already exists: makeId=${make.makeId}, typeId=${vehicleType.typeId}`);
              }
            }
          }

          return make;
        } catch (error: any) {
          logger.error(`Failed to fetch or save vehicle types for make ID ${make.makeId}: ${error.message}`, { error });
          return { ...make, vehicleTypes: [] };
        }
      });

      const processedBatch = await Promise.all(vehicleTypePromises);
      logger.info(`Finished processing batch ${i / batchSize + 1}.`);
      allVehicleData.push(...processedBatch);
    }

    logger.info('Successfully processed all vehicle data.');
    return { allVehicleData };
  } catch (error: any) {
    logger.error(`Database operation failed: ${error.message}`, { error });
    throw new Error(`Database operation failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}
