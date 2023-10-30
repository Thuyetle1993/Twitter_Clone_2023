import LikeTweets from '~/models/schemas/Like.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class LikeTweetsService {
  async likeTweet(user_id: string, tweetId: string) {
    const result = await databaseService.likeTweets.findOneAndUpdate({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweetId)
    },
    {
        $setOnInsert: new LikeTweets({
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
  //! Unlike tweet :
  async unlikeTweet(user_id: string, tweetId: string) {
    const result = await databaseService.likeTweets.findOneAndDelete(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweetId)
      })
    return result
  }


  
  //! Thêm method ở dòng trên
}

const likeTweets = new LikeTweetsService()
export default likeTweets