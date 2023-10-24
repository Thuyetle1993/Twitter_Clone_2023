import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { getNameFromFullname, handleUploadImage, handleUploadVideo, handleUploadVideoHLS } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enum'
import { Media } from '~/models/others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { Mutex } from 'async-mutex'
const mutex = new Mutex();

//! Tao class xu ly hang doi video
interface QueueItem {
  path: string;
  id: string;
}
class Queue {
  items: QueueItem[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue({ item, idName }: { item: string, idName: string }) {
    this.items.push({ path: item, id: idName });
    
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    const release = await mutex.acquire(); //!  để đảm bảo rằng chỉ có một instance của hàm này có thể chạy tại một thời điểm.    
    try {
      if (this.encoding) return
      if (this.items.length > 0) {
      this.encoding = true;
      const currentItem = this.items[0];
      const videoPath = currentItem.path;
      const idName = currentItem.id;  
      
      await databaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift() //? Xoa di item dau tien torng mang hang cho
        await fsPromise.unlink(videoPath) //? Xoa di video da up
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus.updateOne(
            {
              name: idName
            },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          ).catch((error) => {
            console.error('Update video status error', error)
          })
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false //? Da encode xong 1 video
      //! Thuc hien de quy goi lai ham nay
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
    } catch (error) {
      console.error(error);
    } finally {
      release();
    }
  }
}
const queue = new Queue()
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
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
  //! Upload Video HLS
  async UploadVideoHLS(req: Request) {
    const { idName, files } = await handleUploadVideoHLS(req as any)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = idName
        queue.enqueue({ item: file.filepath, idName: newName })
        console.log('newName :', newName)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({name: id})
    return data
  }
  //TODO THÊM METHOD MƠI Ở DÒNG TRÊN
}

const mediasService = new MediasService()
export default mediasService
