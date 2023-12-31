import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Des : Create tweet
 * Path : /
 * Method: POST
 * Body:  tweetRequestBody
 */

//? Create Tweet
tweetsRouter.post(
  '/',
  accessTokenValidator,
  accessTokenValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)
/**
 * Des : Get Tweet Detail
 * Path : /:tweet_id
 * Method: GET
 * Header: { Authorization? Bearer <access_token}
 */

//? Get tweet
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

//? Get Tweet Children
/**
 * Des : Get Tweet Children
 * Path : /:tweet_id/children
 * Method: GET
 * Header: { Authorization? Bearer <access_token}
 * Query: {limit: number, page: number, tweet_type:TweetType, page: number}
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

//? Get New feeds
/**
 * Des : Get new feeds
 * Path : /
 * Method: GET
 * Header: { Authorization? Bearer <access_token}
 * Query: {limit: number, page: number}
 *
 */
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)
export default tweetsRouter
