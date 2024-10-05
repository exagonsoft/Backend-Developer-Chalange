/*
  Warnings:

  - You are about to drop the column `makeId` on the `VehicleType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VehicleType" DROP CONSTRAINT "VehicleType_makeId_fkey";

-- AlterTable
ALTER TABLE "VehicleType" DROP COLUMN "makeId";

-- CreateTable
CREATE TABLE "MakeVehicleType" (
    "id" SERIAL NOT NULL,
    "makeId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "MakeVehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MakeVehicleType_makeId_typeId_key" ON "MakeVehicleType"("makeId", "typeId");

-- AddForeignKey
ALTER TABLE "MakeVehicleType" ADD CONSTRAINT "MakeVehicleType_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("makeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MakeVehicleType" ADD CONSTRAINT "MakeVehicleType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "VehicleType"("typeId") ON DELETE RESTRICT ON UPDATE CASCADE;
