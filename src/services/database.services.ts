import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/bookmark.schema'
import LikeTweets from '~/models/schemas/Like.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweeter-thuyet.jwhse00.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('error', error)
      throw error
    }
  }
  //! Tạo Indexes trong DB Users
  async indexUsers() {
    const exists = await this.users.indexExists(['email_1', 'email_1_password_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshToken() {
    const exists = await this.users.indexExists(['exp_1', 'token_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }
  async indexVideoStatus() {
    const exists = await this.users.indexExists(['name_1'])
    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }
  async indexFollowers() {
    const exists = await this.users.indexExists(['user_id_1_follower_user_id_1'])
    if (!exists) {
    this.followers.createIndex({ user_id: 1, follower_user_id: 1 })
    }
  }
  async indexTweets() {
    const exists = await this.users.indexExists(['content_text'])
    if (!exists) {
    this.tweets.createIndex({ content: 'text'}, { default_language: 'none'})
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  // Lay ra Refresh Token
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }

  // Follow Collection
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARS_COLLECTION as string)
  }
  get likeTweets(): Collection<LikeTweets> {
    return this.db.collection(process.env.DB_LIKE_TWEETS_COLLECTION as string)
  }

  
  //! Them method tren dong  nay
}
// Tạo Object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
