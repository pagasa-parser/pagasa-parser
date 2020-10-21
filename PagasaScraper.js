"use strict";

/**
 *
 * PAGASA Severe Weather Bulletin Scraper
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
 * Feel free to use this however you want. But please, be respectful of PAGASA, and avoid
 * requesting from their webpage every second.
 * 
 **/

const cheerio = require("cheerio");
const axios = require("axios");

class PagasaScraper {
    
    constructor(axiosOptions) {
        this.axiosOptions = axiosOptions;
    }
    
    async pullBulletin() {
        var page = await axios.get("http://bagong.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin/2", this.axiosOptions);
        
        if (page.data.includes("No Active Tropical Cyclone within the Philippine Area of Responsibility"))
            return {
                typhoon: null,
                bulletin: null,
                storm_signals: {
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                }
            };
        
        this.$ = cheerio.load(page.data);

        return this._parseBulletin();
    }

    _extractSections(areas) {
        var extractionRegex = /(?:(?:(?:and\s+)?the\s+)?((?:rest\s+of\s+the\s+)?(?:extreme\s)?[a-z]+(?:\sand\s[a-z]+)?)\s((?:[a-z]+tions?)+)(?:\sof)?(?:\smainland)?\s)?((?:[\xF1\w]+|\s)+?)[\s,]{0,2}\((.+?)\)/gi;
        
        let match;
        var matchList = [];
        
        while ((match = extractionRegex.exec(areas)) != null) {
            var includes = [];

            match[4].split(", ").forEach(e => {
                e.split(",").forEach(e => {
                    includes.push(e.replace(/\s?city$/gi, ""));
                })
            });

            matchList.push({
                province: match[3],
                part: true,
                includes: {
                    part: match[1] || "",
                    term: match[2] || "part",
                    municipalities: includes.sort()
                }
            });
        }

        areas = areas.replace(extractionRegex, "").replace(/,{2}/g, ",");

        return {
            new: areas,
            list: matchList
        };
    }

    _extractRests(areas) {
        var extractionRegex = /(?:the\s)?rest\sof(?:\smainland)?\s((?:[\xF1\w\s]+|\s)+?)\b/gi;
        
        let match;
        var matchList = [];
        
        while ((match = extractionRegex.exec(areas)) != null) {
            matchList.push({
                province: match[1],
                part: true,
                includes: {
                    part: "rest",
                    term: "rest"
                }
            });
        }

        areas = areas.replace(extractionRegex, "").replace(/,{2}/g, ",");

        return {
            new: areas,
            list: matchList
        };
    }

    _extractIslands(areas) {
        var extractionRegex = /\b((?:[\xF1\w]+(\sand\s[\xF1\w]+)?)+\sIslands?)\b/gi;
        
        let match;
        var matchList = [];
        
        while ((match = extractionRegex.exec(areas)) != null) {
            if (match[1].includes(" and ")) {
                for (const island of match[1].replace(/\sIslands?/g, "").replace(/\sand\s/gi, ",").split(","))
                    matchList.push({
                        province: island + " Island",
                        part: false
                    });
            } else {
                matchList.push({
                    province: match[1],
                    part: false
                });
            }
        }

        areas = areas.replace(extractionRegex, "").replace(/,{2}/g, ",");

        return {
            new: areas,
            list: matchList
        };
    }

    _extractMainlands(areas) {
        var extractionRegex = /\b(mainland)\s((?:[\xF1\w\s]+|\s)+)\b/gi;
        
        let match;
        var matchList = [];
        
        while ((match = extractionRegex.exec(areas)) != null) {
            matchList.push({
                province: match[2],
                part: true,
                includes: {
                    part: match[1],
                    term: match[1],
                }
            });
        }

        areas = areas.replace(extractionRegex, "").replace(/,{2}/g, ",");

        return {
            new: areas,
            list: matchList
        };
    }

    _extractWholes(areas) {
        var extractionRegex = /\b((?:[\xF1\w\s]+|\s)+)\b/gi;
        
        let match;
        var matchList = [];
        
        while ((match = extractionRegex.exec(areas)) != null) {
            matchList.push({
                province: match[1],
                part: false
            });
        }

        areas = areas.replace(extractionRegex, "").replace(/,{2}/g, ",");

        return {
            new: areas,
            list: matchList
        };
    }

    _mapLandmasses(areas) {
        var landmasses = this.$(areas).children("li");
        var final = {};
        landmasses.each((i, e) => {
            var landmass = this.$(e).children(":first-child");
            var content = this.$(e).children("ul").children("li");

            var finalContent = "";

            content.each((i2, e2) => {
                finalContent += this.$(e2).text() + ",";
            });

            finalContent = finalContent.replace(/,+$/g, "");
            
            final[landmass.text().toLowerCase()] = finalContent;
        });
        return final;
    }

