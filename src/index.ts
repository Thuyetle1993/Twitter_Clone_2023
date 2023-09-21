
import express from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database.services';

const app = express()
const port = 3001; 
app.use(express.json()) //  middleware parse file json thanh Obj de Validation xu ly


app.get('/', (req, res) => {
  res.send('hello world Thuyet le')
})

app.use('/users', userRouter);

databaseService.connect();

app.listen(port, () => {
    console.log(`Server Thuyet Le is running or port ${port}`)
})



 