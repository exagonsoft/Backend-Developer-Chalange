import { XmlParserService } from './xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../utils/dataTransformer';

export async function getTransformedVehicleData(xmlParserService = new XmlParserService()) {
  const makeDataXml = await xmlParserService.getAllMakes();
  const makes = makeDataXml ? transformMakeData(makeDataXml) : [];

  const vehicleDataPromises = makes.map(async (make: any) => {
    try {
      const vehicleTypeDataXml = await xmlParserService.getVehicleTypesForMakeId(make.MakeID);
      const vehicleTypes = transformVehicleTypeData(vehicleTypeDataXml);
      return {
        MakeID: make.MakeID,
        MakeName: make.MakeName,
        VehicleTypes: vehicleTypes,
      };
    } catch (error) {
      console.error(`Failed to fetch vehicle types for make ID ${make.MakeID}: ${error}`);
      return {
        MakeID: make.MakeID,
        MakeName: make.MakeName,
        VehicleTypes: [],
      };
    }
  });

  const allVehicleData = await Promise.all(vehicleDataPromises);
  return { AllVehicleData: allVehicleData };
}

