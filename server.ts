import { XmlParserService } from './src/services/xmlParserService';
import { getTransformedVehicleData } from './src/services/mainService';

async function main() {
  const xmlParserService = new XmlParserService();

  try {
    const vehicleData = await getTransformedVehicleData(xmlParserService, 100, 10);
    console.log('Transformed Vehicle Data:', JSON.stringify(vehicleData, null, 2));
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
