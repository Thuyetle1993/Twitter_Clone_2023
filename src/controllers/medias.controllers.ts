import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'
import { IncomingMessage } from 'http'

export const uploadSingleImageController = async (req: Request & IncomingMessage, res: Response, next: NextFunction) => {
  const data = await handleUploadSingleImage(req as any)
  return res.json({
    result: data
  })
}
