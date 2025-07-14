import { faker } from "@faker-js/faker";
import {
    PASSCODE_FORMAT,
    PASSCODE_METHOD,
    PASSCODE_VALID_UNIT,
} from "../config/constants/passCode.js";

function randomAlpha(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

function generateCode(format) {
    switch (format) {
        case PASSCODE_FORMAT["XXX-YYY"]:
            return randomAlpha(3) + "-" + randomAlpha(3);
        case PASSCODE_FORMAT.YYYYYY:
            return randomAlpha(6);
        case PASSCODE_FORMAT.XXXX:
            return randomAlpha(4);
        default:
            return nanoid(6);
    }
}

function calculateValidTill(unit, amount) {
    const now = new Date();
    switch (unit) {
        case PASSCODE_VALID_UNIT.MINUTES:
            return new Date(now.getTime() + amount * 60 * 1000);
        case PASSCODE_VALID_UNIT.HOURS:
            return new Date(now.getTime() + amount * 60 * 60 * 1000);
        case PASSCODE_VALID_UNIT.DAYS:
            return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
        default:
            throw new Error("Invalid valid_unit");
    }
}

export function getRandomPasscode() {
    const method = faker.helpers.arrayElement(Object.values(PASSCODE_METHOD));
    const format = faker.helpers.arrayElement(Object.values(PASSCODE_FORMAT));
    const valid_in = faker.number.int({ min: 1, max: 10 });
    const valid_unit = faker.helpers.arrayElement(
        Object.values(PASSCODE_VALID_UNIT)
    );
    const code = generateCode(format);
    const valid_till = calculateValidTill(valid_unit, valid_in);

    const passcode = {
        code,
        valid_till,
        valid_in,
        valid_unit,
        method,
        format,
    };

    return passcode;
}
