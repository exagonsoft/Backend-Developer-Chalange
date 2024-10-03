import { transformMakeData, transformVehicleTypeData } from '../../src/utils/dataTransformer';

describe('dataTransformer', () => {
  describe('transformMakeData', () => {
    it('should handle empty Results gracefully', () => {
      const mockXml = {
        Response: {
          Results: [{}],
        },
      };
      const result = transformMakeData(mockXml);
      expect(result).toEqual([]);
    });

    it('should transform valid make data correctly', () => {
      const mockXml = {
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
      const result = transformMakeData(mockXml);
      expect(result).toEqual([
        { MakeID: 1, MakeName: 'Toyota' },
        { MakeID: 2, MakeName: 'Honda' },
      ]);
    });
  });

  describe('transformVehicleTypeData', () => {
    it('should handle empty Results gracefully', () => {
      const mockXml = {
        Response: {
          Results: [{}],
        },
      };
      const result = transformVehicleTypeData(mockXml);
      expect(result).toEqual([]);
    });

    it('should transform valid vehicle type data correctly', () => {
      const mockXml = {
        Response: {
          Results: [
            {
              VehicleTypesForMakeIds: [
                { VehicleTypeId: ['10'], VehicleTypeName: ['Sedan'] },
                { VehicleTypeId: ['11'], VehicleTypeName: ['SUV'] },
              ],
            },
          ],
        },
      };
      const result = transformVehicleTypeData(mockXml);
      expect(result).toEqual([
        { VehicleTypeID: 10, VehicleTypeName: 'Sedan' },
        { VehicleTypeID: 11, VehicleTypeName: 'SUV' },
      ]);
    });
  });
});
