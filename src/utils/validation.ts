import express from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import HTTP_STATUS from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/errors';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
   return async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    await validation.run(req); // Check loi

    const errors = validationResult(req); // Lay loi ra tu bien req và trả về cho errors

    // Neu ko co loi thi next tiep tuc request
    if (errors.isEmpty()) { 
      return next();
    }    
    // Nếu có lỗi thì thực hiện phía dưới:

    const errorObject = errors.mapped() 
    const entityError = new EntityError({errors: {}})

    for ( const key in errorObject) {
      const {msg} = errorObject[key]
      // Trả về lỗi không phải là lỗi do Validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorObject[key]
    }
    // Đây là lỗi do Validate       
    // res.status(422).json({ errors: errorObject});
    next(entityError)
  };
};  
  
