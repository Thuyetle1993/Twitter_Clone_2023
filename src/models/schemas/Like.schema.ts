import { ObjectId } from "mongodb";


interface LikeType {
    _id?: ObjectId
    user_id: ObjectId
    tweet_id: ObjectId
    create_at?: Date
}

export default class LikeTweets {
    _id?: ObjectId
    user_id: ObjectId
    tweet_id: ObjectId
    create_at?: Date
    
    constructor({_id, user_id, tweet_id, create_at}: LikeType) {
        this._id = _id
        this.user_id = user_id
        this.tweet_id = tweet_id
        this.create_at = create_at || new Date()
    }
}