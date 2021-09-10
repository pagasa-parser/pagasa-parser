enum Landmass {
    Luzon,
    Visayas,
    Mindanao
}

export default Landmass;

interface Location {
    name: string;
    part: boolean;
    islands?: Island[]
}

export interface LocationWhole extends Location {
    part: false;
    includes?: never;
}

export interface LocationPart extends Location {
    part: true;
    includes: {
        type: "section",
        // portion, region, etc.
        term: string,
        part: string,
        objects: string[]
    }
}

export function areaIsPart(area : Area) : area is LocationPart {
    return (area as any).includes?.type === "section";
}

export interface LocationRest extends Location {
    part: true;
    includes: {
        type: "rest",
        term?: string,
        objects?: string[]
    }
}

export function areaIsRestOf(area : Area) : area is LocationRest {
    return (area as any).includes?.type === "rest";
}

export interface LocationMainland extends Location {
    part: true;
    includes: {
        type: "mainland"
    }
}

export function areaIsMainland(area : Area) : area is LocationMainland {
    return (area as any).includes?.type === "mainland";
}

export interface Island extends Omit<Location, "islands"> {
    part: false;
}

export function areaIsWhole(area : Area) : area is LocationWhole | Island {
    return area.part === false;
}

export function areaHasIslands(area : Area) : area is Area & { islands: Island[] } {
    return (area as any).islands != null;
}

export type Area = LocationWhole | LocationPart | LocationRest | LocationMainland | Island;
