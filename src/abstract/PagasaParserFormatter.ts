import { Bulletin } from "../typedefs/Bulletin";

export abstract class PagasaParserFormatter<T> {

    protected abstract format(bulletin : Bulletin) : T | Promise<T>;

}
