import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'
import { IncomingMessage } from 'http'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req as any)
  return res.json({
    result: result
  })
}
