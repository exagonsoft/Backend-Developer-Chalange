import { getTransformedVehicleData } from '../../src/services/mainService';
import { XmlParserService } from '../../src/services/xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../../src/utils/dataTransformer';

jest.mock('../../src/services/xmlParserService');
jest.mock('../../src/utils/dataTransformer');

const MockXmlParserService = XmlParserService as jest.MockedClass<typeof XmlParserService>;
const mockGetAllMakes = jest.fn();
const mockGetVehicleTypesForMakeId = jest.fn();

describe('getTransformedVehicleData', () => {
  let xmlParserService: XmlParserService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    xmlParserService = new MockXmlParserService();
    xmlParserService.getAllMakes = mockGetAllMakes;
    xmlParserService.getVehicleTypesForMakeId = mockGetVehicleTypesForMakeId;

    // Mock console.error to suppress error logs during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore original console.error after each test case
    consoleErrorSpy.mockRestore();
  });

  it('should successfully transform and return the combined vehicle data', async () => {
    const mockMakeDataXml = { Response: { Results: [{ AllVehicleMakes: [{ Make_ID: ['1'], Make_Name: ['Toyota'] }] }] } };
    mockGetAllMakes.mockResolvedValueOnce(mockMakeDataXml);

    const mockTransformedMakes = [{ MakeID: 1, MakeName: 'Toyota' }];
    (transformMakeData as jest.Mock).mockReturnValueOnce(mockTransformedMakes);

    const mockVehicleTypeDataXml = { Response: { Results: [{ VehicleTypesForMakeIds: [{ VehicleTypeId: ['10'], VehicleTypeName: ['Sedan'] }] }] } };
    mockGetVehicleTypesForMakeId.mockResolvedValueOnce(mockVehicleTypeDataXml);

    const mockTransformedVehicleTypes = [{ VehicleTypeID: 10, VehicleTypeName: 'Sedan' }];
    (transformVehicleTypeData as jest.Mock).mockReturnValueOnce(mockTransformedVehicleTypes);

    const result = await getTransformedVehicleData(xmlParserService);

    expect(mockGetAllMakes).toHaveBeenCalledTimes(1);
    expect(transformMakeData).toHaveBeenCalledWith(mockMakeDataXml);
    expect(mockGetVehicleTypesForMakeId).toHaveBeenCalledWith(1);
    expect(transformVehicleTypeData).toHaveBeenCalledWith(mockVehicleTypeDataXml);

    expect(result).toEqual({
      AllVehicleData: [
        {
          MakeID: 1,
          MakeName: 'Toyota',
          VehicleTypes: [{ VehicleTypeID: 10, VehicleTypeName: 'Sedan' }],
        },
      ],
    });
  });

  it('should handle an error in getAllMakes and throw an exception', async () => {
    mockGetAllMakes.mockRejectedValueOnce(new Error('Failed to fetch all makes'));

    await expect(getTransformedVehicleData(xmlParserService)).rejects.toThrow('Failed to fetch all makes');

    expect(mockGetAllMakes).toHaveBeenCalledTimes(1);
    expect(transformMakeData).not.toHaveBeenCalled();
    expect(mockGetVehicleTypesForMakeId).not.toHaveBeenCalled();
    expect(transformVehicleTypeData).not.toHaveBeenCalled();
  });

  it('should handle an error in getVehicleTypesForMakeId and continue processing other makes', async () => {
    const mockMakeDataXml = {
      Response: { Results: [{ AllVehicleMakes: [{ Make_ID: ['1'], Make_Name: ['Toyota'] }, { Make_ID: ['2'], Make_Name: ['Honda'] }] }] },
    };
    mockGetAllMakes.mockResolvedValueOnce(mockMakeDataXml);

    const mockTransformedMakes = [
      { MakeID: 1, MakeName: 'Toyota' },
      { MakeID: 2, MakeName: 'Honda' },
    ];
    (transformMakeData as jest.Mock).mockReturnValueOnce(mockTransformedMakes);

    const mockVehicleTypeDataXml1 = { Response: { Results: [{ VehicleTypesForMakeIds: [{ VehicleTypeId: ['10'], VehicleTypeName: ['Sedan'] }] }] } };
    mockGetVehicleTypesForMakeId.mockResolvedValueOnce(mockVehicleTypeDataXml1);
    mockGetVehicleTypesForMakeId.mockRejectedValueOnce(new Error('Failed to fetch vehicle types for make ID 2'));

    const mockTransformedVehicleTypes1 = [{ VehicleTypeID: 10, VehicleTypeName: 'Sedan' }];
    (transformVehicleTypeData as jest.Mock).mockReturnValueOnce(mockTransformedVehicleTypes1);
    (transformVehicleTypeData as jest.Mock).mockReturnValueOnce([]); 

    const result = await getTransformedVehicleData(xmlParserService);

    expect(result).toEqual({
      AllVehicleData: [
        {
          MakeID: 1,
          MakeName: 'Toyota',
          VehicleTypes: [{ VehicleTypeID: 10, VehicleTypeName: 'Sedan' }],
        },
        {
          MakeID: 2,
          MakeName: 'Honda',
          VehicleTypes: [],
        },
      ],
    });

    expect(mockGetAllMakes).toHaveBeenCalledTimes(1);
    expect(transformMakeData).toHaveBeenCalledWith(mockMakeDataXml);
    expect(mockGetVehicleTypesForMakeId).toHaveBeenCalledWith(1);
    expect(mockGetVehicleTypesForMakeId).toHaveBeenCalledWith(2);
    expect(transformVehicleTypeData).toHaveBeenCalledWith(mockVehicleTypeDataXml1);
  });
});
