import { Router, Request, Response } from 'express';
import { uploadMealPhoto, uploadReceipt, uploadProfilePhoto, uploadEventPhoto } from '../middleware/multer';
import { processImage, createProfilePicture, optimizeReceipt } from '../utils/imageProcessing';

const router = Router();

// Upload meal photo
router.post('/meal-photo', (req: Request, res: Response) => {
    uploadMealPhoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Process the image
            const processed = await processImage(req.file.path, {
                maxWidth: 1600,
                maxHeight: 1200,
                quality: 85,
                generateThumbnail: true,
                thumbnailSize: 400
            });

            res.json({
                success: true,
                files: {
                    original: `/uploads/meals/${req.file.filename}`,
                    optimized: `/${processed.optimized.replace(/\\/g, '/')}`,
                    thumbnail: processed.thumbnail ? `/${processed.thumbnail.replace(/\\/g, '/')}` : null
                }
            });
        } catch (error) {
            console.error('Error processing meal photo:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    });
});

// Upload receipt photo
router.post('/receipt', (req: Request, res: Response) => {
    uploadReceipt(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Optimize for text readability
            const optimizedPath = await optimizeReceipt(req.file.path);

            res.json({
                success: true,
                files: {
                    original: `/uploads/receipts/${req.file.filename}`,
                    optimized: `/${optimizedPath.replace(/\\/g, '/')}`
                }
            });
        } catch (error) {
            console.error('Error processing receipt:', error);
            res.status(500).json({ error: 'Failed to process receipt' });
        }
    });
});

// Upload profile photo
router.post('/profile-photo', (req: Request, res: Response) => {
    uploadProfilePhoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Create profile picture versions
            const processed = await createProfilePicture(req.file.path);

            res.json({
                success: true,
                files: {
                    original: `/uploads/profiles/${req.file.filename}`,
                    large: `/${processed.original.replace(/\\/g, '/')}`,
                    medium: `/${processed.optimized.replace(/\\/g, '/')}`,
                    thumbnail: processed.thumbnail ? `/${processed.thumbnail.replace(/\\/g, '/')}` : null
                }
            });
        } catch (error) {
            console.error('Error processing profile photo:', error);
            res.status(500).json({ error: 'Failed to process profile photo' });
        }
    });
});

// Upload event photo
router.post('/event-photo', (req: Request, res: Response) => {
    uploadEventPhoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Process the image
            const processed = await processImage(req.file.path, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 90,
                generateThumbnail: true,
                thumbnailSize: 400
            });

            res.json({
                success: true,
                files: {
                    original: `/uploads/events/${req.file.filename}`,
                    optimized: `/${processed.optimized.replace(/\\/g, '/')}`,
                    thumbnail: processed.thumbnail ? `/${processed.thumbnail.replace(/\\/g, '/')}` : null
                }
            });
        } catch (error) {
            console.error('Error processing event photo:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    });
});

export default router;

