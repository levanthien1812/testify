export const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("password must be as least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

export const test_date = (value, helpers) => {
  if (new Date(value) < new Date()) {
    return helpers.message("Test date must be after now");
  }

  return value;
};
