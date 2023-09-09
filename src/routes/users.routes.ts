
// import express from 'express'
// const userRouter = express.Router()

import {Router} from 'express'
const userRouter = Router();

userRouter.get('/tweets', (req, res) => {
    res.json({
        data: [
            {
                id : 1,
                name : 'thuyet Le',
                age: 30,
            }
        ]
    })
})
    
export default userRouter