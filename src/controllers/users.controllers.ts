import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import userService from '~/services/users.services'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/request/user.request'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import USERS_MESSAGES from '~/constants/messsage'
import databaseService from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'

// Login Controller
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

// Register Controller
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

// Logout Controller

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}

// VerifyEmail Controller

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  // Nếu ko tìm thấy user thì sẽ báo lỗi

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  /// Sau khi da verify thi token === ''
  /// Se tra về status OK với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
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

// Resend VerifyEmail Controller

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // Neu user ko ton tai
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // User da verify chua
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // Neu chua verify thi goi toi service de gui lai verifytoken va tra ve thong bao da gui lai emailverify
  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}

// ForgotPassword Controller

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response, 
  next: NextFunction) => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString())
  return res.json(result) 
} 

// Verify ForgotPasswordToken Controller
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>, res: Response, 
  next: NextFunction) => {
    return res.json({
      message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
    })
  }