    _parseAffectedAreas(areasElement) {
        var landmasses = this._mapLandmasses(areasElement);

        var finalAffectedAreas = {};

        Object.entries(landmasses).forEach(([i, landmassElement]) => {
            var areas = landmassElement;
            areas = areas
                .replace(/(,\s+|,\s?and\s|\s?including\s)/g, ",")
                .replace(/\s{2,}/, " ")
                .replace(/\.$/g, "")
                .replace(/Ã±/g, "\u00f1");
            
            // Correct errors
            areas = areas
                .replace(/the\s(the)+/gi, "the")
                .replace(/(rest\s+of\s+)(([a-z]+(?:\sand\s[a-z]+)?)\s((?:[a-z]+tions?)+))/gi, "$1the $2");

            var sections = this._extractSections(areas);
            areas = sections["new"];
            sections = sections["list"];

            var rests = this._extractRests(areas);
            areas = rests["new"];
            rests = rests["list"];

            var mainlands = this._extractMainlands(areas);
            areas = mainlands["new"];
            mainlands = mainlands["list"];

            var islands = this._extractIslands(areas);
            areas = islands["new"];
            islands = islands["list"];

            var wholes = this._extractWholes(areas);
            areas = wholes["new"];
            wholes = wholes["list"];

            finalAffectedAreas[i] = [...wholes, ...mainlands, ...islands, ...rests, ...sections];
            finalAffectedAreas[i] = finalAffectedAreas[i].filter((e) => {
                return e.province !== "and";
            });

            if (/[^,.\- ]/gi.test(areas)) {
                if (finalAffectedAreas["extras"] === undefined)
                    finalAffectedAreas["extras"] = {};
                finalAffectedAreas["extras"][i] = areas;
            }
        });

        return finalAffectedAreas;
    }

    _parseTCWSRows(rawRows) {
        var finalRows = {};
        Object.assign(finalRows, rawRows);

        Object.entries(finalRows).forEach(([i, e]) => {
            var e = this.$(finalRows[i]);
            switch(i) {
                case "affected_areas": {
                    finalRows[i] = this._parseAffectedAreas(e);
                    break;
                }
                default: {
                    finalRows[i] = [];
                    this.$(e.children("li")).each((i2, e2) => {
                        finalRows[i].push(this.$(e2).text().trim());
                    });
                }
            }
        });

        return finalRows;
    }
    
    _grabTCWSLevel(level) {
        // Get signal table from DOM
        var indicator = this.$(`.signalno${level}`);

        if (indicator === null || indicator === undefined || indicator.length === 0)
            return null;

        var header = indicator.parent().parent();
        var body = header.next();
        
        // Parse table rows into object
        var rawRows = {};
        var signalRows = body.children("tr");
        signalRows.each((i, e) => {
            var title = this.$(e).children("td:first-child");
            var content = this.$(e).children("td:not(:first-child)");

            if (content.length > 1) {
                var newHTML = this.$(content).children(":first-child").html();
                content.each((i, e) => {
                    newHTML += e.html();
                });
                content.html(newHTML);
            }

            rawRows[
                title.text().trim().toLowerCase().replace(/\s/g, "_")
            ] = content.html();
        })

        return this._parseTCWSRows(rawRows);
    }

    _extractTyphoonDetails() {
        var centerInfo = /\(([0-9.]+).+?([NS]).+?([0-9.]+).+?([EW]).*?\)\s*$/gi.exec(this.$(".panel-heading:contains('Location of Eye/center') + .panel-body").text());
        
        return {
            name: /\"(.+)\"/g.exec(this.$("#tcwb-1 h3").text())[1],
            center: {
                lat: centerInfo[2] === "N" ? centerInfo[1] : -centerInfo[1],
                lon: centerInfo[4] === "E" ? centerInfo[3] : -centerInfo[3]
            },
            movement: this.$(".panel-heading:contains('Movement') + .panel-body").text().trim()
        };
    }

    _extractBulletinDetails(typhoonDetails) {
        var issued = new Date(Date.parse(/Issued at .+/gi.exec(this.$(":contains('Issued at')").filter((i, e) => {
            return /Issued at [0-9]+:[0-9]+\s?[apm]+,?\s?[0-9]+\s[a-z]+\s[0-9]+/gi.test(this.$(e).text());
        }).text())));
        
        issued.setHours(issued.getHours() - 8);
        
        return {
            issued_timestamp: issued.getTime(),
            issued: issued.toUTCString(),
            summary: this.$(".row h5:contains('\"" + typhoonDetails.name.toUpperCase() + "\"')").text()
        };
    }

    _parseBulletin() {
        
        
        var typhoonDetails = this._extractTyphoonDetails();
        var final = {
            typhoon: typhoonDetails,
            bulletin: this._extractBulletinDetails(typhoonDetails),
            storm_signals: {
                1: this._grabTCWSLevel(1),
                2: this._grabTCWSLevel(2),
                3: this._grabTCWSLevel(3),
                4: this._grabTCWSLevel(4),
                5: this._grabTCWSLevel(5),
            }
        }

        return final;
    }
    
}

module.exports = PagasaScraper;