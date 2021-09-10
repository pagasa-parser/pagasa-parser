import { Bulletin } from "../typedefs/Bulletin";

export abstract class PagasaParserFormatter<T> {

    public abstract format(bulletin : Bulletin) : T | Promise<T>;

}
