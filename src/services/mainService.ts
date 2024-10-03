import { XmlParserService } from './xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../utils/dataTransformer';
import { delay } from '../utils/delay';

export async function getTransformedVehicleData(
  xmlParserService = new XmlParserService(),
  requestDelay: number = 500
) {
  const makeDataXml = await xmlParserService.getAllMakes();
  const makes = makeDataXml ? transformMakeData(makeDataXml) : [];

  const allVehicleData = [];

  for (const make of makes) {
    try {
      await delay(requestDelay);

      const vehicleTypeDataXml = await xmlParserService.getVehicleTypesForMakeId(make.MakeID);
      const vehicleTypes = vehicleTypeDataXml ? transformVehicleTypeData(vehicleTypeDataXml) : [];

      allVehicleData.push({
        MakeID: make.MakeID,
        MakeName: make.MakeName,
        VehicleTypes: vehicleTypes,
      });
    } catch (error) {
      console.error(`Failed to fetch vehicle types for make ID ${make.MakeID}: ${error}`);

      allVehicleData.push({
        MakeID: make.MakeID,
        MakeName: make.MakeName,
        VehicleTypes: [],
      });
    }
  }

  return { AllVehicleData: allVehicleData };
}
