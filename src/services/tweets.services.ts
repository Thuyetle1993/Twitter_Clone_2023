import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'

class TweetsService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const newTweet = new Tweet({
      audience: body.audience,
      content: body.content,
      hashtag: [], // tạm thời để trống
      mentions: body.mentions, // constructor sẽ chuyển đổi
      medias: body.medias,
      parent_id: body.parent_id ? new ObjectId(body.parent_id) : null, // chuyển đổi tại đây
      type: body.type,
      user_id: new ObjectId(user_id)
    })
    const result = await databaseService.tweets.insertOne(newTweet)
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetsService = new TweetsService()
export default tweetsService
