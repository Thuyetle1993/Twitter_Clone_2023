import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/others'

class MediasService {
  //! Upload Image
  async UploadImage(req: Request) {
    const files = await handleUploadImage(req as any)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        // ! Tao duong dan toi file anh
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)

        // ! Tra ve duong dan URL toi image
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  //! Upload Video 
  async UploadVideo(req: Request) {
    const files = await handleUploadVideo(req as any)
    const { newFilename } = files[0]
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
          type: MediaType.Video
        }
      }    

    //TODO THÊM METHOD MƠI Ở DÒNG TRÊN
  }

const mediasService = new MediasService()
export default mediasService
