import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { Pagination, TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/user.request'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/constants/messsage'
import { TweetType } from '~/constants/enum'

// Create Tweets Controller
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create Tweet Successfully',
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

//? Get Tweet Children Controller :
export const getTweetChildrenController = async (req: Request, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const { total, tweets } = await tweetsService.getTweetChildren({
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

//? Get New Feeds Controller :
export const getNewFeedsController = async (req: Request<ParamsDictionary, any, Pagination>, res: Response) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetsService.getNewFeeds({
    user_id,
    limit,
    page
  })
  return res.json({
    message: TWEETS_MESSAGES.GET_NEW_FEEDS_SUCCESSFULLY,
    result
  })
}
