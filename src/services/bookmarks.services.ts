import databaseService from './database.services'
import Bookmark from '~/models/schemas/bookmark.schema'
import { ObjectId } from 'mongodb'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweetId)
    },
    {
        $setOnInsert: new Bookmark({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(tweetId)
        })
    },
    {
        upsert: true,
        returnDocument: 'after'
    }
    )
    console.log(result)
    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
