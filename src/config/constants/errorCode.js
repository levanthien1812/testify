export const ERROR_CODE = {
    TEST_ACCESS_DENIED: "TEST_ACCESS_DENIED",
    TEST_NOT_AVAILABLE: "TEST_NOT_AVAILABLE",
    TEST_CLOSED: "TEST_CLOSED",
    PASSCODE_REQUIRED: "PASSCODE_REQUIRED",
    PASSCODE_NOT_FOUND: "PASSCODE_NOT_FOUND",
    INCORRECT_PASSCODE: "INCORRECT_PASSCODE",
    EXPIRED_PASSCODE: "EXPIRED_PASSCODE",
    PASSCODE_NOT_SUPPORTED: "PASSCODE_NOT_SUPPORTED",
};

export const ERROR_MESSAGE = {
    [ERROR_CODE.TEST_ACCESS_DENIED]: "You dont have access to this test!",
    [ERROR_CODE.TEST_NOT_AVAILABLE]:
        "The test you want to access is not available yet!",
    [ERROR_CODE.TEST_CLOSED]: "The test you want to access is already closed!",
    [ERROR_CODE.PASSCODE_REQUIRED]: "Passcode is required for this test!",
    [ERROR_CODE.INCORRECT_PASSCODE]: "Passcode is not correct!",
    [ERROR_CODE.PASSCODE_NOT_SUPPORTED]: "Passcode is not supported!",
    [ERROR_CODE.EXPIRED_PASSCODE]: "Passcode has expired!",
    [ERROR_CODE.PASSCODE_NOT_FOUND]: "Passcode not found!",
};
