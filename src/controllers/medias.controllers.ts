import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import mediasService from '~/services/medias.services'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { error } from 'console'
import USERS_MESSAGES from '~/constants/messsage'
import HTTP_STATUS from '~/constants/httpStatus'
import fs from 'fs'
import mime from 'mime'

//! Upload Image Controller

export const uploadImageController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const url = await mediasService.UploadImage(req as any)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

//! Upload Video Controller
export const uploadVideoController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const url = await mediasService.UploadVideo(req as any)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}
//! Upload Video HLS Controller
export const uploadVideoHLSController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const url = await mediasService.UploadVideoHLS(req as any)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

//! Check Video Status Controller
export const videoStatusController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await mediasService.getVideoStatus(id as string)
  return res.json({
    message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
    result: result
  })
}

//! Serve Image Controller

export const serverImageController = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}

//! Serve Video HLS Stream Controller

export const serveM3u8Controller = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}
export const serveSegmentController = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  //? segment : 0.ts, 1.ts, 2.ts...
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}

//! Serve Video Stream Controller

export const serverVideoStreamController = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
    const { name } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)   

    //? 1MB = 10^6 bytes ( tinsh theo hệ 10, đay là thứ chúng ta hay thấy trên UI)
    //? Còn nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes ( 1024 * 1024)

    const videoSize = fs.statSync(videoPath).size

    //! Dung lượng video cho mỗi phân đoạn stream

    const chunkSize = 10 ** 6 // 1MB

    //! Lấy giá trị byte bắt đầu từ header Range ( vd: bytes=1048576-)

    const start = Number(range?.replace(/\D/g, ''))

    //! Lay gia tri byte ket thuc, vuot qua dung luong video thi lay gia tri cuoi cung

    const end = Math.min(start + chunkSize, videoSize - 1)

    //? Dung luong thuc te cho moi doan video stream
    //? Thuong day se la chunkSize, ngoai tru doan cuoi cung

    const contentLength = end - start + 1
    const contentType = mime.getType(videoPath) || 'video/*' //! ko lay dc thi ko bit dinh dang

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }
    res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers) //! Status dai dien cho content bi chia cat ra lam nhieu doan

    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.pipe(res)
  }
}
