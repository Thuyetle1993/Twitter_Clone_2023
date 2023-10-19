import fs, { readlink } from 'fs'
import { IncomingMessage } from 'http'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

//! Fn tạo folder :

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //! mục đích để tạo folder nested
      })
    }
  })
}

// TODO Hàm xử lý upload ảnh :
export const handleUploadImage = async (req: Request & IncomingMessage) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      //? Neu valid có name là image và mimetype là kiểu ảnh ( luôn trả về là true hoặc false)
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}
// TODO Hàm xử lý upload video:
export const handleUploadVideo = async (req: Request & IncomingMessage) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50mb
    maxTotalFileSize: 50 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      return true
      //? Neu valid có name là image và mimetype là kiểu ảnh ( luôn trả về là true hoặc false)
      // const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // if (!valid) {
      //   form.emit('error' as any, new Error('File type is not valid') as any)
      // }
      // return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      // //! Ghép tên file vào đuôi ext
      const videos = files.video as File[]
      // videos.forEach((video) => {
      //   const ext = getExtension(video.originalFilename as string)
      //   fs.renameSync(video.filepath, video.filepath + '.' + ext)
      //   video.newFilename = video.newFilename + '.'  + ext
      // })
      resolve(files.video as File[])
    })
  })
}

// TODO Hàm xử lý lấy tên ảnh, bỏ đuôi :
export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}

// TODO Fn lấy đuôi ext file :
export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
