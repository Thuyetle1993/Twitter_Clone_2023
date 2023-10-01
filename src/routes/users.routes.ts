
import {Router} from 'express'
const userRouter = Router();
import { emailVerifyController, loginController, logoutController, registerController, resendVerifyEmailController } from '~/controllers/users.controllers';
import { RefreshTokenValidator, accessTokenValidator, emailVerifyTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

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
userRouter.post('/logout',accessTokenValidator, RefreshTokenValidator, wrapRequestHandler(logoutController))

// Method Register + Validation
userRouter.post('/register',registerValidator
, wrapRequestHandler(registerController))


//Route Verify Email
/**
 * Des : Verify email when user client click on the link in email
 * Path : /verify-email
 * Method: POST
 * Body:  {email_verify_token: string}  
 */

userRouter.post('/verify-email',emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Des : Resend Verify email when click on the link in email
 * Path : /resend-verify-email
 * Method: POST
 * Header : {Authorization: Bearer <access_token>}
 * Body:  {}  
 */

userRouter.post('/resend-verify-email',accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

export default userRouter   