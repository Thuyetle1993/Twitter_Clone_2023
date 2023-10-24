
import express from 'express';
import userRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import mediasRouter from './routes/medias.routes';
import { initFolder } from './utils/file';
import { config } from 'dotenv';
config()
import argv from 'minimist'
import staticRouter from './routes/static.routes';
import { UPLOAD_VIDEO_DIR } from './constants/dir';
import cors from 'cors'
const options = argv(process.argv.slice(2))

const app = express()
const port = process.env.PORT; 

//! Kiêmr tra đường dẫn :
if (process.env.PATH) {
    console.log(process.env.PATH.split(';').includes('C:\\Ffmpeg\\bin'));
  } else {
    console.log("PATH environment variable is not defined.");
  }



// ? Tạo folder upload
initFolder()


app.use(express.json()) // ! middleware parse file json thanh Obj de Validation xu ly


app.use('/users', userRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRouter);
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(cors())


databaseService.connect();

// Middleware xử lý lỗi
app.use(defaultErrorHandler);

app.listen(port, () => {
    console.log(`Server Thuyet Le is running or port ${port}`)
})

 

 