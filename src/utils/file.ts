import fs, { readlink } from 'fs'
import { IncomingMessage } from 'http'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
import exp from 'constants'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true //! mục đích để tạo folder nested
    })
  }
}

// TODO Hàm xử lý upload ảnh :
export const handleUploadSingleImage = async (req: Request & IncomingMessage) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3000 * 1024,
    filter: function ({name, originalFilename, mimetype}) {
        //? Neu valid có name là image và mimetype là kiểu ảnh ( luôn trả về là true hoặc false)
        const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
        if (!valid) {
            form.emit('error' as any, new Error('File type is not valid') as any)            
        }
        return valid
    }

  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
}

// TODO Hàm xử lý lấy tên ảnh, bỏ đuôi :
export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}