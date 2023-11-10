import {S3} from '@aws-sdk/client-s3'
import { Upload } from "@aws-sdk/lib-storage";
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import fs from 'fs'
const s3 = new S3({
    region: process.env.AWS_REGION, credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  } 
});
//! Sau khi kết nối thành công thi tắt đi
// s3.listBuckets({}).then((data) => console.log(data))

// ///? Func Upload file to S3 directly 
// export const uploadFileToS3 = ({
//     filename,
//     filepath,
//     contentType
// }: {
//     filename: string
//     filepath: string
//     contentType: string
// }) => {
//     const parallelUploads3 = new Upload({
//         client: s3,
//         params: { Bucket: 'twitter-thuyet-clone-ap-southeast-1', Key: filename, Body: fs.readFileSync(filepath) , ContentType: contentType },
    
//         tags: [
//         /*...*/
//         ], // optional tags
//         queueSize: 4, // optional concurrency configuration
//         partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
//         leavePartsOnError: false, // optional manually handle dropped parts
//     })
//     console.log('Upload S3 done')
//     return parallelUploads3.done()
// }

// Khai báo hàm uploadFileToS3 là async để sử dụng await bên trong nó
export const uploadFileToS3 = async ({
    filename,
    filepath,
    contentType
  }: {
    filename: string
    filepath: string
    contentType: string
  }): Promise<CompleteMultipartUploadCommandOutput> => {
    // Tạo một instance của Upload
    const parallelUploads3 = new Upload({
      client: s3, // Đảm bảo rằng 's3' đã được khởi tạo và cấu hình đúng
      params: {
        Bucket: 'twitter-thuyet-clone-ap-southeast-1',
        Key: filename,
        Body: fs.createReadStream(filepath), // Sử dụng stream thay vì readFileSync để xử lý hiệu quả hơn
        ContentType: contentType
      },
      tags: [
        //... optional tags
      ],
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 10, // optional size of each part, in bytes, at least 10MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });
  
    try {
      // Chờ cho đến khi upload hoàn thành
      const uploadResult = await parallelUploads3.done();
      console.log('Upload S3 done');
      return uploadResult; // Trả về kết quả upload
    } catch (error) {
      // Xử lý lỗi ở đây
      console.error('Upload to S3 failed:', error);
      throw error; // Ném lỗi ra ngoài để có thể xử lý ở cấp cao hơn
    }
  };
