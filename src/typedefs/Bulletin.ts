import {Area, Landmass} from "./Area";

export interface Cyclone {
    name: string;
    category?: string;
    internationalName?: string;
    prevailing? : boolean;
    center: {
        lat: number,
        lon: number
    };
    movement: {
        direction?: string,
        speed: number | string
    } | string;
}

export interface BulletinInfo {
    title: string;
    count: number;

    url: string;

    final: boolean;
    issued: Date;
    expires: Date | null;
    summary: string;
}

export interface TCWSLevel {
    areas: { [ key in Landmass ]: Area[] };
}

export type TCWSLevels = {
    1: TCWSLevel | null,
    2: TCWSLevel | null,
    3: TCWSLevel | null,
    4: TCWSLevel | null,
    5: TCWSLevel | null
}

export interface Bulletin {

    active?: boolean;
    cyclone: Cyclone;
    info: BulletinInfo;
    signals: TCWSLevels;

}
