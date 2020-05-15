"use strict";

/**
 *
 * PAGASA Severe Weather Bulletin JSON to Wikitext
 *
 * @author Chlod Alejandro <chlod@chlod.net>
 * @license Apache-2.0
 * @copyright Copyright 2020 Chlod Alejandro
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the 
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
 * either express or implied. See the License for the specific language governing permissions 
 * and limitations under the License.
 * 
 * You can download a copy of the license here:
 * https://www.apache.org/licenses/LICENSE-2.0.txt
 * 
 * This script requires the PagasaScraper script. You can download it from
 * the PAGASA Parser repository, or from Gist.
 * 
 **/

const axios = require("axios");
const fs = require("fs-jetpack");
const path = require("path");

const PagasaScraper = require("../PagasaScraper");

const DATA_DIRECTORY = path.resolve(path.join(__dirname, "..", "data"));

const municipalitiesTransumte = {
    "Albuena": "Albuera"
};

class PagasaToWikipedia {

    constructor() {
        this.linkCache = [];
        this.regions = require(path.join(DATA_DIRECTORY, "ph-regions.json"));
    }

    _issue(issueDetails) {
        if (this.issues === undefined)
            this.issues = [];
        
        this.issues.push(issueDetails);
    }
    
    async getWarningSignalsTemplate(bulletin) {
        if (bulletin === undefined)
            bulletin = await (new PagasaScraper()).pullBulletin();
        else if (typeof bulletin === "string")
            bulletin = JSON.parse(bulletin);

        await this._downloadWikipediaProvinces();
        
        var parsedTCWS = this._reorganizeSignals(bulletin);

        return {
            issues: this.issues ? this.issues : false,
            template: this._generateTemplate(this._toWikitext(parsedTCWS))
        };
    }

    async _downloadWikipediaProvinces() {
        const PROVINCES_FILE = path.join(DATA_DIRECTORY, "wp-provinces.json");

        if (fs.exists(PROVINCES_FILE)) {
            this.provinces = fs.read(PROVINCES_FILE, "json");
        } else {
            var provincesGet = await axios.get("https://en.wikipedia.org/w/api.php", {
                params: {
                    action: "query",
                    format: "json",
                    list: "categorymembers",
                    cmpageid: "722637", // Category:Provinces of the Philippines
                    cmprop: "title",
                    cmnamespace: "0",
                    cmlimit: "max"
                },
                responseType: "json"
            });
    
            this.provinces = [];
            for (var page of provincesGet.data["query"]["categorymembers"]) {
                this.provinces.push(page["title"]);
            }

            fs.write(PROVINCES_FILE, JSON.stringify(this.provinces))
        }
    }

    _generateTemplate(signals) {
        return `{{TyphoonWarningsTable\n`
        + `| PH5 = \n${signals[5].trim()}\n`
        + `| PH4 = \n${signals[4].trim()}\n`
        + `| PH3 = \n${signals[3].trim()}\n`
        + `| PH2 = \n${signals[2].trim()}\n`
        + `| PH1 = \n${signals[1].trim()}\n`
        + `| source = [http://bagong.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin/2 PAGASA]\n`
        + `}}`;
    }

    _toWikitext(parsedTCWS) {
        var signalsWikitext = {};

        for (let signal = 1; signal <= 5; signal++) {
            signalsWikitext[signal] = "";
            var tcwsRegions = parsedTCWS[`${signal}`];

            if (tcwsRegions === null || tcwsRegions === undefined)
                continue;

            if (tcwsRegions["_"] !== undefined) {
                signalsWikitext[signal] += this._getRegionsWikitext(null, tcwsRegions["_"]);
                tcwsRegions["_"] = undefined;
            }

            Object.entries(tcwsRegions).forEach(([regionId, e]) => {
                if (isNaN(+(regionId)))
                    return;

                var region = this.regions[+(regionId)];
                signalsWikitext[signal] += this._getRegionsWikitext(region, e);
            });
        }

        return signalsWikitext;
    }

    _getRegionsWikitext(region, areas) {
        var out = "";
        
        out += this._getRegionHeader(region);

        areas.forEach((v, i) => {
            out += this._getProvinceAsBullet(v, region === null || region === undefined ? "*" : "**");
        });
        return out;
    }

