import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { MediaType, MediaTypeQuery, PeopleFollowing, TweetType } from '~/constants/enum'

class SearchService {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_following
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeQuery
    people_following?: PeopleFollowing
  }) {
    //? Khai bao dieu kien filter query
    const $match: any = {
      $text: {
        $search: content
      }
    }
    //! Kiem tra co search media ko
    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      } else if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }
    //! Kiem tra co seach tu user following ko
    if (people_following && people_following === PeopleFollowing.Following) {
      //? Lay ra mang user_id follow :
      const user_id_obj = new ObjectId(user_id)
      //? Lay ra mang followed id
      const followed_user_ids = await databaseService.followers
        .find(
          {
            user_id: user_id_obj
          },
          {
            projection: {
              followed_user_id: 1,
              _id: 0
            }
          }
        )
        .toArray()
      const ids = followed_user_ids.map((item) => item.followed_user_id)
      //? Lay newfeeds se lay luon ca tweet cua minh
      ids.push(user_id_obj)
      //? Them mang tren vào bien $match
      $match['user_ids'] = {
        $in: ids
      }
    }

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user_info.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
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
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user_info: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          },
          {
            $unwind: {
              path: '$user_info'
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: {
              path: '$user_info'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user_info.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          //? Them stage dem so document
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    // console.log('tweets:', tweets)
    // console.log('total:', total)
    return {
      tweets,
      total: total[0]?.total || 0
    }
  }

  //?
  //?
  //! Them metho o dong tren
}

const searchService = new SearchService()
export default searchService
