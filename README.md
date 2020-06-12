# PAGASA Parser
[![npm version](https://img.shields.io/npm/v/pagasa-parser.svg?style=flat-square)](https://www.npmjs.org/package/pagasa-parser)
[![npm downloads](https://img.shields.io/npm/dm/pagasa-parser.svg?style=flat-square)](http://npm-stat.com/charts.html?package=pagasa-parser)

The **PAGASA Parser** is a Node.js library that parses information from PAGASA's Severe Weather Bulletin (SWB) page and turns it into various formats.

## Warning
Please avoid misusing the library in a way that may cause the servers of PAGASA to be under load. Respect the usual web crawling guidelines. The contributors of PAGASA Parser are not liable for any damage caused as an effect of the usage of this library. (see license)

Additionally, this scraper is in no way a very good one. This scraper is unable to automatically fix typos on the PAGASA. This requires manual correction.

## Usage

To use the library, require `pagasa-parser` into your script.
```js
const { PagasaScraper } = require("pagasa-parser");
```

From here, you can use the tools that PAGASA Parser provides.

```js
const { PagasaScraper, PagasaToWikipedia } = require("pagasa-parser");

// Since pullBulletin() and getWarningSignalsTemplate() are async,
// they need to be inside of an asynchronus function. Like this.
(async () => {
    var swbJSON = await (new PagasaScraper()).pullBulletin();

    // You can pass nothing to getWarningSignalsTemplate()
    // to automatically parse the latest bulletin.
    var wikitextSignalsTable =
        await (new PagasaToWikipedia()).getWarningSignalsTemplate(swbJSON);

    // Example output:
    //
    // {{TyphoonWarningsTable
    // | PH5 =
    // | PH4 =
    // | PH3 =
    // | PH2 =
    // * '''[[Cagayan Valley]]''' {{small|(Region II)}}
    // ** [[Nueva Vizcaya|Nueva Vizcaya]]
    // ** [[Quirino|Quirino]]
    // | PH1 = 
    // * '''[[Cordillera Administrative Region]]''' {{small|(CAR)}}
    // ** [[Abra (province)|Abra]]
    // ...
    //
    console.log(wikitextSignalsTable.template);
    
})();
```

## Parts
* **PagasaParser** - the main file. From here, you can extract PAGASA Parser's classes.
* **PagasaScraper**:*`pullBulletin()`* - the primary web scraper, which processes [PAGASA's SWB page](http://bagong.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin/2) into a usable JSON format.
* **PagasaToWikipedia**:*`getWarningSignalsTemplate()`* - parses the JSON format of the SWB and creates a [Template:TyphoonWarningsTable](https://en.wikipedia.org/wiki/Template:TyphoonWarningsTable) from the storm signals.

## Demonstration
A live demonstration of `PagasaScraper` can be seen at [https://wiki.chlod.net/tools/pagasa-bulletin-json](https://wiki.chlod.net/tools/pagasa-bulletin-json).