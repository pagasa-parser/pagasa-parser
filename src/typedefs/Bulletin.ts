import Landmass, {Area} from "./Area";

export interface Typhoon {
    name: string;
    prevailing : boolean;
    center: {
        lat: number,
        lon: number
    };
    movement: string;
}

export interface BulletinInfo {
    title: string;
    count: number;

    url: string;

    issued: number;
    issued_utc: string;
    summary: string;
}

export interface TCWSLevel {
    affected_areas: { [ key in Landmass ] : Area[] };
    meteorological_condition?: string[];
    impact_of_the_wind?: string[];
    precautionary_measures?: string[];
    what_to_do?: string[];
}

export type TCWSLevels = {
    1 : TCWSLevel | null,
    2 : TCWSLevel | null,
    3 : TCWSLevel | null,
    4 : TCWSLevel | null,
    5 : TCWSLevel | null
}

export interface Bulletin {

    active: boolean;
    typhoon?: Typhoon;
    bulletin?: BulletinInfo;
    tcws_active: TCWSLevels;

}