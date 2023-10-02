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

  // Tao signForgotPasswordToken
  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
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

  // Resend Verify Email

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    // Chua co gui email nen ta se in ra de test nhu sau
    console.log('Resend verify email:', email_verify_token)

    // Cap nhat lai gia tri email_verify_token trong document user
    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      {
      $set: {
        email_verify_token, 
      },
      $currentDate: {
        updated_at: true      
      } 
    })
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  // Forgot password 
  async forgotPassword(user_id: string) {
    // Tao token
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    // Update token
    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      [{
        $set: { 
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }]
      )
    // Gui email kem link den nguoi dung : http://twitter.com/forgot-password?token=token
      console.log('forgot_passwrod_token: ', forgot_password_token)
      return {
        message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
      }
  }

  // Them method moi duoi dong nay
}

const userService = new UserService() 
export default userService
