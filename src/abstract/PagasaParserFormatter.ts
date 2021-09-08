import { Bulletin } from "../typedefs/Bulletin";

export abstract class PagasaParserFormatter {

    protected abstract format(bulletin : Bulletin);

}
