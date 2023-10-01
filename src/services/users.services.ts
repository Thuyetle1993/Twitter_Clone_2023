import { RegisterReqBody } from '~/models/request/user.request'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import refreshTokens from '~/models/schemas/RefreshToken.schema'
import { config } from 'dotenv'
import USERS_MESSAGES from '~/constants/messsage'
config()

class UserService {
  // tao Access Token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
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
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tao signEmailVerifyToken
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRED_IN
      }
    })
  }

  // Tạo private method signAccessAndRefreshToken
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    // const { email, password } = payload
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refress_token] = await this.signAccessAndRefreshToken(user_id.toString())

    // Thêm RF vào DB
    await databaseService.refreshTokens.insertOne(
      new refreshTokens({ user_id: new ObjectId(user_id), token: refress_token })
    )
    console.log('email_verify_token', email_verify_token)
    return {
      access_token,
      refress_token
    }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    // Thêm RF vào DB
    await databaseService.refreshTokens.insertOne(
      new refreshTokens({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }
  // Xoa RF khoi DB
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  // Verify Email
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        [{
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: "$$NOW"
          }
        }]
      )
    ])
    const [access_token, refresh_token] = token    
    return {
      access_token,
      refresh_token
    }
  }

  // Them method moi duoi dong nay
}

const userService = new UserService()
export default userService
