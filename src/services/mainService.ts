import { XmlParserService } from './xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../utils/dataTransformer';
import prisma from '../config/config';
import { delay } from '../utils/delay';
import { Make, VehicleType } from '../interfaces/interfaces';

export async function getTransformedVehicleData(
  xmlParserService = new XmlParserService(),
  requestDelay: number = 500,
  batchSize: number = 5
) {
  const makeDataXml = await xmlParserService.getAllMakes();
  const makes: Make[] = makeDataXml ? transformMakeData(makeDataXml) : [];

  if (!makes || makes.length === 0) {
    console.error('No makes found to process.');
    return { allVehicleData: [] };
  }

  try {
    const allVehicleData: Make[] = [];

    for (let i = 0; i < makes.length; i += batchSize) {
      const makeBatch = makes.slice(i, i + batchSize);
      console.log(`Processing batch of ${makeBatch.length} makes...`);

      const vehicleTypePromises = makeBatch.map(async (make) => {
        try {
          if (!make || !make.makeId) {
            console.error(`Invalid makeId for make: ${JSON.stringify(make)}`);
            return { ...make, vehicleTypes: [] };
          }

          await delay(requestDelay);
          const vehicleTypeDataXml = await xmlParserService.getVehicleTypesForMakeId(make.makeId);
          const vehicleTypes: VehicleType[] = vehicleTypeDataXml ? transformVehicleTypeData(vehicleTypeDataXml) : [];

          make.vehicleTypes = vehicleTypes || [];

          console.log(`Creating or checking Make record: makeId=${make.makeId}, makeName=${make.makeName}`);

          // Check if the make already exists
          const existingMake = await prisma.make.findUnique({
            where: { makeId: make.makeId },
          });

          if (!existingMake) {
            console.log(`Inserting new Make record: ${make.makeId} - ${make.makeName}`);
            await prisma.make.create({
              data: { makeId: make.makeId, makeName: make.makeName },
            });
          } else {
            console.log(`Make record already exists: ${make.makeId} - ${make.makeName}`);
          }

          // Persist VehicleType data if it exists
          if (vehicleTypes && vehicleTypes.length > 0) {
            for (const vehicleType of vehicleTypes) {
              // Check if the vehicle type already exists
              const existingVehicleType = await prisma.vehicleType.findUnique({
                where: { typeId: vehicleType.typeId },
              });

              if (!existingVehicleType) {
                await prisma.vehicleType.create({
                  data: {
                    typeId: vehicleType.typeId,
                    typeName: vehicleType.typeName,
                    makeId: make.makeId,
                  },
                });
              } else {
                console.log(`VehicleType record already exists: ${vehicleType.typeId} - ${vehicleType.typeName}`);
              }
            }
          }

          return make;
        } catch (error) {
          console.error(`Failed to fetch or save vehicle types for make ID ${make.makeId}: ${error}`);
          return { ...make, vehicleTypes: [] };
        }
      });

      const processedBatch = await Promise.all(vehicleTypePromises);
      allVehicleData.push(...processedBatch);
    }

    return { allVehicleData };
  } catch (error) {
    throw new Error(`Database operation failed: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}
