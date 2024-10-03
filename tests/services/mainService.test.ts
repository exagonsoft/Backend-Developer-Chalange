import { getTransformedVehicleData } from '../../src/services/mainService';
import { XmlParserService } from '../../src/services/xmlParserService';
import { transformMakeData, transformVehicleTypeData } from '../../src/utils/dataTransformer';
import prisma from '../../src/config/config';
import { delay } from '../../src/utils/delay';

jest.mock('../../src/services/xmlParserService');
jest.mock('../../src/utils/dataTransformer');
jest.mock('../../src/utils/delay');
jest.mock('../../src/config/config', () => ({
  make: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  vehicleType: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

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

    // Properly type the Prisma client methods as Jest mocks
    (prisma.make.findUnique as jest.Mock).mockReset();
    (prisma.make.create as jest.Mock).mockReset();
    (prisma.vehicleType.findUnique as jest.Mock).mockReset();
    (prisma.vehicleType.create as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks(); // Use resetAllMocks to reset mocks back to their original state
  });

  it('should handle batches correctly and persist data in the database using Prisma', async () => {
    // Mock XML data for makes
    const mockMakeDataXml = {
      Response: {
        Results: [
          {
            AllVehicleMakes: [
              { Make_ID: ['1'], Make_Name: ['Toyota'] },
              { Make_ID: ['2'], Make_Name: ['Honda'] },
            ],
          },
        ],
      },
    };
    mockGetAllMakes.mockResolvedValueOnce(mockMakeDataXml);

    // Mock transformed data for makes
    const mockTransformedMakes = [
      { makeId: 1, makeName: 'Toyota' },
      { makeId: 2, makeName: 'Honda' },
    ];
    (transformMakeData as jest.Mock).mockReturnValueOnce(mockTransformedMakes);

    // Mock vehicle type data for each make
    const mockVehicleTypeDataXml1 = {
      Response: {
        Results: [{ VehicleTypesForMakeIds: [{ VehicleTypeId: ['10'], VehicleTypeName: ['Sedan'] }] }],
      },
    };
    mockGetVehicleTypesForMakeId.mockResolvedValueOnce(mockVehicleTypeDataXml1);
    mockGetVehicleTypesForMakeId.mockResolvedValueOnce(undefined); // Mock empty response for Honda

    // Mock transformed vehicle types data
    const mockTransformedVehicleTypes1 = [{ typeId: 10, typeName: 'Sedan' }];
    (transformVehicleTypeData as jest.Mock).mockReturnValueOnce(mockTransformedVehicleTypes1);
    (transformVehicleTypeData as jest.Mock).mockReturnValueOnce([]); // Honda has no vehicle types

    // Execute the function under test
    const result = await getTransformedVehicleData(xmlParserService, 500, 1);

    // Assertions for the final returned data
    expect(result).toEqual({
      allVehicleData: [
        {
          makeId: 1,
          makeName: 'Toyota',
          vehicleTypes: [{ typeId: 10, typeName: 'Sedan' }],
        },
        {
          makeId: 2,
          makeName: 'Honda',
          vehicleTypes: [],
        },
      ],
    });

    // Additional assertions for API calls and delays
    expect(mockGetAllMakes).toHaveBeenCalledTimes(1);
    expect(transformMakeData).toHaveBeenCalledWith(mockMakeDataXml);
    expect(mockGetVehicleTypesForMakeId).toHaveBeenCalledWith(1);
    expect(mockGetVehicleTypesForMakeId).toHaveBeenCalledWith(2);
    expect(mockDelay).toHaveBeenCalledTimes(2);
  });
});
