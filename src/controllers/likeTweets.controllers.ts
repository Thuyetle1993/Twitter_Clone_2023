import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/user.request'
import { COMMENTS_MESSAGES, TWEETS_MESSAGES } from '~/constants/messsage'
import { LikeTweetReqBody } from '~/models/request/likeTweets.request'
import likeTweets from '~/services/likes.services'

export const likeTweetsController = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeTweets.likeTweet(user_id, req.body.tweet_id)
  return res.json({
    message: COMMENTS_MESSAGES.LIKE_TWEET_SUCCESS,
    result
  })
}

//! Unlike Tweet Controller 
export const unlikeTweetController = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likeTweets.unlikeTweet(user_id, req.params.tweet_id)
  return res.json({
    message: TWEETS_MESSAGES.UNLIKE_TWEET_SUCCESS
  })
}