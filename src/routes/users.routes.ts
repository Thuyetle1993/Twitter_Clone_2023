
import {Router} from 'express'
const userRouter = Router();
import { loginController, registerController } from '~/controllers/users.controllers';
import { loginValidator, registerValidator } from '~/middlewares/validation.middlewares';

// Method Login
userRouter.post('/login', loginValidator, loginController)


// Method Register + Validation
userRouter.post('/register',registerValidator
, registerController)

export default userRouter   