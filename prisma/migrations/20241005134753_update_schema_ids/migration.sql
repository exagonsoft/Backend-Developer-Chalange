-- AlterTable
ALTER TABLE "Make" ALTER COLUMN "makeId" DROP DEFAULT;
DROP SEQUENCE "Make_makeId_seq";

-- AlterTable
ALTER TABLE "VehicleType" ALTER COLUMN "typeId" DROP DEFAULT;
DROP SEQUENCE "VehicleType_typeId_seq";
