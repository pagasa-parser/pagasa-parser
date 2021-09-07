# PAGASA Parser
[![npm version](https://img.shields.io/npm/v/pagasa-parser.svg?style=flat-square)](https://www.npmjs.org/package/pagasa-parser)
[![npm downloads](https://img.shields.io/npm/dm/pagasa-parser.svg?style=flat-square)](http://npm-stat.com/charts.html?package=pagasa-parser)

The **PAGASA Parser** is a Node.js library that parses information from PAGASA's Tropical Cyclone Bulletins (TCB) and turns it into various formats.

## Warning
Please avoid misusing the library in a way that may cause the servers of PAGASA to be under load. Respect the usual web crawling guidelines. The contributors of PAGASA Parser are not liable for any damage caused as an effect of the usage of this library. (see license)

## Usage
This dependency merely contains type definitions and assistance functions. To convert the data into a different format, or to turn raw information into PAGASA Parser-compatible data, you must use a formatter such as [`@pagasa-parser/formatter-wikipedia`](https://www.npmjs.com/package/@pagasa-parser/formatter-wikipedia) or [`@pagasa-parser/source-xml`](https://www.npmjs.com/package/@pagasa-parser/source-xml).
