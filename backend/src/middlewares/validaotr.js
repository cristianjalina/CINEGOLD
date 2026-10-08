export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.validated = parsed;
      return next();
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de entrada inválidos',
        errors: error.errors.map((e) => ({ campo: e.path.join('.'), error: e.message })),
      });
    }
  };
}
