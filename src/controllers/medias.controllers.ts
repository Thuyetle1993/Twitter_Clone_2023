import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import mediasService from '~/services/medias.services'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { error } from 'console'
import USERS_MESSAGES from '~/constants/messsage'

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

//! Serve Image Controller

export const serverImageController = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}

//! Serve Video Controller

export const serverVideoController = (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}
