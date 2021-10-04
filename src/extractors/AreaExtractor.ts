import {Area, Island, LocationMainland, LocationPart, LocationRest, LocationWhole} from "../typedefs/Area";
import stringSimilarity from "string-similarity";
import ParsingError from "../error/ParsingError";
import deepDeleteUndefined from "../util/deepDeleteUndefined";

interface AreaExtractorSubroutine {
    matcher: (term : string) => boolean;
    function: (startingTerm : string, startingPos : number) => Area | Area[];
}

export default class AreaExtractor {

    private readonly areaString : string;
    private get currentChar() : string {
        return this.currentPos < this.areaString.length ?
            this.areaString[this.currentPos] : null;
    };
    private currentPos : number = 0;

    private readonly subroutines = {
        directional: <AreaExtractorSubroutine>{
            // Directional
            matcher: (term) => /central|(north|east|west|south){1,2}ern/g.test(term),
            function: this.extractPartitioned
        },
        extremes: <AreaExtractorSubroutine>{
            // Extreme portions
            matcher: (term) => /far|extreme/g.test(term),
            function: this.extractPartitioned
        },
        rest: <AreaExtractorSubroutine>{
            // Rest of area
            matcher: (term) => /rest/g.test(term),
            function: this.extractRest
        },
        mainland: <AreaExtractorSubroutine>{
            // Mainland area
            matcher: (term) => /mainland/g.test(term),
            function: this.extractMainland
        },
        location: <AreaExtractorSubroutine>{
            // Likely a location
            matcher: () => true,
            function: this.extractLocation
        }
    };

    constructor(areaString : string) {
        this.areaString = areaString.replace(/\n+/g, " ").trim().replace(/\.$/, "");
        this.currentPos = 0;
    }

    extractAreas() : Area[] {
        if (this.areaString.length === 0)
            return [];

        const extractedAreas : Area[] = [];

        do {
            const pos = this.currentPos;
            const term = this.nextTerm();

            if (/^(?:the|and)$/gi.test(term))
                continue;

            for (const subroutine of Object.values(this.subroutines)) {
                if (subroutine.matcher(term)) {
                    const area = subroutine.function.call(this, term, pos);
                    extractedAreas.push(...(Array.isArray(area) ? area : [area]));
                    break;
                }
            }

            while (this.peek(/\s|,/g))
                this.shift();
        } while (this.currentPos < this.areaString.length);

        // Clean output
        deepDeleteUndefined(extractedAreas);

        return extractedAreas;
    }

    private shift() : void {
        ++this.currentPos;
    }

    private peek(matcher : string | RegExp) : boolean {
        return typeof matcher === "string" ?
            this.currentChar === matcher : matcher.test(this.currentChar);
    }

    private match(matcher : string | RegExp) : boolean {
        if (this.peek(matcher)) {
            this.shift();
            return true;
        }
        return false;
    }

    private peekTerm() : string {
        let term : string = "";
        let startPos = this.currentPos;

        while (this.peek(" "))
            this.shift();

        do {
            if (this.currentChar == null) return null;

            term += this.currentChar;
            this.shift();
        } while (
            !this.peek(" ")
            && this.currentPos < this.areaString.length
        );

        this.currentPos = startPos;
        return term;
    }

    private nextTerm(matcher : string | RegExp = " ") : string {
        let term : string = "";

        while (this.peek(" "))
            this.shift();

        do {
            if (this.currentChar == null) return null;

            term += this.currentChar;
            this.shift();
        } while (
            !this.peek(matcher)
            && this.currentPos < this.areaString.length
        );

        return term;
    }

    private nextLocation() : string {
        let term : string = "";

        while (this.peek(" "))
            this.shift();

        do {
            if (this.currentChar == null) return null;

            term += this.currentChar;
            this.shift();
        } while (
            !this.peek(/[(),]/g)
            && this.peekTerm() !== "including"
            && this.areaString.substr(this.currentPos, 5) !== " and "
            && this.currentPos < this.areaString.length
        );

        return term;
    }

