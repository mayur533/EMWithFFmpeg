const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Import compiled web frontend routes
const authRoutes = require('./dist/routes/auth').default;
const adminRoutes = require('./dist/routes/admin').default;
const contentRoutes = require('./dist/routes/content').default;
const customerRoutes = require('./dist/routes/customer').default;
const installedUsersRoutes = require('./dist/routes/installedUsers').default;
const businessProfileRoutes = require('./dist/routes/businessProfile').default;
const analyticsRoutes = require('./dist/routes/analytics').default;
const searchRoutes = require('./dist/routes/search').default;
const fileManagementRoutes = require('./dist/routes/fileManagement').default;
const contentSyncRoutes = require('./dist/routes/contentSync').default;

console.log('🚀 EventMarketers Backend - Deployment Server');
console.log('==============================================\n');

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://eventmarketers.com',
    'https://eventmarketersfrontend.onrender.com',
    'https://eventmarketersbackend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventMarketers Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// WEB FRONTEND API ROUTES
// ============================================

// Register web frontend routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/installed-users', installedUsersRoutes);
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/file-management', fileManagementRoutes);
app.use('/api/content-sync', contentSyncRoutes);

// ============================================
// ONE-TIME ADMIN SETUP ENDPOINT
// ============================================
// REMOVE THIS AFTER CREATING ADMIN USER!

app.post('/api/setup/create-admin-user', async (req, res) => {
  try {
    const { secret } = req.body;
    const SETUP_SECRET = 'EventMarketers_Setup_2024_Secret_Key';
    
    if (secret !== SETUP_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Invalid setup secret'
      });
    }

    console.log('🔐 One-time admin setup initiated...');

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('EventMarketers2024!', 12);
    
    // Use upsert to create or update admin user
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@eventmarketers.com' },
      update: {
        password: hashedPassword,
        name: 'EventMarketers Admin',
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email: 'admin@eventmarketers.com',
        name: 'EventMarketers Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created/updated:', admin.email);

    res.json({
      success: true,
      message: 'Admin user created/updated successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      credentials: {
        email: 'admin@eventmarketers.com',
        password: 'EventMarketers2024!'
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user',
      details: error.message
    });
  }
});

// ============================================
// MOBILE APIs - WORKING ENDPOINTS
// ============================================

// Mobile Home Stats API
app.get('/api/mobile/home/stats', async (req, res) => {
  try {
    const [templates, videos, greetings, downloads, likes] = await Promise.all([
      prisma.mobileTemplate.count({ where: { isActive: true } }),
      prisma.mobileVideo.count({ where: { isActive: true } }),
      prisma.greetingTemplate.count({ where: { isActive: true } }),
      prisma.mobileDownload.count(),
      prisma.mobileLike.count()
    ]);

    res.json({
      success: true,
      data: {
        totalTemplates: templates,
        totalVideos: videos,
        totalGreetings: greetings,
        totalDownloads: downloads,
        totalLikes: likes,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Mobile home stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch home statistics'
    });
  }
});

// Mobile Templates API
app.get('/api/mobile/templates', async (req, res) => {
  try {
    const { page = '1', limit = '20', category } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = { isActive: true };
    if (category) {
      where.category = category;
    }

    const templates = await prisma.mobileTemplate.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.mobileTemplate.count({ where });

    res.json({
      success: true,
      data: {
        templates: templates.map(template => ({
          id: template.id,
          title: template.title,
          description: template.description,
          imageUrl: template.imageUrl,
          thumbnailUrl: template.thumbnailUrl,
          category: template.category,
          tags: template.tags ? JSON.parse(template.tags) : [],
          isPremium: template.isPremium,
          downloads: template.downloads,
          likes: template.likes,
          createdAt: template.createdAt
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Mobile templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile templates'
    });
  }
});

// Mobile Greetings API
app.get('/api/mobile/greetings', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const greetings = await prisma.greetingTemplate.findMany({
      where: { isActive: true },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.greetingTemplate.count({ where: { isActive: true } });

    res.json({
      success: true,
      data: {
        greetings: greetings.map(greeting => ({
          id: greeting.id,
          title: greeting.title,
          description: greeting.description,
          imageUrl: greeting.imageUrl,
          category: greeting.category,
          tags: greeting.tags ? JSON.parse(greeting.tags) : [],
          downloads: greeting.downloads,
          likes: greeting.likes,
          createdAt: greeting.createdAt
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Mobile greetings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile greetings'
    });
  }
});

// Mobile Posters API
app.get('/api/mobile/posters', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Mock posters data for now
    const mockPosters = [
      {
        id: '1',
        title: 'Business Promotion',
        category: 'business',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Professional business poster'
      },
      {
        id: '2',
        title: 'Event Announcement',
        category: 'event',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Eye-catching event poster'
      },
      {
        id: '3',
        title: 'Sale Promotion',
        category: 'sale',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Attractive sale poster'
      }
    ];

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPosters = mockPosters.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        posters: paginatedPosters,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: mockPosters.length,
          pages: Math.ceil(mockPosters.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Mobile posters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile posters'
    });
  }
});

// Mobile Posters Categories API
app.get('/api/mobile/posters/categories', async (req, res) => {
  try {
    const categories = [
      { id: '1', name: 'Business', icon: '💼', count: 25 },
      { id: '2', name: 'Event', icon: '🎉', count: 18 },
      { id: '3', name: 'Sale', icon: '🛍️', count: 12 },
      { id: '4', name: 'General', icon: '📄', count: 30 }
    ];

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Mobile posters categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch poster categories'
    });
  }
});

// Mobile Posters by Category API
app.get('/api/mobile/posters/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const mockPosters = [
      {
        id: '1',
        title: 'Business Promotion',
        category: 'business',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Professional business poster'
      },
      {
        id: '2',
        title: 'Event Announcement',
        category: 'event',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Eye-catching event poster'
      },
      {
        id: '3',
        title: 'Sale Promotion',
        category: 'sale',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Attractive sale poster'
      },
      {
        id: '4',
        title: 'General Business Poster',
        category: 'general',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'Multi-purpose business poster'
      },
      {
        id: '5',
        title: 'General Promotion',
        category: 'general',
        imageUrl: '/api/placeholder/400/600',
        thumbnailUrl: '/api/placeholder/200/300',
        description: 'General promotional content'
      }
    ];

    const categoryLower = categoryName.toLowerCase();
    let posters = mockPosters.filter(p => p.category.toLowerCase() === categoryLower);

    if (categoryLower === 'general') {
      posters = mockPosters.filter(p => p.category.toLowerCase() === 'general');
    }

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPosters = posters.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        category: categoryName,
        posters: paginatedPosters,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: posters.length,
          pages: Math.ceil(posters.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Fetch posters by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posters by category'
    });
  }
});

// Mobile User Registration API
app.post('/api/mobile/auth/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      companyName, 
      phone, 
      description, 
      category, 
      address, 
      alternatePhone, 
      website, 
      companyLogo, 
      displayName 
    } = req.body;

    // Validate required fields as per documentation (only email and password required)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.mobileUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        message: 'User with this email already exists'
      });
    }

    // Hash password (in production, use bcrypt)
    // For now, we'll store it as plain text for demo purposes
    const hashedPassword = password; // In production: await bcrypt.hash(password, 10);

    // Create new mobile user
    const newUser = await prisma.mobileUser.create({
      data: {
        email,
        password: hashedPassword,
        name: companyName || displayName,
        phone,
        isActive: true,
        lastActiveAt: new Date()
      }
    });

    // Create business profile if company details provided
    let businessProfile = null;
    if (companyName || category) {
      businessProfile = await prisma.businessProfile.create({
        data: {
          mobileUserId: newUser.id,
          businessName: companyName,
          businessEmail: email,
          businessPhone: phone,
          businessDescription: description || '',
          businessCategory: category || 'General',
          businessAddress: address || '',
          businessWebsite: website || '',
          businessLogo: companyLogo || ''
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        userType: 'MOBILE_USER'
      },
      process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          companyName: businessProfile?.businessName || companyName,
          phoneNumber: newUser.phone,
          description: businessProfile?.businessDescription || description || '',
          category: businessProfile?.businessCategory || category || '',
          address: businessProfile?.businessAddress || address || '',
          alternatePhone: alternatePhone || '',
          website: businessProfile?.businessWebsite || website || '',
          logo: businessProfile?.businessLogo || companyLogo || '',
          photo: businessProfile?.businessLogo || companyLogo || '',
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

// Mobile User Login API
app.post('/api/mobile/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.mobileUser.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password (in production, use bcrypt)
    // For now, we'll do simple string comparison for demo purposes
    console.log('🔐 Password verification:', {
      email: email,
      emailLength: email.length,
      passwordLength: password.length,
      savedPasswordLength: user.password.length,
      passwordsMatch: user.password === password
    });
    
    const isValidPassword = user.password === password; // In production: await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('❌ Password mismatch!', {
        provided: password.substring(0, 5) + '...',
        stored: user.password.substring(0, 5) + '...'
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last active timestamp
    await prisma.mobileUser.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    // Get business profile if exists
    const businessProfile = await prisma.businessProfile.findFirst({
      where: { mobileUserId: user.id }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        userType: 'MOBILE_USER' 
      },
      process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024',
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Return user data with success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          companyName: businessProfile?.businessName || user.name,
          phoneNumber: user.phone,
          description: businessProfile?.businessDescription || '',
          category: businessProfile?.businessCategory || '',
          address: businessProfile?.businessAddress || '',
          alternatePhone: '',
          website: businessProfile?.businessWebsite || '',
          logo: businessProfile?.businessLogo || '',
          photo: businessProfile?.businessLogo || '',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login user'
    });
  }
});

