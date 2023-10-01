import { NextFunction, Request, Response } from 'express'
import {ParamsDictionary} from 'express-serve-static-core'


import userService from '~/services/users.services'
import { LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/request/user.request'
import { error } from 'node:console'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import USERS_MESSAGES from '~/constants/messsage'
import databaseService from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'

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
 
// Logout Controller

export const logoutController = async(req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const {refresh_token} = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
 }

// VerifyEmail Controller

 export const emailVerifyValidator = async ( req: Request, res: Response, next: NextFunction) => {
   const {user_id} = req.decoded_email_verify_token as TokenPayload
   const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
   })
   // Nếu ko tìm thấy user thì sẽ báo lỗi 

   if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND,
    })
   }
   /// Sau khi da verify thi token === '' 
   /// Se tra về status OK với message là đã verify trước đó rồi
   if ( user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
   }
   //Nếu chưa verify thì sẽ gọi tới userservice
   const result = await userService.verifyEmail(user_id)
   return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
   })
 }