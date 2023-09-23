import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import userService from "~/services/users.services";
import { validate } from "~/utils/validation";

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
} 

export const registerValidator = validate(checkSchema({
  name: {
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 100,
      }
    }
  },
  email: {
    notEmpty: true,
    isEmail: true,
    trim: true,
    custom: {
      options: async ( value ) => {
        const isExistEmail = await userService.checkEmailExist( value )
        if (isExistEmail) {
          throw new Error('Email already exists')
        }
        return true
      }
    }
  },
  password: {
    notEmpty: true,
    isString: true,
    isLength: {
      options: {
        min: 6,
        max: 20,
      }
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,      
      },
      errorMessage: 'The password you entered is not strong enough. Please choose a stronger password that includes uppercase letters, lowercase letters, numbers, and special characters'  
    }
  },
  confirm_password: {
    notEmpty: true,
    isString: true,
    isLength: {
      options: {
        min: 6,
        max: 20,
      }
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,      
      },
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
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
      }
    }
  }
}))
