// tests/services/mainService.test.ts
import { getTransformedVehicleData } from '../../src/services/mainService';
import { XmlParserService } from '../../src/services/xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../../src/utils/dataTransformer';
import { delay } from '../../src/utils/delay';

jest.mock('../../src/services/xmlParserService');
jest.mock('../../src/utils/dataTransformer');
jest.mock('../../src/utils/delay');

const MockXmlParserService = XmlParserService as jest.MockedClass<typeof XmlParserService>;
const mockGetAllMakes = jest.fn();
const mockGetVehicleTypesForMakeId = jest.fn();
const mockDelay = delay as jest.Mock;

describe('getTransformedVehicleData', () => {
  let xmlParserService: XmlParserService;

  beforeEach(() => {
    xmlParserService = new MockXmlParserService();
    xmlParserService.getAllMakes = mockGetAllMakes;
    xmlParserService.getVehicleTypesForMakeId = mockGetVehicleTypesForMakeId;

    mockDelay.mockResolvedValue(Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully transform and return the combined vehicle data with delay mocked', async () => {
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

    expect(mockDelay).toHaveBeenCalledTimes(1);
    expect(mockDelay).toHaveBeenCalledWith(500);
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

    expect(mockDelay).toHaveBeenCalledTimes(2);
    expect(mockDelay).toHaveBeenCalledWith(500);
  });
});
