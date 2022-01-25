export default class ParsingError extends Error {

    constructor(readonly fault: string) {
        super(fault);
    }

}
