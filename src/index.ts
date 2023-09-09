
import express from 'express'
import userRouter from './routes/users.routes'

const app = express()
const port = 3001; 


app.get('/', (req, res) => {
  res.send('hello world Thuyet le')
})

app.listen(port, () => {
    console.log(`Server Thuyet Le is running or port ${port}`)
})
app.use('/users', userRouter)



