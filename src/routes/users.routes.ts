
import {Router} from 'express'
const userRouter = Router();
import { loginController, registerController } from '~/controllers/users.controllers';
import { loginValidator, registerValidator } from '~/middlewares/validation.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

// Method Login
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))


// Method Register + Validation
userRouter.post('/register',registerValidator
, wrapRequestHandler(registerController))

export default userRouter   