"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const imageProcessor_1 = require("../utils/imageProcessor");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Apply authentication to all content routes
router.use(auth_1.authenticateToken);
router.use(auth_1.requireStaff);
// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const imagesDir = path_1.default.join(uploadDir, 'images');
const videosDir = path_1.default.join(uploadDir, 'videos');
const thumbnailsDir = path_1.default.join(uploadDir, 'thumbnails');
// Create directories with error handling
const createDirectories = () => {
    try {
        [uploadDir, imagesDir, videosDir, thumbnailsDir].forEach(dir => {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
                console.log(`✅ Created directory: ${dir}`);
            }
            else {
                console.log(`✅ Directory exists: ${dir}`);
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating directories:', error);
    }
};
// Create directories on startup
createDirectories();
// Multer configuration for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        try {
            // Ensure directories exist before saving
            createDirectories();
            if (file.mimetype.startsWith('image/')) {
                cb(null, imagesDir);
            }
            else if (file.mimetype.startsWith('video/')) {
                cb(null, videosDir);
            }
            else {
                cb(new Error('Invalid file type'), '');
            }
        }
        catch (error) {
            console.error('❌ Multer destination error:', error);
            cb(error, '');
        }
    },
    filename: (req, file, cb) => {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
        }
        catch (error) {
            console.error('❌ Multer filename error:', error);
            cb(error, '');
        }
    }
});
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp,gif').split(',');
    const allowedVideoTypes = (process.env.ALLOWED_VIDEO_TYPES || 'mp4,mov,avi,mkv').split(',');
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase().substring(1);
    if (file.mimetype.startsWith('image/') && allowedImageTypes.includes(fileExtension)) {
        cb(null, true);
    }
    else if (file.mimetype.startsWith('video/') && allowedVideoTypes.includes(fileExtension)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type'), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '50000000') // 50MB default
    }
});
// ============================================
// IMAGE MANAGEMENT
// ============================================
// Get images with filtering
router.get('/images', async (req, res) => {
    try {
        const { category, businessCategory, status, uploaderType } = req.query;
        const where = {};
        if (category)
            where.category = category;
        if (businessCategory)
            where.businessCategoryId = businessCategory;
        if (status)
            where.approvalStatus = status;
        if (uploaderType)
            where.uploaderType = uploaderType;
        const images = await prisma.image.findMany({
            where,
            include: {
                businessCategory: {
                    select: { name: true, icon: true }
                },
                admin: {
                    select: { name: true, email: true }
                },
                subadmin: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            images
        });
    }
    catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch images'
        });
    }
});
// Upload image
router.post('/images/upload', upload.single('image'), [
    (0, express_validator_1.body)('title').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('category').isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
], async (req, res) => {
    try {
        console.log('📤 Image upload request received');
        console.log('📁 File info:', req.file ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        } : 'No file');
        console.log('📝 Body data:', req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        if (!req.file) {
            console.log('❌ No file provided');
            return res.status(400).json({
                success: false,
                error: 'Image file is required'
            });
        }
        const { title, description, category, businessCategoryId, tags } = req.body;
        // Initialize image data with basic information
        const imageData = {
            title,
            description,
            url: `/uploads/images/${req.file.filename}`,
            thumbnailUrl: null,
            category,
            businessCategoryId: businessCategoryId || 'cmgae36mf0004x4lmmcygs7ha',
            tags: tags ? JSON.stringify(tags.split(',').map((tag) => tag.trim())) : null,
            fileSize: req.file.size,
            dimensions: null,
            approvalStatus: req.user.userType === 'ADMIN' ? 'APPROVED' : 'PENDING'
        };
        // Process image with fallback (Sharp or simple processing)
        try {
            const processingResult = await (0, imageProcessor_1.processImageWithFallback)(req.file.path, thumbnailsDir, req.file.filename);
            if (processingResult.success) {
                imageData.thumbnailUrl = processingResult.thumbnailUrl;
                imageData.dimensions = processingResult.dimensions;
                console.log('✅ Image processing completed successfully');
            }
            else {
                console.warn('⚠️ Image processing failed:', processingResult.error);
                // Continue without thumbnail and dimensions - upload will still work
            }
        }
        catch (processingError) {
            console.warn('⚠️ Image processing error:', processingError);
            // Continue without thumbnail and dimensions - upload will still work
        }
        // Set uploader based on user type
        if (req.user.userType === 'ADMIN') {
            imageData.adminUploaderId = req.user.id;
        }
        else {
            imageData.subadminUploaderId = req.user.id;
        }
        const image = await prisma.image.create({
            data: imageData,
            include: {
                businessCategory: {
                    select: { name: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPLOAD',
                resource: 'IMAGE',
                resourceId: image.id,
                details: `Uploaded image: ${image.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            image
        });
    }
    catch (error) {
        console.error('❌ Upload image error:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            file: req.file ? req.file.filename : 'No file'
        });
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            try {
                fs_1.default.unlinkSync(req.file.path);
                console.log('✅ Cleaned up uploaded file');
            }
            catch (cleanupError) {
                console.error('❌ Error cleaning up file:', cleanupError);
            }
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload image',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Simple image upload without processing (for testing)
router.post('/images/upload-simple', upload.single('image'), [
    (0, express_validator_1.body)('title').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('category').isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Image file is required'
            });
        }
        const { title, description, category, businessCategoryId, tags } = req.body;
        // Create image record without processing
        const imageData = {
            title,
            description,
            url: `/uploads/images/${req.file.filename}`,
            thumbnailUrl: null, // No thumbnail for simple upload
            category,
            businessCategoryId: businessCategoryId || 'cmgae36mf0004x4lmmcygs7ha',
            tags: tags ? JSON.stringify(tags.split(',').map((tag) => tag.trim())) : null,
            fileSize: req.file.size,
            dimensions: null, // No dimensions for simple upload
            approvalStatus: req.user.userType === 'ADMIN' ? 'APPROVED' : 'PENDING'
        };
        // Set uploader based on user type
        if (req.user.userType === 'ADMIN') {
            imageData.adminUploaderId = req.user.id;
        }
        else {
            imageData.subadminUploaderId = req.user.id;
        }
        const image = await prisma.image.create({
            data: imageData,
            include: {
                businessCategory: {
                    select: { name: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPLOAD',
                resource: 'IMAGE',
                resourceId: image.id,
                details: `Uploaded image (simple): ${image.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully (simple mode)',
            image
        });
    }
    catch (error) {
        console.error('Simple upload image error:', error);
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
});
// Approve/Reject content (Admin only)
router.put('/images/:id/approval', [
    (0, express_validator_1.body)('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
    (0, express_validator_1.body)('reason').optional().isLength({ max: 500 }).withMessage('Reason too long'),
], async (req, res) => {
    try {
        if (req.user.userType !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can approve content'
            });
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const { status, reason } = req.body;
        const image = await prisma.image.update({
            where: { id },
            data: {
                approvalStatus: status,
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
            include: {
                subadminUploader: {
                    select: { name: true, email: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                userType: 'ADMIN',
                action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
                resource: 'IMAGE',
                resourceId: id,
                details: `${status} image: ${image.title}${reason ? ` - ${reason}` : ''}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.json({
            success: true,
            message: `Image ${status.toLowerCase()} successfully`,
            image
        });
    }
    catch (error) {
        console.error('Approve image error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update image approval status'
        });
    }
});

// Update image details (Admin and Subadmin)
router.put('/images/:id', [
    (0, express_validator_1.body)('title').optional().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
    (0, express_validator_1.body)('category').optional().isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
    (0, express_validator_1.body)('tags').optional().isLength({ max: 500 }).withMessage('Tags too long'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { title, description, category, businessCategoryId, tags } = req.body;

        // Check if image exists and user has permission to edit
        const existingImage = await prisma.image.findUnique({
            where: { id },
            include: {
                admin: { select: { id: true } },
                subadmin: { select: { id: true } }
            }
        });

        if (!existingImage) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }

        // Check permissions: Admin can edit any image, Subadmin can only edit their own
        const canEdit = req.user.userType === 'ADMIN' || 
                       (req.user.userType === 'SUBADMIN' && existingImage.subadminUploaderId === req.user.id);

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to edit this image'
            });
        }

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (businessCategoryId) updateData.businessCategoryId = businessCategoryId;
        if (tags) updateData.tags = JSON.stringify(tags.split(',').map((tag) => tag.trim()));

        // Update image
        const updatedImage = await prisma.image.update({
            where: { id },
            data: updateData,
            include: {
                businessCategory: {
                    select: { name: true, icon: true }
                },
                admin: {
                    select: { name: true, email: true }
                },
                subadmin: {
                    select: { name: true, email: true }
                }
            }
        });

        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPDATE',
                resource: 'IMAGE',
                resourceId: id,
                details: `Updated image: ${updatedImage.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            image: updatedImage
        });
    }
    catch (error) {
        console.error('Update image error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update image'
        });
    }
});

// Delete image (Admin and Subadmin)
router.delete('/images/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if image exists and user has permission to delete
        const existingImage = await prisma.image.findUnique({
            where: { id },
            include: {
                admin: { select: { id: true } },
                subadmin: { select: { id: true } }
            }
        });

        if (!existingImage) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }

        // Check permissions: Admin can delete any image, Subadmin can only delete their own
        const canDelete = req.user.userType === 'ADMIN' || 
                         (req.user.userType === 'SUBADMIN' && existingImage.subadminUploaderId === req.user.id);

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this image'
            });
        }

        // Delete the image file from filesystem
        try {
            if (existingImage.url && fs_1.default.existsSync(`.${existingImage.url}`)) {
                fs_1.default.unlinkSync(`.${existingImage.url}`);
            }
            if (existingImage.thumbnailUrl && fs_1.default.existsSync(`.${existingImage.thumbnailUrl}`)) {
                fs_1.default.unlinkSync(`.${existingImage.thumbnailUrl}`);
            }
        } catch (fileError) {
            console.warn('Warning: Could not delete image files:', fileError.message);
        }

        // Delete image from database
        await prisma.image.delete({
            where: { id }
        });

        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'DELETE',
                resource: 'IMAGE',
                resourceId: id,
                details: `Deleted image: ${existingImage.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image'
        });
    }
});

// ============================================
// VIDEO MANAGEMENT
// ============================================
// Get videos with filtering
router.get('/videos', async (req, res) => {
    try {
        const { category, businessCategory, status, uploaderType } = req.query;
        const where = {};
        if (category)
            where.category = category;
        if (businessCategory)
            where.businessCategoryId = businessCategory;
        if (status)
            where.approvalStatus = status;
        if (uploaderType)
            where.uploaderType = uploaderType;
        const videos = await prisma.video.findMany({
            where,
            include: {
                businessCategory: {
                    select: { name: true, icon: true }
                },
                admin: {
                    select: { name: true, email: true }
                },
                subadmin: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            videos
        });
    }
    catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos'
        });
    }
});
// Upload video
router.post('/videos/upload', upload.single('video'), [
    (0, express_validator_1.body)('title').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('category').isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Video file is required'
            });
        }
        const { title, description, category, businessCategoryId, tags, duration } = req.body;
        // Create video record
        const videoData = {
            title,
            description,
            url: `/uploads/videos/${req.file.filename}`,
            videoUrl: `/uploads/videos/${req.file.filename}`,
            category,
            businessCategoryId: businessCategoryId || 'cmgae36mf0004x4lmmcygs7ha',
            tags: tags ? JSON.stringify(tags.split(',').map((tag) => tag.trim())) : null,
            fileSize: req.file.size,
            duration: duration ? parseInt(duration) : 0,
            approvalStatus: req.user.userType === 'ADMIN' ? 'APPROVED' : 'PENDING'
        };
        // Set uploader based on user type
        if (req.user.userType === 'ADMIN') {
            videoData.adminUploaderId = req.user.id;
        }
        else {
            videoData.subadminUploaderId = req.user.id;
        }
        const video = await prisma.video.create({
            data: videoData,
            include: {
                businessCategory: {
                    select: { name: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPLOAD',
                resource: 'VIDEO',
                resourceId: video.id,
                details: `Uploaded video: ${video.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            video
        });
    }
    catch (error) {
        console.error('Upload video error:', error);
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload video'
        });
    }
});
// Simple video upload without processing (for testing)
router.post('/videos/upload-simple', upload.single('video'), [
    (0, express_validator_1.body)('title').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('category').isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Video file is required'
            });
        }
        const { title, description, category, businessCategoryId, tags, duration } = req.body;
        // Create video record without processing
        const videoData = {
            title,
            description,
            url: `/uploads/videos/${req.file.filename}`,
            videoUrl: `/uploads/videos/${req.file.filename}`,
            category,
            businessCategoryId: businessCategoryId || 'cmgae36mf0004x4lmmcygs7ha',
            tags: tags ? JSON.stringify(tags.split(',').map((tag) => tag.trim())) : null,
            fileSize: req.file.size,
            duration: duration ? parseInt(duration) : 0,
            approvalStatus: req.user.userType === 'ADMIN' ? 'APPROVED' : 'PENDING'
        };
        // Set uploader based on user type
        if (req.user.userType === 'ADMIN') {
            videoData.adminUploaderId = req.user.id;
        }
        else {
            videoData.subadminUploaderId = req.user.id;
        }
        const video = await prisma.video.create({
            data: videoData,
            include: {
                businessCategory: {
                    select: { name: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPLOAD',
                resource: 'VIDEO',
                resourceId: video.id,
                details: `Uploaded video (simple): ${video.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully (simple mode)',
            video
        });
    }
    catch (error) {
        console.error('Simple upload video error:', error);
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload video'
        });
    }
});

// Update video details (Admin and Subadmin)
router.put('/videos/:id', [
    (0, express_validator_1.body)('title').optional().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
    (0, express_validator_1.body)('category').optional().isIn(['BUSINESS', 'FESTIVAL', 'GENERAL']).withMessage('Invalid category'),
    (0, express_validator_1.body)('tags').optional().isLength({ max: 500 }).withMessage('Tags too long'),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { title, description, category, businessCategoryId, tags, duration } = req.body;

        // Check if video exists and user has permission to edit
        const existingVideo = await prisma.video.findUnique({
            where: { id },
            include: {
                admin: { select: { id: true } },
                subadmin: { select: { id: true } }
            }
        });

        if (!existingVideo) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        // Check permissions: Admin can edit any video, Subadmin can only edit their own
        const canEdit = req.user.userType === 'ADMIN' || 
                       (req.user.userType === 'SUBADMIN' && existingVideo.subadminUploaderId === req.user.id);

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to edit this video'
            });
        }

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (businessCategoryId) updateData.businessCategoryId = businessCategoryId;
        if (tags) updateData.tags = JSON.stringify(tags.split(',').map((tag) => tag.trim()));
        if (duration) updateData.duration = parseInt(duration);

        // Update video
        const updatedVideo = await prisma.video.update({
            where: { id },
            data: updateData,
            include: {
                businessCategory: {
                    select: { name: true, icon: true }
                },
                admin: {
                    select: { name: true, email: true }
                },
                subadmin: {
                    select: { name: true, email: true }
                }
            }
        });

        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'UPDATE',
                resource: 'VIDEO',
                resourceId: id,
                details: `Updated video: ${updatedVideo.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            video: updatedVideo
        });
    }
    catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update video'
        });
    }
});

