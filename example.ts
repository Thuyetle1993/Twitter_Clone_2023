import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import fs from 'fs';

// Khởi tạo client S3 (giả sử đã được cấu hình)
const s3 = new S3Client({ /* cấu hình của bạn */ });

export const uploadFileToS3 = async ({
    filename,
    filepath,
    contentType
}: {
    filename: string
    filepath: string
    contentType: string
}): Promise<CompleteMultipartUploadCommandOutput> => {
    try {
        const parallelUploads3 = new Upload({
            client: s3,
            params: { 
                Bucket: 'twitter-thuyet-clone-ap-southeast-1',
                Key: filename,
                Body: fs.readFileSync(filepath),
                ContentType: contentType
            },
            // ... các tùy chọn khác
        });

        const result = await parallelUploads3.done();
        if ('CompleteMultipartUpload' in result) {
            return result as CompleteMultipartUploadCommandOutput;
        } else {
            throw new Error('Upload did not complete successfully.');
        }
    } catch (error) {
        // Xử lý lỗi tại đây hoặc ném ra ngoại lệ
        console.error(error);
        throw error; // hoặc bạn có thể trả về một giá trị lỗi tùy chỉnh
    }
};