// Google OAuth Login API
app.post('/api/mobile/auth/google', async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;

    // Validate required fields
    if (!idToken || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token and access token are required'
      });
    }

    // In a real implementation, you would:
    // 1. Verify the Google ID token with Google's API
    // 2. Extract user information from the token
    // 3. Create or find the user in your database
    // 4. Generate your own JWT token

    // For demo purposes, we'll simulate this process
    const mockGoogleUser = {
      email: 'google_user@example.com',
      name: 'Google User',
      providerId: 'google'
    };

    // Check if user already exists
    let user = await prisma.mobileUser.findUnique({
      where: { email: mockGoogleUser.email }
    });

    if (!user) {
      // Create new user from Google data
      user = await prisma.mobileUser.create({
        data: {
          email: mockGoogleUser.email,
          password: 'google_oauth_user', // Special password for OAuth users
          name: mockGoogleUser.name,
          isActive: true,
          lastActiveAt: new Date()
        }
      });
    }

    // Update last active timestamp
    await prisma.mobileUser.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    // Get business profile if exists
    const businessProfile = await prisma.businessProfile.findFirst({
      where: { mobileUserId: user.id }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        userType: 'MOBILE_USER',
        provider: 'google'
      },
      process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google sign-in successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          companyName: businessProfile?.businessName || user.name,
          phoneNumber: user.phone,
          description: businessProfile?.businessDescription || '',
          category: businessProfile?.businessCategory || '',
          address: businessProfile?.businessAddress || '',
          alternatePhone: '',
          website: businessProfile?.businessWebsite || '',
          logo: businessProfile?.businessLogo || '',
          photo: businessProfile?.businessLogo || '',
          providerId: 'google',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google'
    });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS - PHASE 1 BATCH 1
// ============================================

// Get Current User Profile (Me)
app.get('/api/mobile/auth/me', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const user = await prisma.mobileUser.findUnique({
      where: { id: userId },
      include: {
        businessProfiles: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            subscriptions: true,
            downloads: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const businessProfile = user.businessProfiles[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        companyName: businessProfile?.businessName || user.name,
        phoneNumber: user.phone,
        description: businessProfile?.businessDescription || '',
        category: businessProfile?.businessCategory || '',
        address: businessProfile?.businessAddress || '',
        alternatePhone: user.phone,
        website: businessProfile?.businessWebsite || '',
        logo: businessProfile?.businessLogo || '',
        photo: businessProfile?.businessLogo || '',
        totalViews: 0,
        downloadAttempts: user._count.downloads,
        isConverted: user._count.subscriptions > 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Update User Profile
app.put('/api/mobile/auth/profile', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const {
      companyName,
      phoneNumber,
      description,
      category,
      address,
      alternatePhone,
      website,
      logo,
      photo
    } = req.body;

    // Update user basic info
    const updatedUser = await prisma.mobileUser.update({
      where: { id: userId },
      data: {
        name: companyName || undefined,
        phone: phoneNumber || undefined
      }
    });

    // Update or create business profile
    let businessProfile = await prisma.businessProfile.findFirst({
      where: { mobileUserId: userId }
    });

    if (businessProfile) {
      // Update existing profile
      businessProfile = await prisma.businessProfile.update({
        where: { id: businessProfile.id },
        data: {
          businessName: companyName || undefined,
          businessPhone: phoneNumber || undefined,
          businessDescription: description || undefined,
          businessCategory: category || undefined,
          businessAddress: address || undefined,
          businessWebsite: website || undefined,
          businessLogo: logo || photo || undefined
        }
      });
    } else if (companyName || category) {
      // Create new profile
      businessProfile = await prisma.businessProfile.create({
        data: {
          mobileUserId: userId,
          businessName: companyName || 'My Business',
          businessEmail: updatedUser.email || '',
          businessPhone: phoneNumber || updatedUser.phone || '',
          businessDescription: description || '',
          businessCategory: category || 'General',
          businessAddress: address || '',
          businessWebsite: website || '',
          businessLogo: logo || photo || ''
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        companyName: businessProfile?.businessName || updatedUser.name,
        phoneNumber: updatedUser.phone,
        description: businessProfile?.businessDescription || '',
        category: businessProfile?.businessCategory || '',
        address: businessProfile?.businessAddress || '',
        alternatePhone: phoneNumber,
        website: businessProfile?.businessWebsite || '',
        logo: businessProfile?.businessLogo || '',
        photo: businessProfile?.businessLogo || '',
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// User Logout
app.post('/api/mobile/auth/logout', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      // Token already invalid, that's fine for logout
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // Log the logout activity
    await prisma.mobileActivity.create({
      data: {
        mobileUserId: userId,
        action: 'LOGOUT',
        resourceType: 'Auth',
        resourceId: userId
      }
    }).catch(err => console.error('Failed to log logout activity:', err));

    // Note: JWT tokens can't be invalidated server-side
    // The client should delete the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
});

// Record User Activity
app.post('/api/mobile/activity', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const {
      userId: requestUserId,
      action,
      resourceType,
      resourceId,
      metadata
    } = req.body;

    // Validate required fields
    if (!action || !resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        message: 'Action, resourceType, and resourceId are required'
      });
    }

    // Create activity record
    const activity = await prisma.mobileActivity.create({
      data: {
        mobileUserId: userId,
        action,
        resource: resourceType,
        resourceType,
        resourceId,
        details: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.json({
      success: true,
      message: 'Activity recorded successfully',
      activity: {
        id: activity.id,
        userId: activity.mobileUserId,
        action: activity.action,
        resourceType: activity.resourceType,
        resourceId: activity.resourceId,
        createdAt: activity.createdAt
      }
    });

  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record activity'
    });
  }
});

// Track Download
app.post('/api/mobile/downloads/track', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const {
      mobileUserId,
      resourceId,
      resourceType,
      fileUrl
    } = req.body;

    // Validate required fields
    if (!resourceId || !resourceType || !fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        message: 'ResourceId, resourceType, and fileUrl are required'
      });
    }

    // Create download record
    const download = await prisma.mobileDownload.create({
      data: {
        mobileUserId: userId,
        resourceType,
        resourceId,
        fileUrl
      }
    });

    res.json({
      success: true,
      message: 'Download tracked successfully',
      data: {
        id: download.id,
        resourceId: download.resourceId,
        resourceType: download.resourceType,
        downloadedAt: download.downloadedAt
      }
    });

  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track download'
    });
  }
});

// Like Content
app.post('/api/mobile/likes', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const {
      resourceType,
      resourceId
    } = req.body;

    // Validate required fields
    if (!resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        message: 'ResourceType and resourceId are required'
      });
    }

    // Check if already liked
    const existingLike = await prisma.mobileLike.findFirst({
      where: {
        mobileUserId: userId,
        resourceType,
        resourceId
      }
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'Content already liked'
      });
    }

    // Create like record
    const like = await prisma.mobileLike.create({
      data: {
        mobileUserId: userId,
        resourceType,
        resourceId
      }
    });

    res.json({
      success: true,
      message: 'Content liked successfully',
      data: {
        id: like.id,
        resourceType: like.resourceType,
        resourceId: like.resourceId,
        likedAt: like.likedAt
      }
    });

  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like content'
    });
  }
});

// ============================================
// BUSINESS PROFILE ENDPOINTS - PHASE 1 BATCH 2
// ============================================

// Create Business Profile
app.post('/api/mobile/business-profile', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const {
      businessName,
      ownerName,
      email,
      phone,
      alternatePhone,
      address,
      category,
      logo,
      description,
      website,
      socialMedia
    } = req.body;

    if (!businessName || !ownerName || !email || !phone || !category) {
      return res.status(400).json({
        success: false,
        error: 'Business name, owner name, email, phone, and category are required'
      });
    }

    // Verify the mobile user exists before creating profile
    const mobileUser = await prisma.mobileUser.findUnique({
      where: { id: userId }
    });

    if (!mobileUser) {
      return res.status(404).json({
        success: false,
        error: 'Mobile user not found. Please ensure you are logged in with a valid account.'
      });
    }

    // Create business profile
    const businessProfile = await prisma.businessProfile.create({
      data: {
        mobileUserId: userId,
        businessName,
        businessEmail: email,
        businessPhone: phone,
        alternatePhone: alternatePhone || '',
        businessAddress: address || '',
        businessCategory: category,
        businessLogo: logo || '',
        businessDescription: description || '',
        businessWebsite: website || ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Business profile created successfully',
      data: {
        id: businessProfile.id,
        name: businessProfile.businessName,
        description: businessProfile.businessDescription || "",
        category: businessProfile.businessCategory || "",
        address: businessProfile.businessAddress || "",
        phone: businessProfile.businessPhone || "",
        alternatePhone: businessProfile.alternatePhone || "",
        email: businessProfile.businessEmail || "",
        website: businessProfile.businessWebsite || "",
        logo: businessProfile.businessLogo || "",
        createdAt: businessProfile.createdAt
      }
    });

  } catch (error) {
    console.error('Create business profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create business profile'
    });
  }
});

