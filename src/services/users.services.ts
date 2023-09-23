import { RegisterReqBody } from "~/models/request/user.request";
import databaseService from "./database.services";
import User from '~/models/schemas/User.schema'
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enum";

class UserService {
  // tao Access Token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  } 
  // Tao Refresh Token
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  } 

  async register(payload: RegisterReqBody) { 
        const { email, password } = payload
        const result = await databaseService.users.insertOne(
            new User({
              ...payload,
              date_of_birth: new Date(payload.date_of_birth),
              password: hashPassword(payload.password)        
            })
          )
          const user_id = result.insertedId.toString()
          const [access_token, refress_token] = await Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
          ])
          return {
            access_token,
            refress_token
          }
  }
  async checkEmailExist(email: string) {
      const user = await databaseService.users.findOne({ email })
      return Boolean(user)
  }
}

const userService = new UserService()
export default userService