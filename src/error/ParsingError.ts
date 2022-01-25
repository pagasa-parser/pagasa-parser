export default class ParsingError extends Error {

    constructor(readonly fault: string, readonly portion?: string) {
        super(
            portion != null ? `${fault} (portion: ${portion})` : fault
        );
    }

}
