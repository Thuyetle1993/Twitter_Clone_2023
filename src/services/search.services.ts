import { ObjectId } from "mongodb";
import databaseService from "./database.services";
import { TweetType } from "~/constants/enum";



class SearchService {
    async search({limit, page, content, user_id}: {limit: number, page: number, content: string, user_id: string}) {
        const [tweets, total] = await Promise.all([
            databaseService.tweets.aggregate(
            [
                {
                  '$match': {
                    '$text': {
                      '$search': content
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'user_id', 
                    'foreignField': '_id', 
                    'as': 'user_info'
                  }
                }, {
                  '$match': {
                    '$or': [
                      {
                        'audience': 0
                      }, {
                        '$and': [
                          {
                            'audience': 1
                          }, {
                            'user_info.twitter_circle': {
                              '$in': [new ObjectId(user_id)]
                            }
                          }
                        ]
                      }
                    ]
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
                              '$$item.type', TweetType.Retweet
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
                              '$$item.type', TweetType.Comment
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
                              '$$item.type', TweetType.QuoteTweet
                            ]
                          }
                        }
                      }
                    }
                  }
                }, {
                  '$project': {
                    'tweet_children': 0, 
                    'user_info': {
                      'password': 0, 
                      'email_verify_token': 0, 
                      'forgot_password_token': 0, 
                      'twitter_circle': 0, 
                      'date_of_birth': 0
                    }
                  }
                }, {
                  '$unwind': {
                    'path': '$user_info'
                  }
                }, {
                    $skip: limit * (page - 1)
                },
                {
                    $limit: limit
                }
              ]
        ).toArray(),
        databaseService.tweets.aggregate(
            [
                {
                  '$match': {
                    '$text': {
                      '$search': content
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'user_id', 
                    'foreignField': '_id', 
                    'as': 'user_info'
                  }
                },
                {
                    '$unwind': {
                      'path': '$user_info'
                    }
                },                   
                {
                  '$match': {
                    '$or': [
                      {
                        'audience': 0
                      }, {
                        '$and': [
                          {
                            'audience': 1
                          }, {
                            'user_info.twitter_circle': {
                              '$in': [new ObjectId(user_id)]
                            }
                          }
                        ]
                      }
                    ]
                  }
                },          
                //? Them stage dem so document
                {
                 $count: "total"
                }
              ]
        ).toArray(),
    ]) 
    console.log('tweets:', tweets) 
    console.log('total:', total) 
    return {
        tweets,
        total: total[0].total
    }
    }

    //?
    //?
    //! Them metho o dong tren
}

const searchService = new SearchService()
export default searchService