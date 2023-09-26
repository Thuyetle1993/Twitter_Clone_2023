import { config } from 'dotenv'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messsage'
import { ErrorWithStatus } from '~/models/errors'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
config()

// Login middleware
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_EMAIL
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 20
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_STRONG
        }
      }
    },
    ['body']
  )
)

// Register middleware

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_NOT_EMPTY
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_IS_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGES.NAME_LENGTH
        }
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_NOT_EMPTY
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_EMAIL
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_NOT_EMPTY
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 20
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_NOT_EMPTY
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 20
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.PASSWORD_MISMATCH)
            }
            return true
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_ISO8601
        }
      }
    },
    ['body']
  )
)

// AccessToken Validate

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const decoded_authorization = await verifyToken({ token: access_token })
            req.decoded_authorization = decoded_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)
