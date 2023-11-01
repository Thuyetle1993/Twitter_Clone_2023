import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/user.request'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/constants/messsage'

// Create Tweets Controller
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
   const { user_id } = req.decoded_authorization as TokenPayload
   const result = await tweetsService.createTweet(user_id, req.body) 
   return res.json({
      message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
      result
   })
} 

//? Get Tweet Controller :
export const getTweetController = async (req: Request, res: Response) => {
   return res.json({
      message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
      result: req.tweet
   })
}