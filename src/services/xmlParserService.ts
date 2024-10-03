import axios, { AxiosResponse } from 'axios';
import { parseStringPromise } from 'xml2js';
import logger from '../utils/logger';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    logger.warn(`Retrying request (${retryCount})...`);
    return retryCount * 1000; 
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || error.response?.status! >= 500;
  },
});

export class XmlParserService {
  async getAllMakes() {
    try {
      logger.info('Fetching all vehicle makes...');
      const response: AxiosResponse = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML');

      if (!response || !response.data) {
        logger.error('Received an empty response from getAllMakes API');
        throw new Error('Empty response from getAllMakes API');
      }

      logger.info('Successfully fetched all vehicle makes.');
      return await this.parseXml(response.data);
    } catch (error: any) {
      logger.error('Error fetching all vehicle makes:', { message: error.message });
      throw new Error('Failed to fetch vehicle makes. Please check the logs for more details.');
    }
  }

  async getVehicleTypesForMakeId(makeId: number) {
    try {
      logger.info(`Fetching vehicle types for make ID ${makeId}...`);
      const response: AxiosResponse = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`);

      if (!response || !response.data) {
        logger.error(`Received an empty response for vehicle types with makeId ${makeId}`);
        throw new Error(`Empty response for vehicle types with makeId ${makeId}`);
      }

      logger.info(`Successfully fetched vehicle types for make ID ${makeId}.`);
      return await this.parseXml(response.data);
    } catch (error: any) {
      logger.error(`Error fetching vehicle types for make ID ${makeId}:`, { message: error.message });
      throw new Error(`Failed to fetch vehicle types for make ID ${makeId}. Please check the logs for more details.`);
    }
  }

  private async parseXml(xmlData: string): Promise<any> {
    try {
      logger.info('Parsing XML data...');
      const parsedData = await parseStringPromise(xmlData);
      logger.info('Successfully parsed XML data.');
      return parsedData;
    } catch (error: any) {
      logger.error('Failed to parse XML data:', { message: error.message });
      throw new Error('Invalid XML data received. Failed to parse the response.');
    }
  }
}
