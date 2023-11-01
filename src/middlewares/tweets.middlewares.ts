import { Request, Response,NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messsage'
import { ErrorWithStatus } from '~/models/errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediasTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          //? Nếu 'type' là retweet, comment, quote thì 'parent_id' phải là 'tweet_id' cuar tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          //? Nêu type là tweet thì parent_id phải là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          //? Nếu 'type' là comment,quote, tweet va ko co mention hay hashtag thi content phai la string va ko dc rong:
          if (
            [TweetType.Comment, TweetType.Tweet, TweetType.QuoteTweet].includes(type) &&
            isEmpty(mentions) &&
            isEmpty(hashtags) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          //? Nêu type là retweet thì content phai la `''`
          if (type === TweetType.Retweet && value !== "") {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //? Yeu cau moi phan tu trong Arr phai la string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAG_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //? Yeu cau moi phan tu trong Arr phai la user_id
          if (
            value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTION_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },    
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //? Yeu cau moi phan tu trong Arr phai la Media Object
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediasTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

//? TweetID Validator
export const tweetIdValidator = validate(checkSchema({
  tweet_id: {
    custom: {
      options: async (value, {req}) => {
        if (!ObjectId.isValid(value)) {
          throw new ErrorWithStatus( {
            status: HTTP_STATUS.BAD_REQUEST,
            message: TWEETS_MESSAGES.INVALID_TWEET_ID
          })
        }
        const [tweet] = await databaseService.tweets.aggregate<Tweet>(
          [
            {
              '$match': {
                '_id': new ObjectId('653e47328c72e666af99affa')
              }
            }, {
              '$lookup': {
                'from': 'hashtags', 
                'localField': 'hashtag', 
                'foreignField': '_id', 
                'as': 'hashtag'
              }
            }, {
              '$addFields': {
                'hashtag': {
                  '$map': {
                    'input': '$hashtag', 
                    'as': 'hashtag_new', 
                    'in': {
                      '_id_new': '$$hashtag_new._id', 
                      'name_new': '$$hashtag_new.name'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'tweets', 
                'localField': '_id', 
                'foreignField': 'parent_id', 
                'as': 'tweet_children'
              }
            }, {
              '$addFields': {
                'retweet_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', 1
                        ]
                      }
                    }
                  }
                }, 
                'comment_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', 2
                        ]
                      }
                    }
                  }
                }, 
                'quote_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', 3
                        ]
                      }
                    }
                  }
                }, 
                'total_views': {
                  '$add': [
                    '$guest_views', '$user_views'
                  ]
                }
              }
            }
          ]
        ).toArray()
        if (!tweet) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.NOT_FOUND,
            message: TWEETS_MESSAGES.TWEET_NOT_FOUND
          })
        }
        //! Lấy ra tweet để sử dụng
        (req as Request).tweet = tweet
        return true
      } 
    }
  }
}, ['params', 'body']))

//? Audience Validator

export const audienceValidator = wrapRequestHandler( async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    //! Kiem tra nguoi xem tw da dang nhap hay chua
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }
    //! Kiem tra tai khoan author co bi xoa hay khoa ko 
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //? Kiem tra ng xem tw co trong Circle cua author hay ko
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))

    //! Neu ban ko phai la author va ko nam trong Tw Circle thi bao loi
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }  
  next()
})
  