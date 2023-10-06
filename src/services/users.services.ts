import { RegisterReqBody, UpdateMeReqBody } from '~/models/request/user.request'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ObjectId, WithId } from 'mongodb'
import refreshTokens from '~/models/schemas/RefreshToken.schema'
import { config } from 'dotenv'
import USERS_MESSAGES from '~/constants/messsage'
import Follower from '~/models/schemas/Follower.schema'
config()

class UserService {
  // tao Access Token
  private signAccessToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tao Refresh Token
  private signRefreshToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tao signEmailVerifyToken
  private signEmailVerifyToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRED_IN
      }
    })
  }

  // Tao signForgotPasswordToken
  private signForgotPasswordToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        user_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo private method signAccessAndRefreshToken
  private signAccessAndRefreshToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return Promise.all([this.signAccessToken({user_id, verify}), this.signRefreshToken({user_id, verify})])
  }

  async register(payload: RegisterReqBody) {
    // const { email, password } = payload
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refress_token] = await this.signAccessAndRefreshToken({user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })

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
  async login({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })

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
      this.signAccessAndRefreshToken({user_id, verify: UserVerifyStatus.Verified}),
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
    const email_verify_token = await this.signEmailVerifyToken({user_id, verify: UserVerifyStatus.Unverified})
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
  async forgotPassword({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    // Tao token
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
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

  async resetPassword(user_id: string, password: string) {
    databaseService.users.updateOne({_id: new ObjectId(user_id)},
    {
      $set: {
        forgot_password_token: '',
        password: hashPassword(password)
      },
      $currentDate: {
        updated_at: true
      }
    }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  
  // Getme 
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne({_id: new ObjectId(user_id)}, {
      projection: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    })
    return user
  }
  // Update Me
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    // Chỗ này ta dùng một biến khác là_payload sẽ nhận về gía trị là payload hoặc là payload với date_of_birth đã convert sang kiểu Date
    const _payload = payload.date_of_birth ? {...payload, date_of_birth: new Date(payload.date_of_birth)} : payload
    const user  = await databaseService.users.findOneAndUpdate(

      
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {

          ...(_payload as UpdateMeReqBody & {date_of_birth?: Date})
        },
        $currentDate: {
          update_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        includeResultMetadata: true  
      }      
    )
    return user.value        
  }

  // Follower method
  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          follower_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.FOLLOWED
    }    
  }
  // Unfollow method
  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })
    // Không tìm thấy document follower, nghĩa là chưa follow người này
    
    if (follower === null) {     
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    // Tìm thaáy document follower, nghĩa là đã follow người này rồi
    // Thì ta tiền hành xóa document này
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }    
  }

  // Change password
  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  // Them method moi tren dong nay
}

const userService = new UserService() 
export default userService


