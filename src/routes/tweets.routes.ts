import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import { RefreshTokenValidator, accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Des : Create tweet
 * Path : /login
 * Method: POST
 * Body:  tweetRequestBody
 */

//Route Logout
tweetsRouter.post(
  '/',
  accessTokenValidator,
  accessTokenValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

export default tweetsRouter
