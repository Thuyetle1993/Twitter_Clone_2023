import { RegisterReqBody } from '~/models/request/user.request'
import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import databaseService from '~/services/database.services';
import { hashPassword } from './crypto';
import User from '~/models/schemas/User.schema';
import tweetsService from '~/services/tweets.services';
import Follower from '~/models/schemas/Follower.schema';
import { isDataView } from 'util/types';

//Mật khẩu cho các faker user :
const PASSWORD = 'Thuyet123'
//ID cua tk dung der follow user khac
const MYID = new ObjectId('65408532187f5166b7c92331')
// Số lượng user được tạo, mỗi user sẽ mặc định có sẵn 2 tweet
const USER_COUNT = 100

//! Tao Rando User
const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

//! Tao Random Tweet
const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 20,
      max: 100
    }),
    hashtags: [],
    medias: [],
    mentions: [],
    parent_id: null
  }
  return tweet
}
//! Resgister hang loat user tren
const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
    count: USER_COUNT
})
//! Follow Multiple Users
const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
    console.log('Start Following')
    const result = await Promise.all(
        followed_user_ids.map((followed_user_id) => {
            databaseService.followers.insertOne(
                new Follower({
                    user_id,
                    followed_user_id : new ObjectId(followed_user_id)
                })
            )
        })
    )
    console.log(`Followed ${result.length} users`)
}
//! Insert Users vao DB
const inserMultipleUser = async (users: RegisterReqBody[]) => {
    console.log('Creating users...')
    const result = await Promise.all(
        users.map(async (user) => {
            const user_id = new ObjectId()
            await databaseService.users.insertOne(
                new User({
                    ...user,
                    username: `user${user_id.toString()}`,
                    password: hashPassword(user.password),
                    date_of_birth: new Date(user.date_of_birth),
                    verify: UserVerifyStatus.Verified
                })
            )
            return user_id
        })
    )
    console.log(`Created ${result.length} users`)
    return result
} 
//! Tao tweet Random cho moi User
const inserMultipleTweets = async (ids: ObjectId[]) => {
    console.log('Creating tweets...')
    console.log('Counting...')
    let count = 0
    const result = await Promise.all(
        ids.map( async (id, index) => {
            await Promise.all([
                tweetsService.createTweet(id.toString(), createRandomTweet()),
                tweetsService.createTweet(id.toString(), createRandomTweet())
            ])
            count += 2
            console.log(`Created ${count} tweets`)
        })
    )
    return result
}

//? Đăng ký hàng loạt user trước
inserMultipleUser(users).then((userIds) => {
    // userIds tại đây sẽ là một mảng các ObjectId
    inserMultipleTweets(userIds).then(() => {
      // Sau khi tạo tweet xong thì follow các user
      followMultipleUsers(new ObjectId(MYID), userIds);
    });
  });
  