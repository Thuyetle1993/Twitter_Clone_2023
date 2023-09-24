import { RequestHandler } from "express"
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const wrapRequestHandler = (func: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try 
        {
           await func(req, res, next)
        } catch (error) {
        next(error)
    }}
}