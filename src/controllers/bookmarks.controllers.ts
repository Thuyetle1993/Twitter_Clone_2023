import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/user.request'
import { BookmarkTweetReqBody } from '~/models/request/bookmark.request'
import bookmarkService from '~/services/bookmarks.services'
import { COMMENTS_MESSAGES, TWEETS_MESSAGES } from '~/constants/messsage'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: COMMENTS_MESSAGES.BOOKMARK_SUCCESS,
    result
  })
}
//? Unbookmark Tweet
export const unBookmarkTweetController = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)
  return res.json({
    message: TWEETS_MESSAGES.UNBOOKMARK_SUCCESSFULLY
  })
}