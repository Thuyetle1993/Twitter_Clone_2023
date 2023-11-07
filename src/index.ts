import express from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
config()
import argv from 'minimist'
import staticRouter from './routes/static.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likeRouter from './routes/like.routes'
import seachRouter from './routes/search.routes'
const options = argv(process.argv.slice(2))
//! Tool tao user, tweet va follow tu dong, sau khi chay vai lan thì comment lại
// import '~/utils/fake'

const app = express()
const port = process.env.PORT

//! Kiêmr tra đường dẫn :
if (process.env.PATH) {
  console.log(process.env.PATH.split(';').includes('C:\\Ffmpeg\\bin'))
} else {
  console.log('PATH environment variable is not defined.')
}

// ? Tạo folder upload
initFolder()

app.use(express.json()) // ! middleware parse file json thanh Obj de Validation xu ly

app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/like-tweet', likeRouter )
app.use('/search', seachRouter )

app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(cors())

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshToken()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

// Middleware xử lý lỗi
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server Thuyet Le is running or port ${port}`)
})

//! Tạo DB mới để test

// const mgclient = new MongoClient(
//   `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweeter-thuyet.jwhse00.mongodb.net/?retryWrites=true&w=majority`
// )

