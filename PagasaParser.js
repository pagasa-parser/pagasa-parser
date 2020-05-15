"use strict";

/**
 *
 * PAGASA Parser
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
 **/

module.exports = {
    PagasaScraper: require("./PagasaScraper"),
    PagasaToWikipedia: require("./formatters/PagasaToWikipedia")
};