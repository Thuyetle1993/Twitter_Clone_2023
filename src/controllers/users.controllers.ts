import { NextFunction, Request, Response } from 'express'
import databaseService from '~/services/database.services'
import {ParamsDictionary} from 'express-serve-static-core'


import userService from '~/services/users.services'
import { RegisterReqBody } from '~/models/request/user.request'
import { error } from 'node:console'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import USERS_MESSAGES from '~/constants/messsage'

// Login Controller
export const loginController = async (req: Request, res: Response) => {
  const user  = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result 
  })
}

// Register Controller
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {  
    const result = await userService.register( req.body )   
    return res.json({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      result
    })  
}
