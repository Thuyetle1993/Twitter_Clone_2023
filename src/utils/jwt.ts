import { config } from 'dotenv'
import Jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/user.request'
config()

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    Jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw rejects(error)
      }
      resolve(token as string)
    })
  })
}

// Tạo hàm VerifyToken

export const verifyToken = ({
  token,
  secretOrPublicKey
}: {
  token: string
  secretOrPublicKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    Jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}

// signToken({
//   payload: {},
//   options: {
//     algorithm: 'HS256'
//   }
// })
