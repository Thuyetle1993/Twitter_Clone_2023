import { Request } from "express";    
import path from "path";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/dir";
import { Express } from "express";
import fs from 'fs';
import { getNameFromFullname, handleUploadSingleImage } from "~/utils/file";
import { isProduction } from "~/constants/config";

class MediasService {
    async handleUploadSingleImage(req: Request) {
        const file = await handleUploadSingleImage(req as any)
        const newName = getNameFromFullname(file.newFilename)
        // ! Tao duong dan toi file anh
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)

        // ! Tra ve duong dan URL toi image        
        return isProduction ? `${process.env.HOST}/medias/${newName}.jpg` : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`
    }
}

const mediasService = new MediasService();
export default mediasService; 