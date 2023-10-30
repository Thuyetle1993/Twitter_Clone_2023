import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Des : Bookmark Tweet
 * Path : /
 * Method: POST
 * Body:  { tweet_id: string}
 * Header:  { Authorization: Bearear <access_token}
 */
bookmarksRouter.post('', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController))

/**
 * Des : Unbookmark Tweet
 * Path : tweets/:tweet_id
 * Method: DELETE
 * Body:  { tweet_id: string}
 * Header:  { Authorization: Bearear <access_token}
 */
bookmarksRouter.delete('/tweets/:tweet_id', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(unBookmarkTweetController))




export default bookmarksRouter
