import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/user.request'
import tweetsService from '~/services/tweets.services'

// Create Tweets Controller
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
   const { user_id } = req.decoded_authorization as TokenPayload
   const result = await tweetsService.createTweet(user_id, req.body) 
   return res.json({
      message: 'Create Tweet Successfully',
      result
   })
} 