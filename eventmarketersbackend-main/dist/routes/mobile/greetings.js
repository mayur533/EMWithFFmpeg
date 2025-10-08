"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /api/mobile/greeting-categories
 * Get greeting categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.greetingCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        res.json({
            success: true,
            message: 'Greeting categories fetched successfully',
            data: categories
        });
    }
    catch (error) {
        console.error('Get greeting categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch greeting categories'
        });
    }
});
/**
 * GET /api/mobile/greeting-templates
 * Get greeting templates with filtering and pagination
 */
router.get('/templates', async (req, res) => {
    try {
        const { category, language = 'en', page = '1', limit = '10', search, isPremium } = req.query;
        const where = { isActive: true };
        if (category)
            where.category = category;
        if (language)
            where.language = language;
        if (isPremium !== undefined)
            where.isPremium = isPremium === 'true';
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { tags: { contains: search } }
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [templates, total] = await Promise.all([
            prisma.greetingTemplate.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.greetingTemplate.count({ where })
        ]);
        res.json({
            success: true,
            message: 'Greeting templates fetched successfully',
            data: {
                templates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get greeting templates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch greeting templates'
        });
    }
});
/**
 * GET /api/mobile/greeting-templates/search
 * Search greeting templates
 */
router.get('/templates/search', async (req, res) => {
    try {
        const { q: searchQuery, category, language = 'en', page = '1', limit = '10', isPremium } = req.query;
        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        const where = {
            isActive: true,
            OR: [
                { title: { contains: searchQuery } },
                { description: { contains: searchQuery } },
                { tags: { contains: searchQuery } }
            ]
        };
        if (category)
            where.category = category;
        if (language)
            where.language = language;
        if (isPremium !== undefined)
            where.isPremium = isPremium === 'true';
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [templates, total] = await Promise.all([
            prisma.greetingTemplate.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.greetingTemplate.count({ where })
        ]);
        res.json({
            success: true,
            message: 'Greeting templates search completed successfully',
            data: {
                templates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Search greeting templates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search greeting templates'
        });
    }
});
/**
 * GET /api/mobile/greeting-templates/:id
 * Get greeting template details by ID
 */
router.get('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prisma.greetingTemplate.findUnique({
            where: { id },
            include: {
                greetingLikes: {
                    select: {
                        id: true,
                        mobileUserId: true,
                        createdAt: true
                    }
                },
                greetingDownloads: {
                    select: {
                        id: true,
                        mobileUserId: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Greeting template not found'
            });
        }
        res.json({
            success: true,
            message: 'Greeting template details fetched successfully',
            data: template
        });
    }
    catch (error) {
        console.error('Get greeting template details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch greeting template details'
        });
    }
});
/**
 * POST /api/mobile/greeting-templates/:id/like
 * Like a greeting template
 */
router.post('/templates/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required'
            });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        // Check if template exists
        const template = await prisma.greetingTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Greeting template not found'
            });
        }
        // Check if already liked
        const existingLike = await prisma.greetingLike.findFirst({
            where: {
                greetingId: id,
                mobileUserId: userId
            }
        });
        if (existingLike) {
            return res.status(409).json({
                success: false,
                error: 'Greeting template already liked'
            });
        }
        // Create like and update template likes count
        const [like, updatedTemplate] = await Promise.all([
            prisma.greetingLike.create({
                data: {
                    greetingId: id,
                    mobileUserId: userId
                }
            }),
            prisma.greetingTemplate.update({
                where: { id },
                data: {
                    likes: { increment: 1 }
                }
            })
        ]);
        res.json({
            success: true,
            message: 'Greeting template liked successfully',
            isLiked: true
        });
    }
    catch (error) {
        console.error('Like greeting template error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like greeting template'
        });
    }
});
/**
 * DELETE /api/mobile/greeting-templates/:id/like
 * Unlike a greeting template
 */
router.delete('/templates/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required'
            });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        // Check if like exists
        const existingLike = await prisma.greetingLike.findFirst({
            where: {
                greetingId: id,
                mobileUserId: userId
            }
        });
        if (!existingLike) {
            return res.status(404).json({
                success: false,
                error: 'Like not found'
            });
        }
        // Delete like and update template likes count
        const [, updatedTemplate] = await Promise.all([
            prisma.greetingLike.delete({
                where: { id: existingLike.id }
            }),
            prisma.greetingTemplate.update({
                where: { id },
                data: {
                    likes: { decrement: 1 }
                }
            })
        ]);
        res.json({
            success: true,
            message: 'Greeting template unliked successfully',
            isLiked: false
        });
    }
    catch (error) {
        console.error('Unlike greeting template error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unlike greeting template'
        });
    }
});
/**
 * POST /api/mobile/greeting-templates/:id/download
 * Download a greeting template
 */
router.post('/templates/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required'
            });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        // Check if template exists
        const template = await prisma.greetingTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Greeting template not found'
            });
        }
        // Create download record and update template downloads count
        const [download, updatedTemplate] = await Promise.all([
            prisma.greetingDownload.create({
                data: {
                    greetingId: id,
                    mobileUserId: userId
                }
            }),
            prisma.greetingTemplate.update({
                where: { id },
                data: {
                    downloads: { increment: 1 }
                }
            })
        ]);
        // Also record in unified MobileDownload table
        await prisma.mobileDownload.create({
            data: {
                mobileUserId: userId,
                resourceType: 'GREETING',
                resourceId: id,
                fileUrl: template.fileUrl || template.imageUrl
            }
        });
        res.json({
            success: true,
            message: 'Greeting template download recorded successfully',
            downloadUrl: template.fileUrl || template.imageUrl
        });
    }
    catch (error) {
        console.error('Download greeting template error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record greeting template download'
        });
    }
});
/**
 * GET /api/mobile/stickers
 * Get stickers
 */
router.get('/stickers', async (req, res) => {
    try {
        const { category, page = '1', limit = '50' } = req.query;
        const where = { isActive: true };
        if (category)
            where.category = category;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [stickers, total] = await Promise.all([
            prisma.sticker.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.sticker.count({ where })
        ]);
        res.json({
            success: true,
            message: 'Stickers fetched successfully',
            data: {
                stickers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get stickers error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stickers'
        });
    }
});
/**
 * GET /api/mobile/emojis
 * Get emojis
 */
router.get('/emojis', async (req, res) => {
    try {
        const { category, page = '1', limit = '100' } = req.query;
        const where = { isActive: true };
        if (category)
            where.category = category;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [emojis, total] = await Promise.all([
            prisma.emoji.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take
            }),
            prisma.emoji.count({ where })
        ]);
        res.json({
            success: true,
            message: 'Emojis fetched successfully',
            data: {
                emojis,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get emojis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emojis'
        });
    }
});
/**
 * GET /api/mobile/greetings
 * Get all greetings (alias for /templates)
 */
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '20', category, search, type } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { isActive: true };
        if (category)
            where.category = category;
        if (search)
            where.title = { contains: search, mode: 'insensitive' };
        if (type)
            where.type = type;
        const [greetings, total] = await Promise.all([
            prisma.greetingTemplate.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.greetingTemplate.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                greetings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        console.error('Fetch greetings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch greetings'
        });
    }
});
exports.default = router;
//# sourceMappingURL=greetings.js.map