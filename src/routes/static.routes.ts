import { Router } from "express";
import { serveM3u8Controller, serveSegmentController, serverImageController, serverVideoStreamController } from "~/controllers/medias.controllers";


const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video-stream/:name', serverVideoStreamController)
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller)
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)



export default staticRouter