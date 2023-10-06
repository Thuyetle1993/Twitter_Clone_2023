//  const USERS_MESSAGES = {
//     VALIDATION_ERROR: 'Validation error'
// } as const

// export default USERS_MESSAGES

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_NOT_EMPTY: 'Name should not be empty',
  NAME_IS_STRING: 'Name should be a string',
  NAME_NO_SPACES: 'Name should not contain leading or trailing spaces',
  NAME_LENGTH: 'Name length should be between 1 and 100 characters',
  EMAIL_NOT_EMPTY: 'Email should not be empty',
  EMAIL_IS_INVALID: 'Email should be a valid email address',
  EMAIL_NO_SPACES: 'Email should not contain leading or trailing spaces',
  EMAIL_EXISTS: 'Email already exists',
  PASSWORD_NOT_EMPTY: 'Password should not be empty',
  PASSWORD_IS_STRING: 'Password should be a string',
  PASSWORD_LENGTH: 'Password length should be between 6 and 20 characters',
  PASSWORD_STRONG:
    'The password you entered is not strong enough. Please choose a stronger password that includes 1 uppercase letters, 1 lowercase letters, 1 numbers, and 1 special characters',
  CONFIRM_PASSWORD_NOT_EMPTY: 'Confirm password should not be empty',
  CONFIRM_PASSWORD_IS_STRING: 'Confirm password should be a string',
  CONFIRM_PASSWORD_LENGTH: 'Confirm password length should be between 6 and 20 characters',
  PASSWORD_MISMATCH: 'Password confirmation does not match password',
  DATE_OF_BIRTH_ISO8601: 'Date of birth should be in ISO8601 format',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login Successfully!',
  REGISTER_SUCCESS: 'Register Successfully',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgor password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_ME_SUCCESS: 'Get my profile success',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio length must be from 1 to 200',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length must be from 1 to 200',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website length must be from 1 to 200',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username length must be from 1 to 50',
  IMAGE_URL_MUST_BE_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH: 'Username length must be from 1 to 400',
  UPDATE_ME_SUCCESS: 'Update my profile success',
  FOLLOW_SUCCESS: 'Follow success',
  INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
  FOLLOWED: 'Followed'
} as const

export default USERS_MESSAGES
