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

export interface LocationRest extends Location {
    part: true;
    includes: {
        type: "rest",
        term?: string,
        objects?: string[]
    }
}

export interface LocationMainland extends Location {
    part: true;
    includes: {
        type: "mainland"
    }
}

export interface Island extends Omit<Location, "islands"> {
    part: false;
}

export type Area = Location | LocationPart | LocationRest | LocationMainland | Island;
