import { Request, Response } from 'express'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

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

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await userService.register({ email, password })
   
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
