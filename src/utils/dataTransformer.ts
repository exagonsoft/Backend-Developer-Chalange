export function transformMakeData(makeXml: any): any {
  const makes = makeXml.Response.Results[0].AllVehicleMakes.map((make: any) => ({
    MakeID: parseInt(make.Make_ID[0], 10),
    MakeName: make.Make_Name[0],
  }));
  return makes;
}

export function transformVehicleTypeData(vehicleTypeXml: any): any {
  const vehicleTypes = vehicleTypeXml.Response.Results[0].VehicleTypesForMakeIds.map((type: any) => ({
    VehicleTypeID: parseInt(type.VehicleTypeId[0], 10),
    VehicleTypeName: type.VehicleTypeName[0],
  }));
  return vehicleTypes;
}
