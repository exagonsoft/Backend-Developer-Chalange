import { transformMakeData, transformVehicleTypeData } from '../../src/utils/dataTransformer';

describe('Data Transformation Functions', () => {
  describe('transformMakeData', () => {
    it('should correctly transform make XML data into JSON format', () => {
      const mockMakeXml = {
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

      const expectedTransformedData = [
        { MakeID: 1, MakeName: 'Toyota' },
        { MakeID: 2, MakeName: 'Honda' },
      ];

      const result = transformMakeData(mockMakeXml);

      expect(result).toEqual(expectedTransformedData);
    });

    it('should return an empty array if there are no makes in the XML', () => {
      const mockEmptyMakeXml = {
        Response: {
          Results: [
            {
              AllVehicleMakes: [],
            },
          ],
        },
      };

      const result = transformMakeData(mockEmptyMakeXml);

      expect(result).toEqual([]);
    });
  });

  describe('transformVehicleTypeData', () => {
    it('should correctly transform vehicle type XML data into JSON format', () => {
      const mockVehicleTypeXml = {
        Response: {
          Results: [
            {
              VehicleTypesForMakeIds: [
                { VehicleTypeId: ['10'], VehicleTypeName: ['Sedan'] },
                { VehicleTypeId: ['20'], VehicleTypeName: ['SUV'] },
              ],
            },
          ],
        },
      };

      const expectedTransformedData = [
        { VehicleTypeID: 10, VehicleTypeName: 'Sedan' },
        { VehicleTypeID: 20, VehicleTypeName: 'SUV' },
      ];

      const result = transformVehicleTypeData(mockVehicleTypeXml);

      expect(result).toEqual(expectedTransformedData);
    });

    it('should return an empty array if there are no vehicle types in the XML', () => {
      const mockEmptyVehicleTypeXml = {
        Response: {
          Results: [
            {
              VehicleTypesForMakeIds: [],
            },
          ],
        },
      };

      const result = transformVehicleTypeData(mockEmptyVehicleTypeXml);

      expect(result).toEqual([]);
    });
  });
});
