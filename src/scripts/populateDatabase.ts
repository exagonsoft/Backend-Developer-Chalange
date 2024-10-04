import { XmlParserService } from '../services/xmlParserService';
import { getTransformedVehicleData } from '../services/mainService';
import prisma from '../config/config';

async function populateDatabase() {
  const xmlParserService = new XmlParserService();

  try {
    console.log('Starting data population process...');
    await getTransformedVehicleData(xmlParserService, 100, 10);
    console.log('Database population completed successfully.');
  } catch (error) {
    console.error('Error in data population process:', error);
  } finally {
    if(prisma){
        await prisma.$disconnect();
    }
    process.exit(0);
  }
}

populateDatabase();
