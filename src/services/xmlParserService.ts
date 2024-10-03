import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export class XmlParserService {
  async getAllMakes() {
    try {
      const response = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML');
      return await parseStringPromise(response.data);
    } catch (error) {
      console.error('Error fetching all makes:', error);
      throw new Error('Failed to fetch vehicle makes');
    }
  }

  async getVehicleTypesForMakeId(makeId: number) {
    try {
      const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`);
      return await parseStringPromise(response.data);
    } catch (error) {
      console.error(`Error fetching vehicle types for make ID ${makeId}:`, error);
      throw new Error(`Failed to fetch vehicle types for make ID ${makeId}`);
    }
  }
}
