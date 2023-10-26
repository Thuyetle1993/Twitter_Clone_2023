import { ObjectId } from "mongodb";


interface RefreshTokenType {
    _id?: ObjectId
    token: string
    create_at?: Date
    user_id: ObjectId
    iat: number
    exp: number
}

export default class refreshTokens {
    _id?: ObjectId
    token: string
    create_at: Date
    user_id: ObjectId
    iat: Date
    exp: Date

    constructor({_id, token, create_at, user_id, iat, exp}: RefreshTokenType) {
        this._id = _id
        this.token = token
        this.create_at = create_at || new Date() 
        this. user_id = user_id
        this.iat = new Date(iat * 1000) //! Convert epoch time to Date
        this.exp = new Date(iat * 1000)
    }
}