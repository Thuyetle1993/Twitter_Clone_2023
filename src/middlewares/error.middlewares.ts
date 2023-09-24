import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { omit } from "lodash";
import HTTP_STATUS from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/errors";


export const defaultErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof ErrorWithStatus) {
        return res.status(err.status).json(omit(err, ['status']))
    }
    // Lay ra ten cac loi duoi dang Array de lap qua
    Object.getOwnPropertyNames(err).forEach((key) =>  {
        Object.defineProperty(err, key, {enumerable: true})
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        errorInfo: omit(err, ['stack']) 
    })   
} 