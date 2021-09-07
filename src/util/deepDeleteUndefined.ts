export default function deepDeleteUndefined<T extends Record<string, any>>(object : T) : T {
    for (const key of Object.keys(object)) {
        if (typeof object[key] === "object") {
            deepDeleteUndefined(object[key]);
        } else if (object[key] === undefined) {
            delete object[key];
        }
    }

    return object;
}
