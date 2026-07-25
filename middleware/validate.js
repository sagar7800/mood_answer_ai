function formatJoiMessage(error) {
  return error.details?.[0]?.message?.replace(/"/g, "") || "Invalid request data.";
}

function validateBody(schema) {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      res.status(400).json({ error: formatJoiMessage(error) });
      return;
    }

    req.body = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.query, {
      abortEarly: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      res.status(400).json({ error: formatJoiMessage(error) });
      return;
    }

    req.query = value;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.params, {
      abortEarly: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      res.status(400).json({ error: formatJoiMessage(error) });
      return;
    }

    req.params = value;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
