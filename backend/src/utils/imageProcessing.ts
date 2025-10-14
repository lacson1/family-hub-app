import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface ImageProcessingOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    generateThumbnail?: boolean;
    thumbnailSize?: number;
}

interface ProcessedImages {
    original: string;
    optimized: string;
    thumbnail?: string;
}

export const processImage = async (
    inputPath: string,
    options: ImageProcessingOptions = {}
): Promise<ProcessedImages> => {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 85,
        format = 'jpeg',
        generateThumbnail = true,
        thumbnailSize = 400
    } = options;

    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    try {
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();

        // Resize and optimize main image
        const optimizedPath = path.join(dirname, `${basename}-optimized.${format}`);
        await sharp(inputPath)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality, mozjpeg: true })
            .toFile(optimizedPath);

        const result: ProcessedImages = {
            original: inputPath,
            optimized: optimizedPath
        };

        // Generate thumbnail if requested
        if (generateThumbnail) {
            const thumbnailPath = path.join(dirname, `${basename}-thumb.${format}`);
            await sharp(inputPath)
                .resize(thumbnailSize, thumbnailSize, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(thumbnailPath);

            result.thumbnail = thumbnailPath;
        }

        return result;
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
};

export const createProfilePicture = async (inputPath: string): Promise<ProcessedImages> => {
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    try {
        // Square crop for profile pictures
        const size = 400;
        const largeSize = 800;

        // Large version (800x800)
        const largePath = path.join(dirname, `${basename}-large.jpeg`);
        await sharp(inputPath)
            .resize(largeSize, largeSize, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(largePath);

        // Medium version (400x400)
        const mediumPath = path.join(dirname, `${basename}-medium.jpeg`);
        await sharp(inputPath)
            .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toFile(mediumPath);

        // Thumbnail (150x150)
        const thumbnailPath = path.join(dirname, `${basename}-thumb.jpeg`);
        await sharp(inputPath)
            .resize(150, 150, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(thumbnailPath);

        return {
            original: inputPath,
            optimized: mediumPath,
            thumbnail: thumbnailPath
        };
    } catch (error) {
        console.error('Error creating profile picture:', error);
        throw new Error('Failed to create profile picture');
    }
};

export const optimizeReceipt = async (inputPath: string): Promise<string> => {
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    try {
        // Optimize for text readability (higher contrast, sharpen)
        const optimizedPath = path.join(dirname, `${basename}-optimized.jpeg`);
        await sharp(inputPath)
            .resize(1200, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .sharpen()
            .normalize()
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(optimizedPath);

        return optimizedPath;
    } catch (error) {
        console.error('Error optimizing receipt:', error);
        throw new Error('Failed to optimize receipt');
    }
};

export const deleteImageFiles = async (filePaths: string[]): Promise<void> => {
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error);
        }
    }
};