// Delete video (Admin and Subadmin)
router.delete('/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if video exists and user has permission to delete
        const existingVideo = await prisma.video.findUnique({
            where: { id },
            include: {
                admin: { select: { id: true } },
                subadmin: { select: { id: true } }
            }
        });

        if (!existingVideo) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        // Check permissions: Admin can delete any video, Subadmin can only delete their own
        const canDelete = req.user.userType === 'ADMIN' || 
                         (req.user.userType === 'SUBADMIN' && existingVideo.subadminUploaderId === req.user.id);

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this video'
            });
        }

        // Delete the video file from filesystem
        try {
            if (existingVideo.url && fs_1.default.existsSync(`.${existingVideo.url}`)) {
                fs_1.default.unlinkSync(`.${existingVideo.url}`);
            }
            if (existingVideo.thumbnailUrl && fs_1.default.existsSync(`.${existingVideo.thumbnailUrl}`)) {
                fs_1.default.unlinkSync(`.${existingVideo.thumbnailUrl}`);
            }
        } catch (fileError) {
            console.warn('Warning: Could not delete video files:', fileError.message);
        }

        // Delete video from database
        await prisma.video.delete({
            where: { id }
        });

        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'DELETE',
                resource: 'VIDEO',
                resourceId: id,
                details: `Deleted video: ${existingVideo.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete video'
        });
    }
});

// Approve/Reject video (Admin only)
router.put('/videos/:id/approval', [
    (0, express_validator_1.body)('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
    (0, express_validator_1.body)('reason').optional().isLength({ max: 500 }).withMessage('Reason too long'),
], async (req, res) => {
    try {
        if (req.user.userType !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can approve content'
            });
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const { status, reason } = req.body;
        const video = await prisma.video.update({
            where: { id },
            data: {
                approvalStatus: status
            },
            include: {
                subadmin: {
                    select: { name: true, email: true }
                }
            }
        });
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                userType: 'ADMIN',
                action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
                resource: 'VIDEO',
                resourceId: id,
                details: `${status} video: ${video.title}${reason ? ` - ${reason}` : ''}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.json({
            success: true,
            message: `Video ${status.toLowerCase()} successfully`,
            video
        });
    }
    catch (error) {
        console.error('Approve video error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update video approval status'
        });
    }
});

