import {S3} from '@aws-sdk/client-s3'
import { config } from 'dotenv';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
config();
import fs from 'fs'
import path from 'path';
const s3 = new S3({
    region: process.env.AWS_REGION, credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
});
//! Sau khi kết nối thành công thi tắt đi
// s3.listBuckets({}).then((data) => console.log(data))
//! Upload file len s3

const file  = fs.readFileSync(path.resolve('uploads/images/photo_1_2023-10-30_09-03-34.jpg'))
const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: 'twitter-thuyet-clone-ap-southeast-1', Key: 'A3matcha.jpg', Body: file, ContentType: 'image/jpeg' },

    tags: [
    /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
});

parallelUploads3.on("httpUploadProgress", (progress) => {
    console.log(progress);
});
  
parallelUploads3.done().then(res => {
    console.log(res)
})