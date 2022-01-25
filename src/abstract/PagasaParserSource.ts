import { Bulletin } from "../typedefs/Bulletin";

export abstract class PagasaParserSource {

    public abstract parse(): Bulletin | Promise<Bulletin>;

}
