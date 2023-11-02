import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/user.request'
import tweetsService from '~/services/tweets.services'
import { COMMENTS_MESSAGES, TWEETS_MESSAGES } from '~/constants/messsage'
import { TweetType } from '~/constants/enum'

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
   const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
   // console.log(result)
   const tweet = {
      ...req.tweet,
      guest_views: result.guest_views,
      user_views: result.user_views
   }
   return res.json({
      message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
      result: tweet
   })
}

//? Get Tweet Children Controller :
export const getTweetChildrenController = async (req: Request, res: Response) => {
   const tweet_type = Number(req.query.tweet_type as string) as TweetType
   const limit = Number(req.query.limit as string)
   const page = Number(req.query.page as string)
   const { total, tweets} = await tweetsService.getTweetChildren(
      {
         tweet_id: req.params.tweet_id,
         tweet_type,
         limit,
         page      
      })
   return res.json({
      message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
      result: {
         tweets,
         tweet_type,
         limit,
         page,
         total_item: total,
         total_page: Math.ceil(total / limit)
      }
   })
}