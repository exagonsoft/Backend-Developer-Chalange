
export interface VehicleType {
    typeId: number;
    typeName: string;
}

export interface Make {
    makeId: number;
    makeName: string;
    vehicleTypes: VehicleType[];
}
