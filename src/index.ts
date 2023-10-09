
import express from 'express';
import userRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import mediasRouter from './routes/medias.routes';
import { initFolder } from './utils/file';
import { config } from 'dotenv';
config()
import argv from 'minimist'
const options = argv(process.argv.slice(2))

const app = express()
const port = process.env.PORT; 
console.log(process.env.PORT);


// ? Tạo folder upload
initFolder()


app.use(express.json()) // ! middleware parse file json thanh Obj de Validation xu ly


app.use('/users', userRouter);
app.use('/medias', mediasRouter);

databaseService.connect();

// Middleware xử lý lỗi
app.use(defaultErrorHandler);

app.listen(port, () => {
    console.log(`Server Thuyet Le is running or port ${port}`)
})

 

 