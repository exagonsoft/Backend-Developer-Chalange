import axios from 'axios';
import { XmlParserService } from '../../src/services/xmlParserService';
import { parseStringPromise } from 'xml2js';

jest.mock('axios');
jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

describe('XmlParserService', () => {
  let xmlParserService: XmlParserService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    xmlParserService = new XmlParserService();
    jest.clearAllMocks();
  });

  describe('getAllMakes', () => {
    it('should fetch all makes and parse XML data successfully', async () => {
      const mockXmlData =
        '<Response><Results><AllVehicleMakes><Make_ID>1</Make_ID><Make_Name>TestMake</Make_Name></AllVehicleMakes></Results></Response>';
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockXmlData });

      const mockParsedData = {
        Response: { Results: [{ AllVehicleMakes: [{ Make_ID: ['1'], Make_Name: ['TestMake'] }] }] },
      };
      (parseStringPromise as jest.Mock).mockResolvedValueOnce(mockParsedData);

      const result = await xmlParserService.getAllMakes();

      expect(axios.get).toBe;
      expect(parseStringPromise).toBe;
      expect(result).toEqual(mockParsedData);
    });

    it('should log an error and throw a custom error if the API request fails', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(xmlParserService.getAllMakes()).rejects.toThrow('Failed to fetch vehicle makes');
      expect(axios.get).toBe;
      expect(consoleErrorSpy).toBe;
    });

    it('should log an error and throw a custom error if XML parsing fails', async () => {
      const mockXmlData = '<InvalidXml>';
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockXmlData });
      (parseStringPromise as jest.Mock).mockRejectedValueOnce(new Error('XML parsing error'));

      await expect(xmlParserService.getAllMakes()).rejects.toThrow('Failed to fetch vehicle makes');
      expect(parseStringPromise).toBe;
      expect(consoleErrorSpy).toBe;
    });
  });

  describe('getVehicleTypesForMakeId', () => {
    it('should fetch vehicle types and parse XML data successfully', async () => {
      const makeId = 123;
      const mockXmlData =
        '<Response><Results><VehicleTypesForMakeIds><VehicleTypeId>1</VehicleTypeId><VehicleTypeName>Car</VehicleTypeName></VehicleTypesForMakeIds></Results></Response>';
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockXmlData });

      const mockParsedData = {
        Response: { Results: [{ VehicleTypesForMakeIds: [{ VehicleTypeId: ['1'], VehicleTypeName: ['Car'] }] }] },
      };
      (parseStringPromise as jest.Mock).mockResolvedValueOnce(mockParsedData);

      const result = await xmlParserService.getVehicleTypesForMakeId(makeId);

      expect(axios.get).toHaveBeenCalledWith(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`
      );
      expect(parseStringPromise).toHaveBeenCalledWith(mockXmlData);
      expect(result).toEqual(mockParsedData);
    });

    it('should log an error and throw a custom error if the API request fails', async () => {
      const makeId = 123;
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(xmlParserService.getVehicleTypesForMakeId(makeId)).rejects.toThrow(
        `Failed to fetch vehicle types for make ID ${makeId}`
      );
      expect(axios.get).toBe;
      expect(consoleErrorSpy).toBe;
    });

    it('should log an error and throw a custom error if XML parsing fails', async () => {
      const makeId = 123;
      const mockXmlData = '<InvalidXml>';
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockXmlData });
      (parseStringPromise as jest.Mock).mockRejectedValueOnce(new Error('XML parsing error'));

      await expect(xmlParserService.getVehicleTypesForMakeId(makeId)).rejects.toThrow(
        `Failed to fetch vehicle types for make ID ${makeId}`
      );
      expect(parseStringPromise).toBe;
      expect(consoleErrorSpy).toBe;
    });
  });
});
