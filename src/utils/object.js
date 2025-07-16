export function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function pickFields(obj, fields) {
    const newObj = {};
    fields.forEach((field) => {
        newObj[field] = obj[field];
    });
    return newObj;
}
