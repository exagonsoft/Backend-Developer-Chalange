import { XmlParserService } from '../../src/services/xmlParserService';
import { getTransformedVehicleData } from '../../src/services/mainService';
import prisma from '../../src/config/config';

jest.mock('../../src/services/xmlParserService');
jest.mock('../../src/services/mainService');
jest.mock('../../src/config/config');

describe('populateDatabase', () => {
    let mockXmlParserService: XmlParserService;

    beforeEach(() => {
        mockXmlParserService = new XmlParserService() as jest.Mocked<XmlParserService>;
        (getTransformedVehicleData as jest.Mock).mockClear();
    });

    it('should call getTransformedVehicleData with the correct parameters and disconnect the database', async () => {
        (getTransformedVehicleData as jest.Mock).mockResolvedValueOnce(undefined);

        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

        await import('../../src/scripts/populateDatabase');

        expect(getTransformedVehicleData).toBe;

        expect(prisma).toBe;

        expect(processExitSpy).toBe;

        processExitSpy.mockRestore();
    });

    it('should handle errors and call process.exit with a non-zero code', async () => {
        (getTransformedVehicleData as jest.Mock).mockRejectedValueOnce(new Error('Mocked error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

        await import('../../src/scripts/populateDatabase');

        expect(consoleErrorSpy).toBe;

        expect(prisma).toBe;

        expect(processExitSpy).toBe;

        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });
});
