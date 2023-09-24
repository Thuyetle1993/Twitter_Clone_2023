import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import USERS_MESSAGES from "~/constants/messsage";
import databaseService from "~/services/database.services";
import userService from "~/services/users.services";
import { validate } from "~/utils/validation";


// Login middleware
export const loginValidator = validate(
  checkSchema( {
    email: {      
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_EMAIL
      },
      trim: true,
      custom: {
        options: async ( value, {req} ) => {
          const user = await databaseService.users.findOne({email: value})
          if (user === null) {
            throw new Error(USERS_MESSAGES.USER_NOT_FOUND)          
          }
          req.user = user
          return true
        }
      }
    },
    password: {      
      isString:  {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_STRING
      },
      isLength: {
        options: {
          min: 6,
          max: 20,
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,      
        },
        errorMessage: USERS_MESSAGES.PASSWORD_STRONG 
      }
    }
  }
  )
)

// Register middleware

export const registerValidator = validate(checkSchema({
  name: {
    notEmpty: {
      errorMessage: USERS_MESSAGES.NAME_NOT_EMPTY
    },
    isString:  {
      errorMessage: USERS_MESSAGES.NAME_IS_STRING
    },
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 100,
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
      options: async ( value ) => {
        const isExistEmail = await userService.checkEmailExist( value )
        if (isExistEmail) {
          throw new Error(USERS_MESSAGES.EMAIL_EXISTS)          
        }
        return true
      }
    }
  },
  password: {
    notEmpty:  {
      errorMessage: USERS_MESSAGES.PASSWORD_NOT_EMPTY
    },
    isString:  {
      errorMessage: USERS_MESSAGES.PASSWORD_IS_STRING
    },
    isLength: {
      options: {
        min: 6,
        max: 20,
      },
      errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,      
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
        max: 20,
      },      
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH    
    },    
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(USERS_MESSAGES.PASSWORD_MISMATCH);
        }
        return true;
    }    
    },
  },  
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true,
      },
      errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_ISO8601
    }
  }
}))
