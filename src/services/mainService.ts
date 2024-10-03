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

    if (!makes || makes.length === 0) {
      logger.warn('No makes found to process.');
      return { allVehicleData: [] };
    }

    const allVehicleData: Make[] = [];

    for (let i = 0; i < makes.length; i += batchSize) {
      const makeBatch = makes.slice(i, i + batchSize);
      logger.info(`Processing batch of ${makeBatch.length} makes...`);

      const vehicleTypePromises = makeBatch.map(async (make) => {
        try {
          if (!make || !make.makeId) {
            logger.error(`Invalid makeId for make: ${JSON.stringify(make)}`);
            return { ...make, vehicleTypes: [] };
          }

          await delay(requestDelay);
          const vehicleTypeDataXml = await xmlParserService.getVehicleTypesForMakeId(make.makeId);
          const vehicleTypes: VehicleType[] = vehicleTypeDataXml ? transformVehicleTypeData(vehicleTypeDataXml) : [];

          make.vehicleTypes = vehicleTypes || [];

          logger.info(`Creating or checking Make record: makeId=${make.makeId}, makeName=${make.makeName}`);

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
              const existingVehicleType = await prisma.vehicleType.findUnique({
                where: { typeId: vehicleType.typeId },
              });

              if (!existingVehicleType) {
                logger.info(`Inserting new VehicleType record: ${vehicleType.typeId} - ${vehicleType.typeName}`);
                await prisma.vehicleType.create({
                  data: {
                    typeId: vehicleType.typeId,
                    typeName: vehicleType.typeName,
                    makeId: make.makeId,
                  },
                });
              } else {
                logger.info(`VehicleType record already exists: ${vehicleType.typeId} - ${vehicleType.typeName}`);
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
