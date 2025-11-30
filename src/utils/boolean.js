export function toBool(value) {
    if (typeof value === "boolean") return value; // already boolean
    if (value === "true") return true; // string "true"
    if (value === "false") return false; // string "false"
    if (value === "1") return true; // string "1"
    if (value === "0") return false; // string "0"
    return undefined; // not provided or invalid
}
