import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import pool from '../database/db';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// In-memory typing status (in production, use Redis or similar)
const typingStatus: { [key: string]: { userId: string; timestamp: number } } = {};

// Get messages
router.get(
    '/',
    [
        query('user_id').optional().trim(),
        query('conversation_with').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        try {
            const { user_id, conversation_with } = req.query;

            let queryStr = 'SELECT * FROM messages WHERE deleted = FALSE';
            const params: any[] = [];

            if (user_id && conversation_with) {
                // Get conversation between two users
                params.push(user_id, conversation_with, user_id, conversation_with);
                queryStr += ` AND (
          (sender_id = $1 AND recipient_id = $2) OR 
          (sender_id = $3 AND recipient_id = $4)
        )`;
            } else if (user_id) {
                // Get all messages for user
                params.push(user_id, user_id);
                queryStr += ` AND (sender_id = $1 OR recipient_id = $2)`;
            }

            queryStr += ' ORDER BY created_at ASC';

            const result = await pool.query(queryStr, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }
);

// Get single message
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM messages WHERE id = $1 AND deleted = FALSE',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});

// Create message
router.post(
    '/',
    [
        body('sender_id').trim().notEmpty().withMessage('Sender ID is required'),
        body('recipient_id').trim().notEmpty().withMessage('Recipient ID is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('attachment_url').optional().trim(),
        body('attachment_type').optional().trim(),
        body('attachment_name').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                sender_id,
                recipient_id,
                content,
                attachment_url,
                attachment_type,
                attachment_name
            } = req.body;

            const result = await pool.query(
                `INSERT INTO messages 
        (sender_id, recipient_id, content, attachment_url, attachment_type, attachment_name) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    sender_id,
                    recipient_id,
                    content,
                    attachment_url || null,
                    attachment_type || null,
                    attachment_name || null
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({ error: 'Failed to create message' });
        }
    }
);

// Mark message as read
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE messages SET read = TRUE, read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// Edit message
router.put(
    '/:id',
    [
        body('content').trim().notEmpty().withMessage('Content is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { content } = req.body;

            const result = await pool.query(
                `UPDATE messages 
        SET content = $1, edited = TRUE, edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND deleted = FALSE 
        RETURNING *`,
                [content, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error editing message:', error);
            res.status(500).json({ error: 'Failed to edit message' });
        }
    }
);

// Delete message (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE messages SET deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Upload attachment
router.post('/upload', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype;
        const fileName = req.file.originalname;

        res.status(201).json({
            url: fileUrl,
            type: fileType,
            name: fileName,
            size: req.file.size
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get typing status
router.get('/typing/:conversationId', async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const status = typingStatus[conversationId];

        // Remove stale status (older than 5 seconds)
        if (status && Date.now() - status.timestamp > 5000) {
            delete typingStatus[conversationId];
            return res.json({ isTyping: false });
        }

        res.json({ isTyping: !!status, userId: status?.userId });
    } catch (error) {
        console.error('Error fetching typing status:', error);
        res.status(500).json({ error: 'Failed to fetch typing status' });
    }
});

// Update typing status
router.post(
    '/typing',
    [
        body('conversation_id').trim().notEmpty().withMessage('Conversation ID is required'),
        body('user_id').trim().notEmpty().withMessage('User ID is required'),
        body('is_typing').isBoolean().withMessage('is_typing must be a boolean'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { conversation_id, user_id, is_typing } = req.body;

            if (is_typing) {
                typingStatus[conversation_id] = {
                    userId: user_id,
                    timestamp: Date.now()
                };
            } else {
                delete typingStatus[conversation_id];
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating typing status:', error);
            res.status(500).json({ error: 'Failed to update typing status' });
        }
    }
);

export default router;