// Get All Business Profiles
app.get('/api/mobile/business-profile', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (category) where.businessCategory = category;
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { businessDescription: { contains: search } }
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        select: {
          id: true,
          businessName: true,
          businessCategory: true,
          businessLogo: true,
          businessDescription: true,
          businessPhone: true,
          businessEmail: true,
          businessAddress: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.businessProfile.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        profiles: profiles.map(p => ({
          id: p.id,
          businessName: p.businessName,
          category: p.businessCategory,
          logo: p.businessLogo,
          description: p.businessDescription,
          phone: p.businessPhone,
          email: p.businessEmail,
          address: p.businessAddress,
          createdAt: p.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get business profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business profiles'
    });
  }
});

// Get User's Business Profiles
app.get('/api/mobile/business-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profiles = await prisma.businessProfile.findMany({
      where: { mobileUserId: userId },
      select: {
        id: true,
        businessName: true,
        businessCategory: true,
        businessLogo: true,
        businessDescription: true,
        businessAddress: true,
        businessPhone: true,
        alternatePhone: true,
        businessEmail: true,
        businessWebsite: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        profiles: profiles.map(p => ({
          id: p.id,
          name: p.businessName,
          description: p.businessDescription || "",
          category: p.businessCategory || "",
          address: p.businessAddress || "",
          phone: p.businessPhone || "",
          alternatePhone: p.alternatePhone || "",
          email: p.businessEmail || "",
          website: p.businessWebsite || "",
          logo: p.businessLogo || "",
          createdAt: p.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get user business profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user business profiles'
    });
  }
});

// Update Business Profile
app.put('/api/mobile/business-profile/:id', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { id } = req.params;
    const {
      businessName,
      email,
      phone,
      alternatePhone,
      address,
      category,
      logo,
      description,
      website,
      socialMedia
    } = req.body;

    // Check if profile exists and belongs to user
    const existingProfile = await prisma.businessProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found'
      });
    }

    if (existingProfile.mobileUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this profile'
      });
    }

    // Update profile
    const updatedProfile = await prisma.businessProfile.update({
      where: { id },
      data: {
        businessName: businessName || undefined,
        businessEmail: email || undefined,
        businessPhone: phone || undefined,
        alternatePhone: alternatePhone || undefined,
        businessAddress: address || undefined,
        businessCategory: category || undefined,
        businessLogo: logo || undefined,
        businessDescription: description || undefined,
        businessWebsite: website || undefined
      }
    });

    res.json({
      success: true,
      message: 'Business profile updated successfully',
      data: {
        id: updatedProfile.id,
        name: updatedProfile.businessName,
        description: updatedProfile.businessDescription || "",
        category: updatedProfile.businessCategory || "",
        address: updatedProfile.businessAddress || "",
        phone: updatedProfile.businessPhone || "",
        alternatePhone: updatedProfile.alternatePhone || "",
        email: updatedProfile.businessEmail || "",
        website: updatedProfile.businessWebsite || "",
        logo: updatedProfile.businessLogo || "",
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });

  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business profile'
    });
  }
});

// Mobile Subscription Plans API
app.get('/api/mobile/subscriptions/plans', async (req, res) => {
  try {
    // Return available subscription plans
    const plans = [
      {
        id: 'monthly_pro',
        name: 'Monthly Pro',
        description: 'Monthly subscription with premium features',
        price: 299,
        originalPrice: 499,
        currency: 'INR',
        duration: 'monthly',
        savings: '40% OFF',
        features: [
          'Unlimited downloads',
          'Premium templates',
          'No watermark',
          'Priority support'
        ],
        isPopular: false
      },
      {
        id: 'yearly_pro',
        name: 'Yearly Pro',
        description: 'Yearly subscription with premium features and savings',
        price: 1999,
        originalPrice: 5988,
        currency: 'INR',
        duration: 'yearly',
        savings: '67% OFF',
        features: [
          'Unlimited downloads',
          'Premium templates',
          'No watermark',
          'Priority support',
          'Save 45%'
        ],
        isPopular: true
      }
    ];

    res.json({
      success: true,
      data: {
        plans: plans
      }
    });

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

// Mobile Subscriptions Status API
app.get('/api/mobile/subscriptions/status', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
      console.log('✅ User ID extracted from JWT:', userId);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find user by userId
    const user = await prisma.mobileUser.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check for active subscriptions
    const activeSubscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      orderBy: {
        endDate: 'desc'
      }
    });

    // Check for any subscriptions (active or expired)
    const allSubscriptions = await prisma.mobileSubscription.findMany({
      where: {
        mobileUserId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Determine subscription status
    let subscriptionStatus = 'INACTIVE';
    let currentSubscription = null;
    let daysRemaining = 0;

    if (activeSubscription) {
      subscriptionStatus = 'ACTIVE';
      currentSubscription = activeSubscription;
      const now = new Date();
      const endDate = new Date(activeSubscription.endDate);
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (allSubscriptions.length > 0) {
      // Check if there's an expired subscription
      const lastSubscription = allSubscriptions[0];
      const now = new Date();
      const endDate = new Date(lastSubscription.endDate);
      
      if (endDate < now) {
        subscriptionStatus = 'EXPIRED';
        currentSubscription = lastSubscription;
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    res.json({
      success: true,
      data: {
        isActive: subscriptionStatus === 'ACTIVE',
        plan: currentSubscription?.planId || null,
        planName: currentSubscription?.plan || null,
        status: subscriptionStatus.toLowerCase(),
        startDate: currentSubscription?.startDate || null,
        endDate: currentSubscription?.endDate || null,
        expiryDate: currentSubscription?.endDate || null,
        daysRemaining: daysRemaining,
        autoRenew: currentSubscription?.autoRenew || false
      }
    });

  } catch (error) {
    console.error('Mobile subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status'
    });
  }
});

// ============================================
// SUBSCRIPTION ACTIONS - PHASE 1 BATCH 3
// ============================================

// Subscribe to Plan
app.post('/api/mobile/subscriptions/subscribe', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { planId, paymentMethod = 'razorpay', autoRenew = true } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    // Validate plan
    const validPlans = {
      'monthly_pro': { price: 299, period: 'month' },
      'yearly_pro': { price: 1999, period: 'year' }
    };

    if (!validPlans[planId]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    const plan = validPlans[planId];

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.period === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create subscription
    const subscription = await prisma.mobileSubscription.create({
      data: {
        mobileUserId: userId,
        plan: planId === 'monthly_pro' ? 'Monthly Pro' : 'Yearly Pro',
        planId: planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        amount: plan.price,
        paymentId: `pay_${Date.now()}`,
        paymentMethod,
        autoRenew
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        planId: subscription.planId,
        planName: planId === 'monthly_pro' ? 'Monthly Pro' : 'Yearly Pro',
        status: 'active',
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// Renew Subscription
app.post('/api/mobile/subscriptions/renew', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find active subscription
    const subscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: userId,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Extend subscription by the same period
    const newEndDate = new Date(subscription.endDate);
    if (subscription.planId === 'monthly_pro') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else if (subscription.planId === 'yearly_pro') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Update subscription
    const updatedSubscription = await prisma.mobileSubscription.update({
      where: { id: subscription.id },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE'
      }
    });

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: {
        endDate: updatedSubscription.endDate
      }
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to renew subscription'
    });
  }
});

// Cancel Subscription
app.post('/api/mobile/subscriptions/cancel', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find active subscription
    const subscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: userId,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Cancel subscription
    await prisma.mobileSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false
      }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// ============================================
// TEMPLATE MANAGEMENT - PHASE 2 BATCH 1
// ============================================

// Get Templates with Filters
app.get('/api/mobile/templates', async (req, res) => {
  try {
    const { 
      category, 
      language = 'hindi', 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (category) where.category = category;
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [templates, total] = await Promise.all([
      prisma.mobileTemplate.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          language: true,
          thumbnailUrl: true,
          downloadUrl: true,
          fileSize: true,
          duration: true,
          isPremium: true,
          downloadCount: true,
          likeCount: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy
      }),
      prisma.template.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        templates: templates.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          language: t.language,
          thumbnailUrl: t.thumbnailUrl,
          downloadUrl: t.downloadUrl,
          fileSize: t.fileSize,
          duration: t.duration,
          isPremium: t.isPremium,
          downloadCount: t.downloadCount,
          likeCount: t.likeCount,
          createdAt: t.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Get Template Languages (must be before /:id route)
app.get('/api/mobile/templates/languages', async (req, res) => {
  try {
    const languages = [
      {
        code: "en",
        name: "English",
        nativeName: "English"
      },
      {
        code: "hi",
        name: "Hindi",
        nativeName: "हिन्दी"
      },
      {
        code: "ta",
        name: "Tamil",
        nativeName: "தமிழ்"
      },
      {
        code: "te",
        name: "Telugu",
        nativeName: "తెలుగు"
      },
      {
        code: "bn",
        name: "Bengali",
        nativeName: "বাংলা"
      },
      {
        code: "gu",
        name: "Gujarati",
        nativeName: "ગુજરાતી"
      },
      {
        code: "mr",
        name: "Marathi",
        nativeName: "मराठी"
      },
      {
        code: "pa",
        name: "Punjabi",
        nativeName: "ਪੰਜਾਬੀ"
      }
    ];

    res.json({
      success: true,
      data: languages,
      message: 'Languages fetched successfully'
    });

  } catch (error) {
    console.error('Get template languages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template languages'
    });
  }
});

// Get Template Categories (must be before /:id route)
app.get('/api/mobile/templates/categories', async (req, res) => {
  try {
    const categories = [
      { id: '1', name: 'Business', icon: '💼', count: 85 },
      { id: '2', name: 'Real Estate', icon: '🏠', count: 62 },
      { id: '3', name: 'Restaurant', icon: '🍽️', count: 48 },
      { id: '4', name: 'Salon & Spa', icon: '💅', count: 55 },
      { id: '5', name: 'Fitness', icon: '💪', count: 40 },
      { id: '6', name: 'Education', icon: '📚', count: 70 },
      { id: '7', name: 'Medical', icon: '⚕️', count: 45 },
      { id: '8', name: 'Retail', icon: '🛍️', count: 90 }
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get template categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template categories'
    });
  }
});

// Get Template by ID
app.get('/api/mobile/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.mobileTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            downloads: true,
            likes: true
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        language: template.language,
        thumbnailUrl: template.thumbnailUrl,
        downloadUrl: template.downloadUrl,
        fileSize: template.fileSize,
        duration: template.duration,
        isPremium: template.isPremium,
        downloadCount: template._count.downloads,
        likeCount: template._count.likes,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });

  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
});

// Download Template
app.post('/api/mobile/templates/:id/download', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { id } = req.params;

    // Check if template exists
    const template = await prisma.mobileTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if user has already downloaded this template
    const existingDownload = await prisma.mobileDownload.findFirst({
      where: {
        mobileUserId: userId,
        resourceType: 'TEMPLATE',
        resourceId: id
      }
    });

    if (existingDownload) {
      return res.json({
        success: true,
        message: 'Template already downloaded',
        data: {
          downloadUrl: template.downloadUrl,
          downloadId: existingDownload.id
        }
      });
    }

    // Create download record
    const download = await prisma.mobileDownload.create({
      data: {
        mobileUserId: userId,
        resourceType: 'TEMPLATE',
        resourceId: id,
        resourceTitle: template.title,
        downloadUrl: template.downloadUrl
      }
    });

    // Increment download count
    await prisma.template.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    res.json({
      success: true,
      message: 'Template download initiated',
      data: {
        downloadId: download.id,
        downloadUrl: template.downloadUrl,
        fileSize: template.fileSize,
        title: template.title
      }
    });

  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download template'
    });
  }
});

