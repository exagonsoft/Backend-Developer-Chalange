import { Make, PrismaClient } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

const prisma = new PrismaClient();

interface MakePage {
    makes: Make[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

const resolvers = {
    Query: {
        getAllMakes: async (_: any, args: { page: number; pageSize: number }): Promise<MakePage> => {
            const { page, pageSize } = args;
            const skip = (page - 1) * pageSize;
            const totalCount = await prisma.make.count();
            const makes = await prisma.make.findMany({
                skip,
                take: pageSize,
                include: { vehicleTypes: true },
            });

            return {
                makes,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            };
        },

        getMakeById: async (_: any, args: { makeId: number }) => {
            return await prisma.make.findUnique({
                where: { makeId: args.makeId },
                include: { vehicleTypes: true },
            });
        },
    },

    Make: {
        vehicleTypes: async (parent: any) => {
            return await prisma.vehicleType.findMany({
                where: { makeId: parent.makeId },
            });
        },
    },
};

export default resolvers;
