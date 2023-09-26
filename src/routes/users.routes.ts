
import {Router} from 'express'
const userRouter = Router();
import { loginController, registerController } from '~/controllers/users.controllers';
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares';
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
userRouter.post('/logout',accessTokenValidator, wrapRequestHandler((req, res) => {
    res.json( { message: 'Logout successfully !'})
}))

// Method Register + Validation
userRouter.post('/register',registerValidator
, wrapRequestHandler(registerController))

export default userRouter   