import { ObjectId } from 'mongodb'
import { Media } from '../others'
import { TweetAudience, TweetType } from '~/constants/enum'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId // Chi null khi la tw goc
  hashtag: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  create_at?: Date
  update_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId  // Chi null khi la tw goc
  hashtag: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  create_at: Date
  update_at: Date
  constructor({
    _id,
    audience,
    content,
    parent_id,
    guest_views,
    hashtag,
    medias,
    mentions,
    type,
    user_id,
    user_views,
    create_at,
    update_at
  }: TweetConstructor) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id
    this.hashtag = hashtag
    this.mentions = mentions.map((item) => new ObjectId(item))
    this.medias = medias
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.create_at = create_at || date
    this.update_at = update_at || date
  }
}
