import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { WithId } from 'mongodb'
import { TweetType } from '~/constants/enum'

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
    const hashtagIds = nonNullHashtagDocuments.map((hashtag) => hashtag._id)
    // console.log(hashtagIds)
    return hashtagIds
  }
  //! Tạo Tweet mới
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)    
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
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = (await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
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
          user_views: 1,
          updated_at: 1
        }
      }
    )) as unknown as WithId<{
      //! tam thoi fix loi khi them trương updated_at o day
      guest_views: number
      user_views: number
      updated_at: Date
    }>
    console.log(result)
    return result
  }

  //! Get tweetChildren
  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string 
  }) {
    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtag',
            foreignField: '_id',
            as: 'hashtag'
          }
        },
        {
          $addFields: {
            hashtag: {
              $map: {
                input: '$hashtag',
                as: 'hashtag_new',
                in: {
                  _id_new: '$$hashtag_new._id',
                  name_new: '$$hashtag_new.name'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            },
            total_views: {
              $add: ['$guest_views', '$user_views']
            }
          }
        },
        {
          $skip: limit * (page - 1) //? Cong thuc phan trang
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    //? Lay ra mảng id của tweetchildren
    const ids = tweets.map(tweet => tweet._id as ObjectId)
    const inc = user_id ? {user_views: 1} : {guest_views: 1}
    const date = new Date()
    //? Update view cho cac id trong mang nay
    databaseService.tweets.updateMany({
      _id: {
        $in: ids
      }},
      {
        $inc: inc,
        $set: {
          update_at: date
        }
      }
    )
    //! Vi method UpdateMany ko return ve obj nen ta se lam tiep buoc sau, luu y la buoc +1 nay chi tra ve kq cho user chu ko +1 vào view trong DB
    tweets.forEach(tweet => {
      tweet.update_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    
    //? Tinh tong so doc tra ve
    const total = await databaseService.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    })
    return {
      tweets,
      total
    }
  }

  ///
  ///
  //! Tạo method mơi ở dòng trên
}

const tweetsService = new TweetsService()
export default tweetsService
