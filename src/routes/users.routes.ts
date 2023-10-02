import { Router } from 'express'
const userRouter = Router()
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  RefreshTokenValidator,
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

/**
 * Des : Login a user
 * Path : /login
 * Method: POST
 * Body:  {email: string, password: string} *
 */

// Route Login
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Des : Logout a user
 * Path : /login
 * Method: POST
 * Header : {Authorization: Bearer <access_token>}
 * Body:  {refresh_token: string}
 */

//Route Logout
userRouter.post('/logout', accessTokenValidator, RefreshTokenValidator, wrapRequestHandler(logoutController))

// Method Register + Validation
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

//Route Verify Email
/**
 * Des : Verify email when user client click on the link in email
 * Path : /verify-email
 * Method: POST
 * Body:  {email_verify_token: string}
 */

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Des : Resend Verify email when click on the link in email
 * Path : /resend-verify-email
 * Method: POST
 * Header : {Authorization: Bearer <access_token>}
 * Body:  {}
 */

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Des : Submit email to reset password, send email to user
 * Path : /forgot-password
 * Method: POST
 * Body:  {email: string}
 */

userRouter.post('/forgot-password',forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))


/**
 * Des : Verify Link in email to reset password
 * Path : /verify-forgot-password
 * Method: POST
 * Body:  {forgot_password_token: tring}
 */

userRouter.post('/verify-forgot-password',verifyForgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordTokenController))



export default userRouter
