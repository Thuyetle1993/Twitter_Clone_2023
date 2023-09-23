import { Request, Response } from 'express'
import databaseService from '~/services/database.services'
import {ParamsDictionary} from 'express-serve-static-core'


import userService from '~/services/users.services'
import { RegisterReqBody } from '~/models/request/user.request'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'ledangthuyet@gmail.com' && password === '123456') {
    return res.status(200).json({
      message: 'Login success, Welcome ThuyetLe aloha !!'
    })
  }
  return res.status(400).json({
    error: 'Login Failed'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await userService.register( req.body )
   
    return res.json({
      message: 'Login Success!',
      result
    })
  } catch (error) {  
    return res.status(400).json({
      error: 'Login Failed'
    })
  }
}
