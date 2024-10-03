-- CreateTable
CREATE TABLE "Make" (
    "makeId" SERIAL NOT NULL,
    "makeName" TEXT NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("makeId")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "typeId" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("typeId")
);

-- AddForeignKey
ALTER TABLE "VehicleType" ADD CONSTRAINT "VehicleType_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("makeId") ON DELETE RESTRICT ON UPDATE CASCADE;
