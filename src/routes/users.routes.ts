
import {Router} from 'express'
const userRouter = Router();
import { loginController, logoutController, registerController } from '~/controllers/users.controllers';
import { RefreshTokenValidator, accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

/**
 * Des : Login a user
 * Path : /login
 * Method: POST
 * Body:  {email: string, password: string} * 
 */


// Method Login
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Des : Logout a user
 * Path : /login
 * Method: POST
 * Header : {Authorization: Bearer <access_token>}
 * Body:  {refresh_token: string}  
 */


// Method Logout
userRouter.post('/logout',accessTokenValidator, RefreshTokenValidator, wrapRequestHandler(logoutController))

// Method Register + Validation
userRouter.post('/register',registerValidator
, wrapRequestHandler(registerController))

export default userRouter   