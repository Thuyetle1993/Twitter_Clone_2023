import { Router } from 'express'
import { likeTweetsController, unlikeTweetController } from '~/controllers/likeTweets.controllers'
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
likeRouter.post('', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likeTweetsController))

/**
 * Des : Unlike Tweet
 * Path : tweets/:tweet_id
 * Method: DELETE
 * Body:  { tweet_id: string}
 * Header:  { Authorization: Bearear <access_token}
 */
likeRouter.delete('/:tweet_id', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(unlikeTweetController))


export default likeRouter
