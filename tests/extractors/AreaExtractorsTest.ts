import AreaExtractor from "../../src/extractors/AreaExtractor";
import {LocationPart, LocationWhole} from "../../src/typedefs/Area";

describe("AreaExtractor tests", () => {

    test("Whole", () => {
        const extractor = new AreaExtractor(
            "Manila"
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Manila",
            part: false
        });
    });

    test("Whole (with islands)", () => {
        const extractor = new AreaExtractor(
            "Occidental Mindoro including Lubang Island",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Occidental Mindoro",
            part: false,
            islands: [
                { name: "Lubang Island", part: false }
            ]
        });
    });

    test("Mainland", () => {
        const extractor = new AreaExtractor(
            "mainland Albay"
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Albay",
            part: true,
            includes: {
                type: "mainland"
            }
        });
    });

    test("Rest", () => {
        const extractor = new AreaExtractor(
            "rest of Nueva Ecija, and the rest of mainland Albay",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(2);
        expect(areas[0]).toMatchObject({
            name: "Nueva Ecija",
            part: true,
            includes: {
                type: "rest"
            }
        });
        expect(areas[1]).toMatchObject({
            name: "Albay",
            part: true,
            includes: {
                type: "rest",
                term: "mainland"
            }
        });
    });

    test("Rest-Partition hybrid", () => {
        const extractor = new AreaExtractor(
            "rest of the western portion of Camarines Sur (Del Gallego, Ragay, Lupi, Pasacao)",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Camarines Sur",
            part: true,
            includes: {
                type: "section",
                term: "portion",
                part: "rest of the western",
                objects: [
                    "Del Gallego", "Ragay", "Lupi", "Pasacao"
                ]
            }
        });
    });

    test("Rest (islands)", () => {
        const extractor = new AreaExtractor(
            "rest of Masbate including Burias Island, rest of Masbate (Monreal, San Jacinto) including Burias Island, rest of Palawan including Cuyo",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(3);
        expect(areas[0]).toMatchObject({
            name: "Masbate",
            part: true,
            includes: {
                type: "rest"
            },
            islands: [
                { name: "Burias Island", part: false }
            ]
        });
        expect(areas[1]).toMatchObject({
            name: "Masbate",
            part: true,
            includes: {
                type: "rest",
                objects: [
                    "Monreal", "San Jacinto"
                ]
            },
            islands: [
                { name: "Burias Island", part: false }
            ]
        });
        expect(areas[2]).toMatchObject({
            name: "Palawan",
            part: true,
            includes: {
                type: "rest"
            },
            islands: [
                { name: "Cuyo Island", part: false }
            ]
        });
    });

    test("Partitioned", () => {
        const extractor = new AreaExtractor(
            "southern portion of Isabela (San Agustin, Dinapigue, San Guillermo, Echague, Jones, Santiago, Cordon, Ramon, San Isidro, Alicia, Andangan, San Mateo), the extreme northern region of Biliran (Kawayan)",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(2);
        expect(areas[0]).toMatchObject({
            name: "Isabela",
            part: true,
            includes: {
                type: "section",
                term: "portion",
                part: "southern",
                objects: [
                    "San Agustin", "Dinapigue", "San Guillermo", "Echague",
                    "Jones", "Santiago", "Cordon", "Ramon", "San Isidro",
                    "Alicia", "Andangan", "San Mateo"
                ]
            }
        });
        expect(areas[1]).toMatchObject({
            name: "Biliran",
            part: true,
            includes: {
                type: "section",
                term: "region",
                part: "extreme northern",
                objects: [
                    "Kawayan"
                ]
            }
        });
    });

    test("Partitioned (mainland)", () => {
        const extractor = new AreaExtractor(
            "extreme northeastern portion of mainland Cagayan (Santa Ana, Gonzaga)",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Cagayan",
            part: true,
            includes: {
                type: "section",
                term: "portion",
                part: "extreme northeastern",
                mainland: true,
                objects: [
                    "Santa Ana", "Gonzaga"
                ]
            }
        });
    });

    test("Partitioned (islands)", () => {
        const extractor = new AreaExtractor(
            "the northeastern portion of Surigao del Norte (Sta. Monica, Burgos, San Benito, San Isidro, Pilar, Del Carmen, Dapa, Gen. Luna, Socorro) including Siargao Island",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Surigao del Norte",
            part: true,
            includes: {
                type: "section",
                term: "portion",
                part: "northeastern",
                objects: [
                    "Sta. Monica", "Burgos", "San Benito", "San Isidro",
                    "Pilar", "Del Carmen", "Dapa", "Gen. Luna", "Socorro"
                ]
            },
            islands: [
                { name: "Siargao Island", part: false }
            ]
        });
    });

    test("Partitioned (typo fix)", () => {
        const extractor = new AreaExtractor(
            "The extreme northern potrion Biliran   (Kawayan)",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Biliran",
            part: true,
            includes: {
                type: "section",
                term: "portion",
                part: "extreme northern",
                objects: [
                    "Kawayan"
                ]
            }
        });
    });

    test("Partitioned (no leading text)", () => {
        const extractor = new AreaExtractor(
            "Bulacan (Norzagaray, Doña Remedios Trinidad, San Miguel, San Ildefonso)",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Bulacan",
            part: true,
            includes: {
                type: "whole",
                objects: [
                    "Norzagaray",
                    "Doña Remedios Trinidad",
                    "San Miguel",
                    "San Ildefonso"
                ]
            }
        });
    });

    test("Islands", () => {
        const extractor = new AreaExtractor(
            "Burias and Ticao Islands",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(2);
        expect(areas[0]).toMatchObject({
            name: "Burias Island",
            part: false
        });
        expect(areas[1]).toMatchObject({
            name: "Ticao Island",
            part: false
        });
    });

    test("Islands (with subisland)", () => {
        const extractor = new AreaExtractor(
            "Batanes and the northeastern portion of Babuyan Islands (Babuyan Is.)"
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(2);
        expect(areas[0]).toMatchObject({
            name: "Batanes",
            part: false
        });
        expect(areas[1]).toMatchObject(<LocationPart>{
            name: "Babuyan Islands",
            part: true,
            includes: {
                type: "section",
                part: "northeastern",
                term: "portion",
                objects: ["Babuyan Island"]
            }
        });
    });

    test("Missed comma fix", () => {
        const extractor = new AreaExtractor(
            "Occidental Mindoro including Lubang Island,the rest of Camarines Norte",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(2);
        expect(areas[0]).toMatchObject({
            name: "Occidental Mindoro",
            part: false,
            islands: [
                { name: "Lubang Island", part: false }
            ]
        });
        expect(areas[1]).toMatchObject({
            name: "Camarines Norte",
            part: true,
            includes: {
                type: "rest"
            }
        });
    });

    test("Whole with included objects", () => {
        const extractor = new AreaExtractor(
            "Batangas, the southeastern portion of\n" +
            "Quezon (San Francisco, San Andres, San\n" +
            "Narciso, Mulanay, Catanauan), Marinduque,\n" +
            "Masbate (Esperanza, Mandaon, Palanas,\n" +
            "Baleno, Placer, Cawayan, Milagros, Dimasalang,\n" +
            "Uson, Cataingan, Pio V. Corpuz, Balud, City of\n" +
            "Masbate, Aroroy, Mobo), and Romblon"
        );
        const areas = extractor.extractAreas();

        expect(areas.find(v => v.name === "(Esperanza")).toBeUndefined();

        const masbate = areas.find(v => v.name === "Masbate");
        expect(masbate).not.toBeUndefined();
        expect((masbate as LocationWhole).includes?.objects?.includes("Esperanza")).toBeTruthy();
        expect((masbate as LocationWhole).includes?.objects?.includes("Baleno")).toBeTruthy();
        expect((masbate as LocationWhole).includes?.objects?.includes("Mobo")).toBeTruthy();
    });

    test("Duplication fix", () => {
        const extractor = new AreaExtractor(
            "Ilocos Norte\nIlocos Norte",
        );
        const areas = extractor.extractAreas();

        expect(Array.isArray(areas)).toBeTruthy();
        expect(areas.length).toBe(1);
        expect(areas[0]).toMatchObject({
            name: "Ilocos Norte",
            part: false
        });
    });

});

describe("AreaExtractor error handling tests", () => {

    test("Partitioned (failed typo fix)", () => {
        expect(() => {
            const extractor = new AreaExtractor(
                "The extreme northern reigon Biliran (Kawayan)",
            );
            extractor.extractAreas();
        }).toThrow();
    });

    test("Partitioned (unclosed parenthesis)", () => {
        expect(() => {
            const extractor = new AreaExtractor(
                "The northern portion of Biliran (Kawayan, and Guimaras",
            );
            extractor.extractAreas();
        }).toThrow();
    });

    test("Partitioned (sudden termination)", () => {
        expect(() => {
            const extractor = new AreaExtractor(
                "The extreme northwest portion of ",
            );
            extractor.extractAreas();
        }).toThrow();
    });

    test("Rest (sudden termination)", () => {
        expect(() => {
            const extractor = new AreaExtractor(
                "The rest of ",
            );
            extractor.extractAreas();
        }).toThrow();
    });

});
