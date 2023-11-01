import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { WithId } from 'mongodb'

class TweetsService {
  //! Check hashtag trong DB va tao moi Hashtag
  async checkAndCreateHashtags(hashtags: string[]) {    
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        //? Tìm hashtag trong DB, nêu có thì lấy, ko có thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    // console.log('hashtagDocuments', hashtagDocuments)    
    const nonNullHashtagDocuments = hashtagDocuments.filter((hashtag) => hashtag !== null) as WithId<Hashtag>[]
    // Bước 2: Ánh xạ để lấy thuộc tính ._id
    const hashtagIds = nonNullHashtagDocuments.map((hashtag) => hashtag._id);
    // console.log(hashtagIds)
    return hashtagIds
  }
  //! Tạo Tweet mới
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    console.log(hashtags)
    const newTweet = new Tweet({
      audience: body.audience,
      content: body.content,
      hashtag: hashtags,
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

  //! Tăng view cho tweet
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id? {user_views: 1} : {guest_views: 1}
    const result = await databaseService.tweets.findOneAndUpdate(
      {_id: new ObjectId(tweet_id)},
      {
        $inc: inc,
        $currentDate: {
          update_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    ) as WithId<{
      guest_views: number
      user_views: number
    }>
    console.log(result)
    return result
  }

  //! Tạo method mơi ở dòng trên
}

const tweetsService = new TweetsService()
export default tweetsService
