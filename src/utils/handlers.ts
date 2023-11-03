import { RequestHandler } from "express"
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core'

export const wrapRequestHandler = <ParamsDictionary>(func: RequestHandler<ParamsDictionary, any, any, any>) => {
    return async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
        try 
        {
           await func(req, res, next)
        }  catch (error) {
        next(error)
    }}
}