    _getRegionHeader(region) {
        return (region === null || region === undefined) ? "\n" : (`* '''[[${region.name}]]''' `
        + (region.designation !== undefined ? `{{small|(${region.designation})}}\n` : "\n"));
    }

    _getProvinceAsBullet(v, bulletString = "**") {
        var line = "";
        var provincePage = v.province;

        if (!this.provinces.includes(v.province)
            && v.province !== "Metro Manila"
            && !/Islands?$/g.test(v.province)) {
            provincePage += " (province)";
            
            if (!this.provinces.includes(v.province)) {
                this._issue({
                    message: "Page not found for province: " + v.province,
                    province: v.province
                });
                provincePage = undefined;
            }
        }

        var provinceLink = provincePage !== undefined ?
            `[[${provincePage}|${v.province}]]` : `${v.province}`;

        if (!v.part) {
            line += `${bulletString} ${provinceLink}\n`;
        } else {
            switch (v.includes.term.toLowerCase()) {
                case "mainland": {
                    line += `${bulletString} Mainland ${provinceLink}\n`;
                    break;
                }
                case "rest": {
                    line += `${bulletString} the rest of ${provinceLink}\n`;
                    break;
                }
                default: {
                    line += `${bulletString} the ${v.includes.part} ${v.includes.term} of ${provinceLink}`;
                    line += this._linkMunicipalities(v);
                    line += "\n";
    
                    break;
                }
            }
        }

        return line;
    }

    _linkMunicipalities(v) {
        var municipalities = "";
        if (Array.isArray(v.includes.municipalities) && v.includes.municipalities.length > 0) {
            var wikitextMunicipalities = v.includes.municipalities.map((municipality) => {
                var m = municipality
                    .replace(/Sta./g, "Santa")
                    .replace(/Sto./g, "Santo")
                    .replace(/(?:(east|north|south|west)+ern)\s/g, "");
                
                if (municipalitiesTransumte[municipality] !== undefined)
                    m = municipalitiesTransumte["municipality"];
                
                return `[[${m}, ${v.province}|${municipality}]]`
            });
            municipalities += ` {{small|(${wikitextMunicipalities.join(", ")})}}`;
        }

        return municipalities;
    }

    _reorganizeSignals(bulletin) {
        var signals = bulletin["storm_signals"];

        var reorganized = {
            1: signals["1"] !== null ? this._landmassesToRegions(signals["1"]["affected_areas"]) : null,
            2: signals["2"] !== null ? this._landmassesToRegions(signals["2"]["affected_areas"]) : null,
            3: signals["3"] !== null ? this._landmassesToRegions(signals["3"]["affected_areas"]) : null,
            4: signals["4"] !== null ? this._landmassesToRegions(signals["4"]["affected_areas"]) : null,
            5: signals["5"] !== null ? this._landmassesToRegions(signals["5"]["affected_areas"]) : null 
        };

        return reorganized;
    }

    _landmassesToRegions(landmasses) {
        var mixed = [...landmasses["luzon"], ...landmasses["visayas"], ...landmasses["mindanao"]];

        if (landmasses["extras"] !== undefined && Object.keys(landmasses["extras"]) > 0) {
            this._issue({
                message: `Extras detected.`,
                entry: landmasses["extras"]
            });
        }

        var byRegion = {};

        for (var entry of mixed) {
            var regionFound = false;
            this.regions.forEach((element, index) => {
                if (!regionFound && element.provinces.includes(entry["province"])) {
                    if (byRegion[index] === undefined)
                        byRegion[index] = [];

                    byRegion[index].push(entry);
                    regionFound = true;
                }
            });

            if (!regionFound && !/Islands?$/.test(entry.province)) {
                this._issue({
                    message: "Region for " + entry.province + " not found.",
                    entry: entry
                });

                if (byRegion["_"] === undefined)
                    byRegion["_"] = [];

                byRegion["_"].push(entry);
            }
        }

        return byRegion;
    }

}

module.exports = PagasaToWikipedia;