// Get pending approvals (Admin only)
router.get('/pending-approvals', async (req, res) => {
    try {
        if (req.user.userType !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        const [pendingImages, pendingVideos] = await Promise.all([
            prisma.image.findMany({
                where: { approvalStatus: 'PENDING' },
                include: {
                    businessCategory: { select: { name: true } },
                    subadminUploader: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'asc' }
            }),
            prisma.video.findMany({
                where: { approvalStatus: 'PENDING' },
                include: {
                    businessCategory: { select: { name: true } },
                    subadminUploader: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'asc' }
            })
        ]);
        res.json({
            success: true,
            pendingContent: {
                images: pendingImages,
                videos: pendingVideos,
                total: pendingImages.length + pendingVideos.length
            }
        });
    }
    catch (error) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending approvals'
        });
    }
});
// Bulk approve/reject content
router.post('/bulk-approval', [
    (0, express_validator_1.body)('contentIds').isArray().withMessage('Content IDs must be an array'),
    (0, express_validator_1.body)('contentType').isIn(['IMAGE', 'VIDEO']).withMessage('Content type must be IMAGE or VIDEO'),
    (0, express_validator_1.body)('action').isIn(['APPROVED', 'REJECTED']).withMessage('Action must be APPROVED or REJECTED'),
], async (req, res) => {
    try {
        if (req.user.userType !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { contentIds, contentType, action, reason } = req.body;
        let updatedCount = 0;
        if (contentType === 'IMAGE') {
            const result = await prisma.image.updateMany({
                where: {
                    id: { in: contentIds },
                    approvalStatus: 'PENDING'
                },
                data: {
                    approvalStatus: action,
                    approvedBy: req.user.id,
                    approvedAt: new Date()
                }
            });
            updatedCount = result.count;
        }
        else {
            const result = await prisma.video.updateMany({
                where: {
                    id: { in: contentIds },
                    approvalStatus: 'PENDING'
                },
                data: {
                    approvalStatus: action,
                    approvedBy: req.user.id,
                    approvedAt: new Date()
                }
            });
            updatedCount = result.count;
        }
        // Log bulk activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                userType: 'ADMIN',
                action: `BULK_${action}`,
                resource: contentType,
                details: `Bulk ${action.toLowerCase()} ${updatedCount} ${contentType.toLowerCase()}(s)${reason ? ` - ${reason}` : ''}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.json({
            success: true,
            message: `Successfully ${action.toLowerCase()} ${updatedCount} ${contentType.toLowerCase()}(s)`,
            updatedCount
        });
    }
    catch (error) {
        console.error('Bulk approval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process bulk approval'
        });
    }
});
// Delete content
router.delete('/:contentType/:id', async (req, res) => {
    try {
        const { contentType, id } = req.params;
        if (!['images', 'videos'].includes(contentType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content type'
            });
        }
        let content = null;
        let filePath = '';
        if (contentType === 'images') {
            content = await prisma.image.findUnique({ where: { id } });
            if (content) {
                filePath = path_1.default.join(imagesDir, path_1.default.basename(content.url));
                await prisma.image.delete({ where: { id } });
            }
        }
        else {
            content = await prisma.video.findUnique({ where: { id } });
            if (content) {
                filePath = path_1.default.join(videosDir, path_1.default.basename(content.url));
                await prisma.video.delete({ where: { id } });
            }
        }
        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }
        // Delete physical file
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete thumbnail if exists
        if (content.thumbnailUrl) {
            const thumbnailPath = path_1.default.join(thumbnailsDir, path_1.default.basename(content.thumbnailUrl));
            if (fs_1.default.existsSync(thumbnailPath)) {
                fs_1.default.unlinkSync(thumbnailPath);
            }
        }
        // Log activity
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userType === 'ADMIN' ? req.user.id : undefined,
                subadminId: req.user.userType === 'SUBADMIN' ? req.user.id : undefined,
                userType: req.user.userType,
                action: 'DELETE',
                resource: contentType.toUpperCase().slice(0, -1), // Remove 's' from 'images'/'videos'
                resourceId: id,
                details: `Deleted ${contentType.slice(0, -1)}: ${content.title}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status: 'SUCCESS'
            }
        });
        res.json({
            success: true,
            message: `${contentType.slice(0, -1)} deleted successfully`
        });
    }
    catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete content'
        });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map