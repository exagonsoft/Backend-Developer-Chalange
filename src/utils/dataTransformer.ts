export function transformMakeData(makeXml: any): any {
  const results = makeXml.Response?.Results?.[0]?.AllVehicleMakes || [];
  const makes = results.map((make: any) => ({
    makeId: parseInt(make.Make_ID[0], 10),
    makeName: make.Make_Name[0],
  }));
  return makes;
}

export function transformVehicleTypeData(vehicleTypeXml: any): any {
  const results = vehicleTypeXml?.Response?.Results?.[0]?.VehicleTypesForMakeIds || [];
  return Array.isArray(results)
    ? results.map((type: any) => ({
      typeId: parseInt(type.VehicleTypeId[0], 10),
      typeName: type.VehicleTypeName[0],
    }))
    : [];
}