    private extractPartitionComponents() : { name: string; parts?: string[], islands?: Island[] } {
        const name = this.nextLocation().trim();

        const parts = [];
        if (this.match("(")) {
            do {
                let location = this.nextLocation();
                if (location.endsWith("Is."))
                    location = location.replace(/Is\./g, "Island");
                parts.push(location);

                while (this.peek(/\s|,/g))
                    this.shift();
            } while (!this.match(")"));
        }

        let islands;
        if (stringSimilarity.compareTwoStrings(this.peekTerm() ?? "", "including") >= 0.5) {
            // Shift "including"
            this.nextTerm();
            islands = this.extractIslands();
        }

        return {
            name, parts, islands
        }
    }

    private extractPartitioned(startingTerm : string) : LocationPart {
        // and the <southern> <portion> of <Catanduanes> (<Virac>)
        // and the <extreme northern> <region> of <Nueva Ecija> (<Carranglan, Lupao, Pantabangan>)
        let part = startingTerm;

        let term : string;
        do {
            const currentTerm = this.nextTerm();

            if (currentTerm == null)
                throw new ParsingError("Unexpected end of string", currentTerm);

            const stringMatch =
                stringSimilarity.findBestMatch(currentTerm, ["portion", "region"]);
            if (stringMatch.bestMatch.rating >= 0.5) {
                term = stringMatch.bestMatch.target;
            } else {
                part += " " + currentTerm
            }
        } while (term == null);

        // Skip "of"
        if (this.peekTerm() === "of") {
            this.nextTerm();
        }

        let mainland : true | null;
        if (this.peekTerm() === "mainland") {
            this.nextTerm();
            mainland = true;
        }

        const {name, parts, islands} = this.extractPartitionComponents();

        return {
            name: name,
            part: true,
            includes: {
                type: "section",
                term: term,
                part: part,
                objects: parts,
                mainland: mainland ?? undefined
            },
            islands: islands
        }
    }

    private extractRest(startingTerm : string) : LocationRest | LocationPart {
        const startingPos = this.currentPos;

        // Strip "of" and "the"
        while (["of", "the"].includes(this.peekTerm())) {
            this.nextTerm();
        }

        // Redirect if actually partitioned
        if (this.subroutines.directional.matcher(this.peekTerm())) {
            this.currentPos = startingPos;
            return this.extractPartitioned(startingTerm);
        }

        let term;
        if (stringSimilarity.compareTwoStrings(this.peekTerm(), "mainland") >= 0.5) {
            term = this.nextTerm();
        }

        const {name, parts, islands} = this.extractPartitionComponents();

        return {
            name: name,
            part: true,
            includes: {
                type: "rest",
                term: term,
                objects: parts.length > 0 ? parts : undefined
            },
            islands: islands
        }
    }

    private extractMainland() : LocationMainland {
        return {
            name: this.nextLocation().trim(),
            part: true,
            includes: {
                type: "mainland"
            }
        }
    }

    private extractLocation(_ : string, startingPos : number) : LocationWhole | Island[] {
        this.currentPos = startingPos;

        const name = this.nextLocation().trim();

        let islands;
        if (this.peekTerm() === "including") {
            this.nextTerm();
            islands = this.extractIslands();
        }

        // Redirect if islands
        if (/Islands?$/gi.test(name)) {
            this.currentPos = startingPos;
            return this.extractIslands();
        }

        return {
            name: name,
            part: false,
            islands: islands
        }
    }

    private extractIslands() : Island[] {
        const islands : Island[] = [];
        const islandNames : string[] = [];

        do {
            // Remove trailing commas and whitespace.
            let islandName = this.nextTerm(/\s|,/g);

            if (/Islands?$/.test(islandName)) {
                break;
            } else if (islandName !== "and") {
                islandNames.push(islandName);
            }
        } while (!this.peek(",") && this.currentChar !== null);

        for (const name of islandNames) {
            islands.push({
                name: `${name} Island`,
                part: false
            });
        }

        return islands;
    }

}
