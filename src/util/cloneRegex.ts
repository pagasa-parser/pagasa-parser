export default function (regex : RegExp) : RegExp {
    return new RegExp(regex.source, regex.flags);
}
