import express from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
   return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    await validation.run(req); // Check loi

    const errors = validationResult(req); // Lay loi ra tu bien req
    // Neu ko co loi
    if (errors.isEmpty()) {
      return next();
    }       
    res.status(400).json({ errors: errors.mapped()});
  };
};  

