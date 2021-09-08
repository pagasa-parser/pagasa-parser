import { Bulletin } from "../typedefs/Bulletin";

export abstract class PagasaParserSource {

    protected abstract parse() : Bulletin;

}
