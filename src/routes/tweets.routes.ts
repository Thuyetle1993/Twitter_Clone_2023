import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import {wrapRequestHandler } from '~/utils/handlers'

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
 * Des : Create Tweet Detail
 * Path : /:tweet_id
 * Method: GET
 * Header: { Authorization? Bearer <access_token}
 */

//? Get tweet
tweetsRouter.get('/:tweet_id', tweetIdValidator, isUserLoggedValidator(accessTokenValidator), 
isUserLoggedValidator(verifiedUserValidator), audienceValidator,
wrapRequestHandler(getTweetController))



export default tweetsRouter