// Like/Unlike Template
app.post('/api/mobile/templates/:id/like', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { id } = req.params;

    // Check if template exists
    const template = await prisma.mobileTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if user has already liked this template
    const existingLike = await prisma.mobileLike.findFirst({
      where: {
        mobileUserId: userId,
        resourceType: 'TEMPLATE',
        resourceId: id
      }
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.mobileLike.delete({
        where: { id: existingLike.id }
      });

      // Decrement like count
      await prisma.template.update({
        where: { id },
        data: {
          likeCount: { decrement: 1 }
        }
      });

      res.json({
        success: true,
        message: 'Template unliked',
        data: {
          liked: false,
          likeCount: template.likeCount - 1
        }
      });
    } else {
      // Like - create new like
      await prisma.mobileLike.create({
        data: {
          mobileUserId: userId,
          resourceType: 'TEMPLATE',
          resourceId: id,
          resourceTitle: template.title
        }
      });

      // Increment like count
      await prisma.template.update({
        where: { id },
        data: {
          likeCount: { increment: 1 }
        }
      });

      res.json({
        success: true,
        message: 'Template liked',
        data: {
          liked: true,
          likeCount: template.likeCount + 1
        }
      });
    }

  } catch (error) {
    console.error('Like template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like template'
    });
  }
});

// ============================================
// GREETING MANAGEMENT - PHASE 2 BATCH 2
// ============================================

// Get Greetings with Filters
app.get('/api/mobile/greetings', async (req, res) => {
  try {
    const { 
      category, 
      language = 'hindi', 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (category) where.category = category;
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [greetings, total] = await Promise.all([
      prisma.greetingTemplate.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          language: true,
          thumbnailUrl: true,
          downloadUrl: true,
          fileSize: true,
          duration: true,
          isPremium: true,
          downloadCount: true,
          likeCount: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy
      }),
      prisma.greeting.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        greetings: greetings.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          category: g.category,
          language: g.language,
          thumbnailUrl: g.thumbnailUrl,
          downloadUrl: g.downloadUrl,
          fileSize: g.fileSize,
          duration: g.duration,
          isPremium: g.isPremium,
          downloadCount: g.downloadCount,
          likeCount: g.likeCount,
          createdAt: g.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get greetings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch greetings'
    });
  }
});

// Get Greeting Categories (must be before /:id route)
app.get('/api/mobile/greetings/categories', async (req, res) => {
  try {
    const categories = [
      { id: '1', name: 'Good Morning', icon: '🌅', count: 45 },
      { id: '2', name: 'Good Evening', icon: '🌆', count: 38 },
      { id: '3', name: 'Festival', icon: '🎊', count: 120 },
      { id: '4', name: 'Birthday', icon: '🎂', count: 65 },
      { id: '5', name: 'Wedding', icon: '💒', count: 55 },
      { id: '6', name: 'Thank You', icon: '🙏', count: 30 },
      { id: '7', name: 'Congratulations', icon: '🎉', count: 42 }
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get greeting categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch greeting categories'
    });
  }
});

// Get Greeting by ID
app.get('/api/mobile/greetings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const greeting = await prisma.greeting.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            downloads: true,
            likes: true
          }
        }
      }
    });

    if (!greeting) {
      return res.status(404).json({
        success: false,
        error: 'Greeting not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: greeting.id,
        title: greeting.title,
        description: greeting.description,
        category: greeting.category,
        language: greeting.language,
        thumbnailUrl: greeting.thumbnailUrl,
        downloadUrl: greeting.downloadUrl,
        fileSize: greeting.fileSize,
        duration: greeting.duration,
        isPremium: greeting.isPremium,
        downloadCount: greeting._count.downloads,
        likeCount: greeting._count.likes,
        createdAt: greeting.createdAt,
        updatedAt: greeting.updatedAt
      }
    });

  } catch (error) {
    console.error('Get greeting by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch greeting'
    });
  }
});

// Download Greeting
app.post('/api/mobile/greetings/:id/download', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { id } = req.params;

    // Check if greeting exists
    const greeting = await prisma.greeting.findUnique({
      where: { id }
    });

    if (!greeting) {
      return res.status(404).json({
        success: false,
        error: 'Greeting not found'
      });
    }

    // Check if user has already downloaded this greeting
    const existingDownload = await prisma.mobileDownload.findFirst({
      where: {
        mobileUserId: userId,
        resourceType: 'GREETING',
        resourceId: id
      }
    });

    if (existingDownload) {
      return res.json({
        success: true,
        message: 'Greeting already downloaded',
        data: {
          downloadUrl: greeting.downloadUrl,
          downloadId: existingDownload.id
        }
      });
    }

    // Create download record
    const download = await prisma.mobileDownload.create({
      data: {
        mobileUserId: userId,
        resourceType: 'GREETING',
        resourceId: id,
        resourceTitle: greeting.title,
        downloadUrl: greeting.downloadUrl
      }
    });

    // Increment download count
    await prisma.greeting.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    res.json({
      success: true,
      message: 'Greeting download initiated',
      data: {
        downloadId: download.id,
        downloadUrl: greeting.downloadUrl,
        fileSize: greeting.fileSize,
        title: greeting.title
      }
    });

  } catch (error) {
    console.error('Download greeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download greeting'
    });
  }
});

// Like/Unlike Greeting
app.post('/api/mobile/greetings/:id/like', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { id } = req.params;

    // Check if greeting exists
    const greeting = await prisma.greeting.findUnique({
      where: { id }
    });

    if (!greeting) {
      return res.status(404).json({
        success: false,
        error: 'Greeting not found'
      });
    }

    // Check if user has already liked this greeting
    const existingLike = await prisma.mobileLike.findFirst({
      where: {
        mobileUserId: userId,
        resourceType: 'GREETING',
        resourceId: id
      }
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.mobileLike.delete({
        where: { id: existingLike.id }
      });

      // Decrement like count
      await prisma.greeting.update({
        where: { id },
        data: {
          likeCount: { decrement: 1 }
        }
      });

      res.json({
        success: true,
        message: 'Greeting unliked',
        data: {
          liked: false,
          likeCount: greeting.likeCount - 1
        }
      });
    } else {
      // Like - create new like
      await prisma.mobileLike.create({
        data: {
          mobileUserId: userId,
          resourceType: 'GREETING',
          resourceId: id,
          resourceTitle: greeting.title
        }
      });

      // Increment like count
      await prisma.greeting.update({
        where: { id },
        data: {
          likeCount: { increment: 1 }
        }
      });

      res.json({
        success: true,
        message: 'Greeting liked',
        data: {
          liked: true,
          likeCount: greeting.likeCount + 1
        }
      });
    }

  } catch (error) {
    console.error('Like greeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like greeting'
    });
  }
});

