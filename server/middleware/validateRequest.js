const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return res.status(422).json({ errors });
};

module.exports = validateRequest;
