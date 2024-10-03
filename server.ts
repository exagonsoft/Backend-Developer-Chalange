import { getTransformedVehicleData } from './src/services/mainService';

async function main() {
  try {
    const vehicleData = await getTransformedVehicleData();
    console.log('Transformed Vehicle Data:', JSON.stringify(vehicleData, null, 2));
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
