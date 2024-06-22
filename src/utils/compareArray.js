export function sameItems(a, b, considerOrder = false) {
    if (typeof a !== "object" && typeof b !== "object") {
        return a === b;
    }
    if (considerOrder) {
        return arraysEqual(a, b);
    } else {
        const count1 = countObjectOccurrences(a);
        const count2 = countObjectOccurrences(b);
        return compareObjects(count1, count2);
    }
}

function countObjectOccurrences(array) {
    const count = {};
    for (const item of array) {
        const key = JSON.stringify(item);
        count[key] = (count[key] || 0) + 1;
    }
    return count;
}

function compareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
            return false;
        }
    }

    return true;
}
