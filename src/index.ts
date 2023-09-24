
import express from 'express';
import userRouter from './routes/users.routes';
import databaseService from './services/database.services';
// import { error } from 'node:console';
// import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { defaultErrorHandler } from './middlewares/error.middlewares';

const app = express()
const port = 3001; 
app.use(express.json()) //  middleware parse file json thanh Obj de Validation xu ly



app.use('/users', userRouter);

databaseService.connect();

// Middleware xử lý lỗi
app.use(defaultErrorHandler);

app.listen(port, () => {
    console.log(`Server Thuyet Le is running or port ${port}`)
})

 

 