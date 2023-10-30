import { Router } from 'express'
import { likeTweetsController, unlikeTweetController } from '~/controllers/likeTweets.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likeRouter = Router()

/**
 * Des : Like Tweet
 * Path : /
 * Method: POST
 * Body:  { tweet_id: string}
 * Header:  { Authorization: Bearear <access_token}
 */
likeRouter.post('', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(likeTweetsController))

/**
 * Des : Unlike Tweet
 * Path : tweets/:tweet_id
 * Method: DELETE
 * Header:  { Authorization: Bearear <access_token}
 */
likeRouter.delete('/:tweet_id', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(unlikeTweetController))


export default likeRouter