// ============================================
// USER ANALYTICS - PHASE 3 BATCH 1
// ============================================

// Get User Downloads
app.get('/api/mobile/users/:id/downloads', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { mobileUserId: id };
    if (type) where.resourceType = type.toUpperCase();

    const [downloads, total] = await Promise.all([
      prisma.mobileDownload.findMany({
        where,
        select: {
          id: true,
          resourceType: true,
          resourceId: true,
          fileUrl: true,
          downloadedAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { downloadedAt: 'desc' }
      }),
      prisma.mobileDownload.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        downloads: downloads.map(d => ({
          id: d.id,
          type: d.resourceType,
          resourceId: d.resourceId,
          title: `Resource ${d.resourceId}`,
          downloadUrl: d.fileUrl,
          downloadedAt: d.downloadedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get user downloads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user downloads'
    });
  }
});

// Get User Likes
app.get('/api/mobile/users/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { mobileUserId: id };
    if (type) where.resourceType = type.toUpperCase();

    const [likes, total] = await Promise.all([
      prisma.mobileLike.findMany({
        where,
        select: {
          id: true,
          resourceType: true,
          resourceId: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mobileLike.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        likes: likes.map(l => ({
          id: l.id,
          type: l.resourceType,
          resourceId: l.resourceId,
          title: `Resource ${l.resourceId}`,
          likedAt: l.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user likes'
    });
  }
});

// Get User Activity
app.get('/api/mobile/users/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { mobileUserId: id };
    if (action) where.action = action.toUpperCase();

    const [activities, total] = await Promise.all([
      prisma.mobileActivity.findMany({
        where,
        select: {
          id: true,
          action: true,
          resourceType: true,
          resourceId: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mobileActivity.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        activities: activities.map(a => ({
          id: a.id,
          action: a.action,
          resourceType: a.resourceType,
          resourceId: a.resourceId,
          timestamp: a.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity'
    });
  }
});

// Get User Statistics
app.get('/api/mobile/users/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const [
      downloadCount,
      likeCount,
      subscriptionCount,
      businessProfileCount,
      lastActivity
    ] = await Promise.all([
      prisma.mobileDownload.count({ where: { mobileUserId: id } }),
      prisma.mobileLike.count({ where: { mobileUserId: id } }),
      prisma.mobileSubscription.count({ where: { mobileUserId: id } }),
      prisma.businessProfile.count({ where: { mobileUserId: id } }),
      prisma.mobileActivity.findFirst({
        where: { mobileUserId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    // Get user info
    const user = await prisma.mobileUser.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        createdAt: true,
        lastActiveAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          joinedAt: user.createdAt,
          lastActiveAt: user.lastActiveAt
        },
        stats: {
          totalDownloads: downloadCount,
          totalLikes: likeCount,
          totalSubscriptions: subscriptionCount,
          businessProfiles: businessProfileCount,
          lastActivityAt: lastActivity?.createdAt || null
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

// ============================================
// CONTENT MANAGEMENT - PHASE 3 BATCH 2
// ============================================

// Get All Content (Templates + Greetings)
app.get('/api/mobile/content', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      language = 'hindi', 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let content = [];
    let total = 0;

    if (!type || type === 'all') {
      // Get both templates and greetings
      const [templates, greetings, templateCount, greetingCount] = await Promise.all([
        prisma.mobileTemplate.findMany({
          where: {
            ...(category && { category }),
            ...(language && { language }),
            ...(search && {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } }
              ]
            })
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            language: true,
            thumbnailUrl: true,
            fileUrl: true,
            isPremium: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.greetingTemplate.findMany({
          where: {
            ...(category && { category }),
            ...(search && {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } }
              ]
            })
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.mobileTemplate.count({
          where: {
            ...(category && { category }),
            ...(language && { language }),
            ...(search && {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } }
              ]
            })
          }
        }),
        prisma.greetingTemplate.count({
          where: {
            ...(category && { category }),
            ...(search && {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } }
              ]
            })
          }
        })
      ]);

      content = [
        ...templates.map(t => ({ ...t, type: 'template' })),
        ...greetings.map(g => ({ ...g, type: 'greeting' }))
      ].sort((a, b) => {
        if (sortOrder === 'desc') {
          return new Date(b[sortBy]) - new Date(a[sortBy]);
        } else {
          return new Date(a[sortBy]) - new Date(b[sortBy]);
        }
      });

      total = templateCount + greetingCount;
    } else if (type === 'template') {
      const where = {};
      if (category) where.category = category;
      if (language) where.language = language;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const [templates, templateCount] = await Promise.all([
        prisma.mobileTemplate.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            language: true,
            thumbnailUrl: true,
            fileUrl: true,
            isPremium: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.mobileTemplate.count({ where })
      ]);

      content = templates.map(t => ({ ...t, type: 'template' }));
      total = templateCount;
    } else if (type === 'greeting') {
      const where = {};
      if (category) where.category = category;
      if (language) where.language = language;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const [greetings, greetingCount] = await Promise.all([
        prisma.greetingTemplate.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            language: true,
            thumbnailUrl: true,
            fileUrl: true,
            isPremium: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.greetingTemplate.count({ where })
      ]);

      content = greetings.map(g => ({ ...g, type: 'greeting' }));
      total = greetingCount;
    }

    res.json({
      success: true,
      data: {
        content: content.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          language: item.language,
          thumbnailUrl: item.thumbnailUrl,
          downloadUrl: item.fileUrl,
          fileSize: null,
          duration: null,
          isPremium: item.isPremium,
          downloadCount: item.downloads,
          likeCount: item.likes,
          createdAt: item.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    });
  }
});

// Search Content
app.get('/api/mobile/content/search', async (req, res) => {
  try {
    const { 
      q, 
      type = 'all', 
      category, 
      language = 'hindi',
      page = 1, 
      limit = 20 
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let results = [];
    let total = 0;

    const templateSearchWhere = {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } }
      ],
      ...(category && { category }),
      ...(language && { language })
    };

    const greetingSearchWhere = {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } }
      ],
      ...(category && { category })
    };

    if (type === 'all' || type === 'template') {
      const [templates, templateCount] = await Promise.all([
        prisma.mobileTemplate.findMany({
          where: templateSearchWhere,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            language: true,
            thumbnailUrl: true,
            fileUrl: true,
            isPremium: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.mobileTemplate.count({ where: templateSearchWhere })
      ]);

      results = [...results, ...templates.map(t => ({ ...t, type: 'template' }))];
      total += templateCount;
    }

    if (type === 'all' || type === 'greeting') {
      const [greetings, greetingCount] = await Promise.all([
        prisma.greetingTemplate.findMany({
          where: greetingSearchWhere,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.greetingTemplate.count({ where: greetingSearchWhere })
      ]);

      results = [...results, ...greetings.map(g => ({ ...g, type: 'greeting' }))];
      total += greetingCount;
    }

    // Sort by relevance (title matches first, then description)
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(q.toLowerCase());
      const bTitleMatch = b.title.toLowerCase().includes(q.toLowerCase());
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      data: {
        query: q,
        results: results.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          language: item.language,
          thumbnailUrl: item.thumbnailUrl,
          downloadUrl: item.fileUrl,
          fileSize: null,
          duration: null,
          isPremium: item.isPremium,
          downloadCount: item.downloads,
          likeCount: item.likes,
          createdAt: item.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search content'
    });
  }
});

// Get Trending Content
app.get('/api/mobile/content/trending', async (req, res) => {
  try {
    const { 
      type = 'all', 
      category, 
      language = 'hindi',
      limit = 20 
    } = req.query;

    let trending = [];

    if (type === 'all' || type === 'template') {
      const templates = await prisma.mobileTemplate.findMany({
        where: {
          ...(category && { category }),
          ...(language && { language })
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          language: true,
          thumbnailUrl: true,
          fileUrl: true,
          isPremium: true,
          downloads: true,
          likes: true,
          createdAt: true
        },
        orderBy: [
          { downloads: 'desc' },
          { likes: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit)
      });

      trending = [...trending, ...templates.map(t => ({ ...t, type: 'template' }))];
    }

    if (type === 'all' || type === 'greeting') {
      const greetings = await prisma.greetingTemplate.findMany({
        where: {
          ...(category && { category })
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          imageUrl: true,
          downloads: true,
          likes: true,
          createdAt: true
        },
        orderBy: [
          { downloads: 'desc' },
          { likes: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit)
      });

      trending = [...trending, ...greetings.map(g => ({ ...g, type: 'greeting' }))];
    }

    // Sort by combined popularity score
    trending.sort((a, b) => {
      const aScore = (a.downloads || 0) + (a.likes || 0);
      const bScore = (b.downloads || 0) + (b.likes || 0);
      return bScore - aScore;
    });

    res.json({
      success: true,
      data: {
        trending: trending.slice(0, parseInt(limit)).map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          language: item.language,
          thumbnailUrl: item.thumbnailUrl,
          downloadUrl: item.fileUrl,
          fileSize: null,
          duration: null,
          isPremium: item.isPremium,
          downloadCount: item.downloads,
          likeCount: item.likes,
          createdAt: item.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending content'
    });
  }
});

// Get Content by Category
app.get('/api/mobile/content/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { 
      type = 'all', 
      language = 'hindi',
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let content = [];
    let total = 0;

    const templateWhere = { category, ...(language && { language }) };
    const greetingWhere = { category };

    if (type === 'all' || type === 'template') {
      const [templates, templateCount] = await Promise.all([
        prisma.mobileTemplate.findMany({
          where: templateWhere,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            language: true,
            thumbnailUrl: true,
            fileUrl: true,
            isPremium: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.mobileTemplate.count({ where: templateWhere })
      ]);

      content = [...content, ...templates.map(t => ({ ...t, type: 'template' }))];
      total += templateCount;
    }

    if (type === 'all' || type === 'greeting') {
      const [greetings, greetingCount] = await Promise.all([
        prisma.greetingTemplate.findMany({
          where: greetingWhere,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            downloads: true,
            likes: true,
            createdAt: true
          },
          skip,
          take: parseInt(limit),
        orderBy: sortBy === 'downloadCount' ? { downloads: sortOrder } : 
                 sortBy === 'likeCount' ? { likes: sortOrder } : 
                 { createdAt: sortOrder }
        }),
        prisma.greetingTemplate.count({ where: greetingWhere })
      ]);

      content = [...content, ...greetings.map(g => ({ ...g, type: 'greeting' }))];
      total += greetingCount;
    }

    res.json({
      success: true,
      data: {
        category,
        content: content.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          language: item.language,
          thumbnailUrl: item.thumbnailUrl,
          downloadUrl: item.fileUrl,
          fileSize: null,
          duration: null,
          isPremium: item.isPremium,
          downloadCount: item.downloads,
          likeCount: item.likes,
          createdAt: item.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: total > 0 ? Math.ceil(total / parseInt(limit)) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get content by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content by category'
    });
  }
});

// ============================================
// ENDPOINT 1: HOME FEATURED CONTENT
// ============================================
app.get('/api/mobile/home/featured', async (req, res) => {
  try {
    // Return featured content collections
    const featuredContent = [
      {
        id: '1',
        title: 'Business Templates Collection',
        description: 'Professional templates for your business needs',
        imageUrl: '/uploads/featured/business-templates.jpg',
        type: 'templates',
        itemCount: 50,
        category: 'business'
      },
      {
        id: '2',
        title: 'Festival Special',
        description: 'Celebrate festivals with beautiful designs',
        imageUrl: '/uploads/featured/festivals.jpg',
        type: 'posters',
        itemCount: 120,
        category: 'festival'
      },
      {
        id: '3',
        title: 'Wedding Season',
        description: 'Perfect designs for wedding celebrations',
        imageUrl: '/uploads/featured/wedding.jpg',
        type: 'greetings',
        itemCount: 75,
        category: 'wedding'
      }
    ];

    res.json({
      success: true,
      data: {
        featured: featuredContent,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get featured content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured content'
    });
  }
});



// ============================================
// PHASE 4: SUBSCRIPTIONS & TRACKING (13 APIs)
// ============================================

// ENDPOINT 7: SUBSCRIPTION USAGE ANALYTICS
// ============================================
app.get('/api/mobile/subscriptions/usage', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Get current subscription
    const activeSubscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() }
      }
    });

    if (!activeSubscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Get usage statistics
    const [downloads, likes, activities] = await Promise.all([
      prisma.mobileDownload.count({
        where: {
          mobileUserId: userId,
          downloadedAt: { gte: activeSubscription.startDate }
        }
      }),
      prisma.mobileLike.count({
        where: {
          mobileUserId: userId,
          createdAt: { gte: activeSubscription.startDate }
        }
      }),
      prisma.mobileActivity.count({
        where: {
          mobileUserId: userId,
          createdAt: { gte: activeSubscription.startDate }
        }
      })
    ]);

    // Calculate usage limits based on plan
    const planLimits = {
      monthly_pro: { downloads: 1000, likes: 500, activities: 2000 },
      yearly_pro: { downloads: 10000, likes: 5000, activities: 20000 }
    };

    const limits = planLimits[activeSubscription.planId] || planLimits.monthly_pro;

    res.json({
      success: true,
      data: {
        subscription: {
          plan: activeSubscription.plan,
          planId: activeSubscription.planId,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate
        },
        usage: {
          downloads: {
            used: downloads,
            limit: limits.downloads,
            remaining: Math.max(0, limits.downloads - downloads),
            percentage: Math.round((downloads / limits.downloads) * 100)
          },
          likes: {
            used: likes,
            limit: limits.likes,
            remaining: Math.max(0, limits.likes - likes),
            percentage: Math.round((likes / limits.likes) * 100)
          },
          activities: {
            used: activities,
            limit: limits.activities,
            remaining: Math.max(0, limits.activities - activities),
            percentage: Math.round((activities / limits.activities) * 100)
          }
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get subscription usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription usage'
    });
  }
});

// ENDPOINT 8: BILLING INFORMATION
// ============================================
app.get('/api/mobile/subscriptions/billing', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Get billing information
    const [subscriptions, transactions] = await Promise.all([
      prisma.mobileSubscription.findMany({
        where: { mobileUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.mobileTransaction.findMany({
        where: { mobileUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const totalSpent = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const currentSubscription = subscriptions.find(sub => 
      sub.status === 'ACTIVE' && sub.endDate > new Date()
    );

    res.json({
      success: true,
      data: {
        currentSubscription: currentSubscription ? {
          plan: currentSubscription.plan,
          planId: currentSubscription.planId,
          amount: currentSubscription.amount,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          autoRenew: currentSubscription.autoRenew,
          paymentMethod: currentSubscription.paymentMethod
        } : null,
        billing: {
          totalSpent,
          totalSubscriptions: subscriptions.length,
          nextBillingDate: currentSubscription?.endDate || null,
          currency: 'INR'
        },
        recentTransactions: transactions.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          paymentMethod: tx.paymentMethod,
          createdAt: tx.createdAt
        })),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get billing information error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch billing information'
    });
  }
});

// ENDPOINT 9: UPGRADE SUBSCRIPTION
// ============================================
app.post('/api/mobile/subscriptions/upgrade', async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Find current subscription
    const currentSubscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() }
      }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Check if already on the requested plan
    if (currentSubscription.planId === planId) {
      return res.status(400).json({
        success: false,
        error: 'Already subscribed to this plan'
      });
    }

    // Define plan details
    const planDetails = {
      monthly_pro: { plan: 'Monthly Pro', amount: 299 },
      yearly_pro: { plan: 'Yearly Pro', amount: 2999 }
    };

    const newPlan = planDetails[planId];
    if (!newPlan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    // Calculate prorated amount (simplified)
    const daysRemaining = Math.ceil((currentSubscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
    const proratedAmount = Math.round((newPlan.amount * daysRemaining) / 365);

    // Create transaction record
    const transaction = await prisma.mobileTransaction.create({
      data: {
        mobileUserId: userId,
        amount: proratedAmount,
        currency: 'INR',
        paymentId: `upgrade_${Date.now()}`,
        paymentMethod: 'Razorpay',
        status: 'COMPLETED'
      }
    });

    // Update subscription
    const updatedSubscription = await prisma.mobileSubscription.update({
      where: { id: currentSubscription.id },
      data: {
        plan: newPlan.plan,
        planId: planId,
        amount: proratedAmount,
        paymentId: transaction.paymentId,
        paymentMethod: 'Razorpay'
      }
    });

    res.json({
      success: true,
      data: {
        subscription: {
          id: updatedSubscription.id,
          plan: updatedSubscription.plan,
          planId: updatedSubscription.planId,
          amount: updatedSubscription.amount,
          startDate: updatedSubscription.startDate,
          endDate: updatedSubscription.endDate
        },
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status
        },
        message: 'Subscription upgraded successfully'
      }
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade subscription'
    });
  }
});

// ENDPOINT 10: DOWNGRADE SUBSCRIPTION
// ============================================
app.post('/api/mobile/subscriptions/downgrade', async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Find current subscription
    const currentSubscription = await prisma.mobileSubscription.findFirst({
      where: {
        mobileUserId: userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() }
      }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Check if already on the requested plan
    if (currentSubscription.planId === planId) {
      return res.status(400).json({
        success: false,
        error: 'Already subscribed to this plan'
      });
    }

    // Define plan details
    const planDetails = {
      monthly_pro: { plan: 'Monthly Pro', amount: 299 },
      yearly_pro: { plan: 'Yearly Pro', amount: 2999 }
    };

    const newPlan = planDetails[planId];
    if (!newPlan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    // For downgrade, we'll apply the change at next billing cycle
    const updatedSubscription = await prisma.mobileSubscription.update({
      where: { id: currentSubscription.id },
      data: {
        plan: newPlan.plan,
        planId: planId,
        // Note: Amount will be updated at next billing cycle
      }
    });

    res.json({
      success: true,
      data: {
        subscription: {
          id: updatedSubscription.id,
          plan: updatedSubscription.plan,
          planId: updatedSubscription.planId,
          startDate: updatedSubscription.startDate,
          endDate: updatedSubscription.endDate
        },
        message: 'Subscription will be downgraded at next billing cycle'
      }
    });

  } catch (error) {
    console.error('Downgrade subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to downgrade subscription'
    });
  }
});

// ENDPOINT 11: GET TRANSACTION HISTORY
// ============================================
app.get('/api/mobile/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { mobileUserId: userId };
    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.mobileTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.mobileTransaction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          paymentId: tx.paymentId,
          paymentMethod: tx.paymentMethod,
          createdAt: tx.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// ENDPOINT 12: CREATE TRANSACTION RECORD
// ============================================
app.post('/api/mobile/transactions', async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentId, paymentMethod, status = 'PENDING' } = req.body;

    if (!amount || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Amount and payment ID are required'
      });
    }

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Create transaction
    const transaction = await prisma.mobileTransaction.create({
      data: {
        mobileUserId: userId,
        amount: parseFloat(amount),
        currency,
        paymentId,
        paymentMethod: paymentMethod || 'Razorpay',
        status
      }
    });

    res.status(201).json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentId: transaction.paymentId,
          paymentMethod: transaction.paymentMethod,
          createdAt: transaction.createdAt
        }
      },
      message: 'Transaction created successfully'
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

// ENDPOINT 13: DETAILED USAGE ANALYTICS
// ============================================
app.get('/api/mobile/analytics/usage', async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
    const userId = decoded.id;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get detailed analytics
    const [downloads, likes, activities, subscriptions] = await Promise.all([
      prisma.mobileDownload.findMany({
        where: {
          mobileUserId: userId,
          downloadedAt: { gte: startDate }
        },
        orderBy: { downloadedAt: 'desc' }
      }),
      prisma.mobileLike.findMany({
        where: {
          mobileUserId: userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mobileActivity.findMany({
        where: {
          mobileUserId: userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mobileSubscription.findMany({
        where: {
          mobileUserId: userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate daily usage
    const dailyUsage = {};
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyUsage[dateStr] = {
        downloads: 0,
        likes: 0,
        activities: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate daily usage
    downloads.forEach(download => {
      const dateStr = download.downloadedAt.toISOString().split('T')[0];
      if (dailyUsage[dateStr]) {
        dailyUsage[dateStr].downloads++;
      }
    });

    likes.forEach(like => {
      const dateStr = like.createdAt.toISOString().split('T')[0];
      if (dailyUsage[dateStr]) {
        dailyUsage[dateStr].likes++;
      }
    });

    activities.forEach(activity => {
      const dateStr = activity.createdAt.toISOString().split('T')[0];
      if (dailyUsage[dateStr]) {
        dailyUsage[dateStr].activities++;
      }
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate,
          end: now
        },
        summary: {
          totalDownloads: downloads.length,
          totalLikes: likes.length,
          totalActivities: activities.length,
          totalSubscriptions: subscriptions.length
        },
        dailyUsage: Object.entries(dailyUsage).map(([date, usage]) => ({
          date,
          downloads: usage.downloads,
          likes: usage.likes,
          activities: usage.activities
        })),
        recentActivity: {
          downloads: downloads.slice(0, 10).map(d => ({
            id: d.id,
            resourceType: d.resourceType,
            resourceId: d.resourceId,
            downloadedAt: d.downloadedAt
          })),
          likes: likes.slice(0, 10).map(l => ({
            id: l.id,
            resourceType: l.resourceType,
            resourceId: l.resourceId,
            createdAt: l.createdAt
          })),
          activities: activities.slice(0, 10).map(a => ({
            id: a.id,
            action: a.action,
            resource: a.resource,
            createdAt: a.createdAt
          }))
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get usage analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage analytics'
    });
  }
});

// ============================================
// ENDPOINT 4: SUBSCRIPTION HISTORY
// ============================================
app.get('/api/mobile/subscriptions/history', async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      userId = decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get subscription history
    const [subscriptions, total] = await Promise.all([
      prisma.mobileSubscription.findMany({
        where: { mobileUserId: userId },
        select: {
          id: true,
          planId: true,
          status: true,
          amount: true,
          startDate: true,
          endDate: true,
          paymentId: true,
          paymentMethod: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.mobileSubscription.count({ where: { mobileUserId: userId } })
    ]);

    const paymentHistory = subscriptions.map(subscription => ({
      id: subscription.id,
      plan: subscription.planId,
      status: subscription.status,
      amount: subscription.amount,
      currency: 'INR',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paymentId: subscription.paymentId || `pay_${subscription.id.slice(-8)}`,
      paymentMethod: subscription.paymentMethod || 'Razorpay',
      paidAt: subscription.createdAt,
      description: `${subscription.planId === 'monthly_pro' ? 'Monthly' : 'Yearly'} Pro Plan Subscription`,
      isActive: subscription.status === 'ACTIVE' && subscription.endDate > new Date()
    }));

    res.json({
      success: true,
      data: {
        payments: paymentHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalPayments: total,
          totalAmount: subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
          currency: 'INR'
        }
      }
    });

  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription history'
    });
  }
});

// ============================================
// PHASE 3 BATCH 3: MISSING ENDPOINTS FROM API DOCUMENTATION
// ============================================

// Get Business Categories
app.get('/api/mobile/business-categories', async (req, res) => {
  try {
    const categories = [
      {
        id: "1",
        name: "Restaurant",
        slug: "restaurant",
        description: "Food and dining business content",
        icon: "🍽️",
        color: "#FF6B6B",
        posterCount: 25,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Wedding Planning",
        slug: "wedding-planning",
        description: "Wedding and event planning content",
        icon: "💒",
        color: "#4ECDC4",
        posterCount: 18,
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Electronics",
        slug: "electronics",
        description: "Electronic products and gadgets",
        icon: "📱",
        color: "#45B7D1",
        posterCount: 32,
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Fashion",
        slug: "fashion",
        description: "Fashion and clothing business",
        icon: "👗",
        color: "#96CEB4",
        posterCount: 28,
        createdAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Healthcare",
        slug: "healthcare",
        description: "Medical and healthcare services",
        icon: "🏥",
        color: "#FFEAA7",
        posterCount: 15,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get business categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business categories'
    });
  }
});

// Get Upcoming Events
app.get('/api/mobile/home/upcoming-events', async (req, res) => {
  try {
    const { limit = 10, category, location, dateFrom, dateTo, isFree } = req.query;

    // Mock upcoming events data
    const events = [
      {
        id: "event_1",
        title: "Tech Conference 2024",
        description: "Annual technology conference featuring latest innovations",
        date: "2024-10-15",
        time: "09:00",
        location: "Mumbai Convention Center",
        organizer: "Tech Events India",
        organizerId: "org_1",
        imageUrl: "/api/placeholder/400/300",
        category: "Technology",
        price: 2500,
        isFree: false,
        attendees: 150,
        maxAttendees: 200,
        tags: ["technology", "conference", "innovation"],
        createdAt: new Date().toISOString()
      },
      {
        id: "event_2",
        title: "Food Festival 2024",
        description: "Celebrate diverse cuisines from around the world",
        date: "2024-10-20",
        time: "11:00",
        location: "Delhi Food Court",
        organizer: "Food Events Delhi",
        organizerId: "org_2",
        imageUrl: "/api/placeholder/400/300",
        category: "Food & Beverage",
        price: 0,
        isFree: true,
        attendees: 75,
        maxAttendees: 100,
        tags: ["food", "festival", "free"],
        createdAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredEvents = events;
    if (category) {
      filteredEvents = filteredEvents.filter(event => 
        event.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (location) {
      filteredEvents = filteredEvents.filter(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (isFree !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.isFree === (isFree === 'true')
      );
    }

    // Apply limit
    filteredEvents = filteredEvents.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredEvents,
      message: 'Upcoming events retrieved successfully'
    });

  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming events'
    });
  }
});

// Get Professional Templates
app.get('/api/mobile/home/templates', async (req, res) => {
  try {
    const { 
      limit = 10, 
      category, 
      subcategory, 
      isPremium, 
      sortBy = 'popular', 
      tags 
    } = req.query;

    // Get templates from database with filters
    const where = {};
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';

    const templates = await prisma.mobileTemplate.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        fileUrl: true,
        category: true,
        language: true,
        likes: true,
        downloads: true,
        isPremium: true,
        tags: true,
        createdAt: true
      },
      take: parseInt(limit),
      orderBy: sortBy === 'popular' ? { downloads: 'desc' } :
               sortBy === 'recent' ? { createdAt: 'desc' } :
               sortBy === 'likes' ? { likes: 'desc' } :
               { downloads: 'desc' }
    });

    res.json({
      success: true,
      data: templates.map(template => ({
        id: template.id,
        name: template.title,
        description: template.description,
        thumbnail: template.thumbnailUrl,
        previewUrl: template.fileUrl,
        category: template.category,
        subcategory: template.language,
        likes: template.likes,
        downloads: template.downloads,
        views: template.downloads + template.likes, // Mock views
        isLiked: false, // Would need user context
        isDownloaded: false, // Would need user context
        isPremium: template.isPremium,
        tags: template.tags ? template.tags.split(',') : [],
        fileSize: 1024000, // Mock file size
        createdAt: template.createdAt
      })),
      message: 'Templates retrieved successfully'
    });

  } catch (error) {
    console.error('Get professional templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch professional templates'
    });
  }
});

// Get Video Content
app.get('/api/mobile/home/video-content', async (req, res) => {
  try {
    const { 
      limit = 10, 
      category, 
      language = 'hindi', 
      isPremium, 
      sortBy = 'popular', 
      duration, 
      tags 
    } = req.query;

    // Mock video content data (since we don't have video templates in schema)
    const videos = [
      {
        id: "video_1",
        title: "Business Promotion Video",
        description: "Professional business promotion video template",
        thumbnail: "/api/placeholder/400/300",
        videoUrl: "/api/placeholder/800/600",
        duration: 30,
        category: "Business",
        language: "hindi",
        likes: 189,
        views: 800,
        downloads: 45,
        isLiked: false,
        isDownloaded: false,
        isPremium: false,
        tags: ["business", "promotion", "video"],
        fileSize: 10240000,
        createdAt: new Date().toISOString()
      },
      {
        id: "video_2",
        title: "Festival Greeting Video",
        description: "Beautiful festival greeting video template",
        thumbnail: "/api/placeholder/400/300",
        videoUrl: "/api/placeholder/800/600",
        duration: 15,
        category: "Festival",
        language: "hindi",
        likes: 245,
        views: 1200,
        downloads: 78,
        isLiked: false,
        isDownloaded: false,
        isPremium: true,
        tags: ["festival", "greeting", "celebration"],
        fileSize: 5120000,
        createdAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredVideos = videos;
    if (category) {
      filteredVideos = filteredVideos.filter(video => 
        video.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (language) {
      filteredVideos = filteredVideos.filter(video => 
        video.language === language
      );
    }
    if (isPremium !== undefined) {
      filteredVideos = filteredVideos.filter(video => 
        video.isPremium === (isPremium === 'true')
      );
    }
    if (duration) {
      const durationMap = {
        'short': 15,
        'medium': 30,
        'long': 60
      };
      filteredVideos = filteredVideos.filter(video => 
        video.duration <= durationMap[duration] || 30
      );
    }

    // Apply limit
    filteredVideos = filteredVideos.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredVideos,
      message: 'Video content retrieved successfully'
    });

  } catch (error) {
    console.error('Get video content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video content'
    });
  }
});

// Search Content
app.get('/api/mobile/home/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchResults = {
      templates: [],
      videos: [],
      events: []
    };

    if (type === 'all' || type === 'templates') {
      // Search templates
      const templates = await prisma.mobileTemplate.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          category: true,
          language: true,
          likes: true,
          downloads: true,
          isPremium: true,
          createdAt: true
        },
        take: parseInt(limit)
      });

      searchResults.templates = templates.map(template => ({
        id: template.id,
        title: template.title,
        description: template.description,
        thumbnail: template.thumbnailUrl,
        category: template.category,
        language: template.language,
        likes: template.likes,
        downloads: template.downloads,
        isPremium: template.isPremium,
        type: 'template',
        createdAt: template.createdAt
      }));
    }

    if (type === 'all' || type === 'videos') {
      // Mock video search results
      searchResults.videos = [
        {
          id: "video_search_1",
          title: `Video about ${q}`,
          description: `Professional video content related to ${q}`,
          thumbnail: "/api/placeholder/400/300",
          category: "Business",
          language: "hindi",
          likes: 50,
          downloads: 25,
          isPremium: false,
          type: 'video',
          createdAt: new Date().toISOString()
        }
      ];
    }

    if (type === 'all' || type === 'events') {
      // Mock event search results
      searchResults.events = [
        {
          id: "event_search_1",
          title: `Event about ${q}`,
          description: `Upcoming event related to ${q}`,
          date: "2024-11-15",
          location: "Mumbai",
          category: "Business",
          price: 500,
          isFree: false,
          type: 'event',
          createdAt: new Date().toISOString()
        }
      ];
    }

    res.json({
      success: true,
      data: searchResults,
      message: 'Search results retrieved successfully'
    });

  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search content'
    });
  }
});


// ============================================
// ENDPOINT 5: USER PROFILE BY ID
// ============================================
app.get('/api/mobile/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.mobileUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        deviceId: true,
        isActive: true,
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            downloads: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          deviceId: user.deviceId,
          isActive: user.isActive,
          lastActiveAt: user.lastActiveAt,
          joinedDate: user.createdAt,
          stats: {
            totalSubscriptions: user._count.subscriptions,
            totalDownloads: user._count.downloads,
            totalLikes: user._count.likes
          }
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// ============================================
// PLACEHOLDER IMAGE API
// ============================================
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#666">
        ${width} x ${height}
      </text>
    </svg>
  `;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.userType !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      // Verify admin exists
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id }
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin token'
        });
      }

      req.admin = admin;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// ============================================
// ADMIN APIs - WORKING ENDPOINTS
// ============================================

// Admin Login API
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // For demo purposes, accept any password (in production, use bcrypt)
    // const isValidPassword = await bcrypt.compare(password, admin.password);
    const isValidPassword = true; // Demo mode

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token (simplified for demo)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        userType: 'ADMIN' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'ADMIN'
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Debug endpoint to check database directly
app.get('/api/admin/debug/subscriptions', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Debug: Checking database directly');
    
    // Check mobile users
    const mobileUsers = await prisma.mobileUser.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    console.log('👥 Mobile users found:', mobileUsers.length);
    
    // Check mobile subscriptions
    const subscriptions = await prisma.mobileSubscription.findMany({
      include: {
        mobileUser: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });
    console.log('📋 Subscriptions found:', subscriptions.length);
    
    res.json({
      success: true,
      debug: {
        mobileUsers,
        subscriptions,
        counts: {
          users: mobileUsers.length,
          subscriptions: subscriptions.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin Subscription Listing API
app.get('/api/admin/subscriptions', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin subscription listing request received');
    
    const { 
      page = 1, 
      limit = 20, 
      status, 
      plan, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log('📊 Query parameters:', { pageNum, limitNum, status, plan, search });

    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    if (plan) {
      whereClause.planId = plan;
    }

    console.log('🔍 Where clause:', whereClause);

    // First, let's check if there are any subscriptions at all
    const totalSubscriptions = await prisma.mobileSubscription.count();
    console.log('📈 Total subscriptions in database:', totalSubscriptions);

    if (totalSubscriptions === 0) {
      return res.json({
        success: true,
        data: {
          subscriptions: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0
          },
          summary: {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            monthlyRevenue: 0
          }
        }
      });
    }

    // Get subscriptions with user details
    const [subscriptions, totalCount] = await Promise.all([
      prisma.mobileSubscription.findMany({
        where: whereClause,
        include: {
          mobileUser: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limitNum
      }),
      prisma.mobileSubscription.count({
        where: whereClause
      })
    ]);

    console.log('📋 Found subscriptions:', subscriptions.length);

    // Filter subscriptions by user search if needed
    let filteredSubscriptions = subscriptions;
    if (search) {
      filteredSubscriptions = subscriptions.filter(sub => 
        sub.mobileUser && (
          sub.mobileUser.name?.toLowerCase().includes(search.toLowerCase()) ||
          sub.mobileUser.email?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Calculate summary statistics
    const [activeSubscriptions, monthlyRevenue] = await Promise.all([
      prisma.mobileSubscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.mobileSubscription.aggregate({
        where: { 
          status: 'ACTIVE',
          planId: 'monthly_pro'
        },
        _sum: { amount: true }
      })
    ]);

    const yearlyRevenue = await prisma.mobileSubscription.aggregate({
      where: { 
        status: 'ACTIVE',
        planId: 'yearly_pro'
      },
      _sum: { amount: true }
    });

    const totalRevenue = (monthlyRevenue._sum.amount || 0) + (yearlyRevenue._sum.amount || 0);

    // Format response
    const formattedSubscriptions = filteredSubscriptions.map(sub => ({
      id: sub.id,
      user: sub.mobileUser ? {
        id: sub.mobileUser.id,
        name: sub.mobileUser.name,
        email: sub.mobileUser.email,
        phone: sub.mobileUser.phone
      } : null,
      plan: sub.plan,
      planId: sub.planId,
      status: sub.status,
      amount: sub.amount,
      startDate: sub.startDate,
      endDate: sub.endDate,
      paymentMethod: sub.paymentMethod,
      autoRenew: sub.autoRenew,
      createdAt: sub.createdAt
    }));

    console.log('✅ Returning subscription data:', {
      subscriptionsCount: formattedSubscriptions.length,
      totalCount,
      summary: { totalSubscriptions, activeSubscriptions, monthlyRevenue: totalRevenue }
    });

    res.json({
      success: true,
      data: {
        subscriptions: formattedSubscriptions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        },
        summary: {
          totalSubscriptions,
          activeSubscriptions,
          monthlyRevenue: totalRevenue
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin subscription listing error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions',
      details: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Deployment server running on http://localhost:${PORT}`);
  console.log(`📱 Mobile APIs available at http://localhost:${PORT}/api/mobile/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: SQLite (connected)`);
  console.log('\n✅ Ready for deployment!');
});

module.exports = app;
