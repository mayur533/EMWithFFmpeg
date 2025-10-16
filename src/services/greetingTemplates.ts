import api from './api';

export interface GreetingTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  content: {
    text?: string;
    background?: string;
    stickers?: string[];
    emojis?: string[];
    layout?: 'vertical' | 'horizontal' | 'square';
  };
  downloads: number;
  isDownloaded: boolean;
  isPremium: boolean;
}

export interface GreetingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface GreetingFilters {
  category?: string;
  language?: string;
  isPremium?: boolean;
  search?: string;
}

class GreetingTemplatesService {
  private readonly BASE_URL = 'https://eventmarketersbackend.onrender.com';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Cache storage
  private cache: {
    categories: { data: GreetingCategory[] | null; timestamp: number };
    templates: { data: GreetingTemplate[] | null; timestamp: number };
  } = {
    categories: { data: null, timestamp: 0 },
    templates: { data: null, timestamp: 0 },
  };

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: 'categories' | 'templates'): boolean {
    const cached = this.cache[cacheKey];
    return cached.data !== null && (Date.now() - cached.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(cacheKey?: 'categories' | 'templates'): void {
    if (cacheKey) {
      this.cache[cacheKey] = { data: null, timestamp: 0 };
      console.log(`🧹 [CACHE] Cleared ${cacheKey} cache`);
    } else {
      this.cache = {
        categories: { data: null, timestamp: 0 },
        templates: { data: null, timestamp: 0 },
      };
      console.log('🧹 [CACHE] Cleared all greeting templates cache');
    }
  }

  /**
   * Convert relative image URLs to absolute URLs (optimized - minimal logging)
   */
  private convertToAbsoluteUrl(url: string | undefined | null): string | undefined {
    if (!url) {
      return undefined;
    }
    
    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Handle URLs that don't start with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${this.BASE_URL}${normalizedUrl}`;
  }

  // Get all greeting categories (with caching)
  async getCategories(): Promise<GreetingCategory[]> {
    // Check cache first
    if (this.isCacheValid('categories')) {
      console.log('✅ [CACHE] Returning cached categories');
      return this.cache.categories.data!;
    }

    try {
      console.log('📡 [GREETING CATEGORIES API] Fetching from server...');
      const response = await api.get('/api/mobile/greetings/categories');
      
      if (response.data.success) {
        // Extract categories array - backend returns { data: { categories: [...] } }
        const categoriesArray = response.data.data.categories || response.data.data;
        
        if (!Array.isArray(categoriesArray)) {
          console.error('❌ [GREETING CATEGORIES API] Invalid format');
          throw new Error('Invalid categories format');
        }
        
        // Map backend response to frontend format
        const mappedCategories = categoriesArray.map((backendCategory: any) => ({
          id: backendCategory.id,
          name: backendCategory.name,
          icon: backendCategory.icon,
          color: backendCategory.color || '#4A90E2'
        }));
        
        // Cache the result
        this.cache.categories = {
          data: mappedCategories,
          timestamp: Date.now(),
        };
        
        console.log(`✅ [GREETING CATEGORIES API] Fetched and cached ${mappedCategories.length} categories`);
        return mappedCategories;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING CATEGORIES API] Error:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Get greeting templates by category (optimized logging)
  async getTemplatesByCategory(category: string): Promise<GreetingTemplate[]> {
    try {
      console.log(`📡 [GREETING BY CATEGORY API] Fetching category: ${category}`);
      const response = await api.get(`/api/mobile/greetings/templates?category=${category}`);
      
      if (response.data.success) {
        // Map backend response to frontend format with URL conversion (optimized - no per-item logging)
        const mappedTemplates = response.data.data.templates.map((backendTemplate: any) => {
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        console.log(`✅ [GREETING BY CATEGORY API] Fetched ${mappedTemplates.length} templates`);
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING BY CATEGORY API] Error:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Get all greeting templates with filters (with caching)
  async getTemplates(filters?: GreetingFilters): Promise<GreetingTemplate[]> {
    // Only cache when no filters are applied (base template list)
    const shouldCache = !filters || Object.keys(filters).length === 0;
    
    // Check cache first for unfiltered requests
    if (shouldCache && this.isCacheValid('templates')) {
      console.log('✅ [CACHE] Returning cached templates');
      return this.cache.templates.data!;
    }

    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());
      if (filters?.search) params.append('search', filters.search);

      console.log('📡 [GREETING TEMPLATES API] Fetching from server...');
      const response = await api.get(`/api/mobile/greetings/templates?${params.toString()}`);
      
      if (response.data.success) {
        // Map backend response to frontend format with URL conversion (optimized - no per-item logging)
        const mappedTemplates = response.data.data.templates.map((backendTemplate: any) => {
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        // Cache the result if unfiltered
        if (shouldCache) {
          this.cache.templates = {
            data: mappedTemplates,
            timestamp: Date.now(),
          };
        }
        
        console.log(`✅ [GREETING TEMPLATES API] Fetched ${mappedTemplates.length} templates ${shouldCache ? '(cached)' : '(not cached - filtered)'}`);
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING TEMPLATES API] Error:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Search greeting templates (optimized logging)
  async searchTemplates(query: string): Promise<GreetingTemplate[]> {
    try {
      console.log(`📡 [GREETING SEARCH API] Searching for: "${query}"`);
      const response = await api.get(`/api/mobile/greetings/templates/search?q=${query}`);
      
      if (response.data.success) {
        // Check if templates array exists and has items
        const templates = response.data.data?.templates || [];
        
        if (templates.length === 0) {
          console.log('⚠️ [GREETING SEARCH API] No templates found');
          return [];
        }
        
        // Map backend response to frontend format with URL conversion (optimized - no per-item logging)
        const mappedTemplates = templates.map((backendTemplate: any) => {
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        console.log(`✅ [GREETING SEARCH API] Found ${mappedTemplates.length} templates`);
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING SEARCH API] Error:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Download a template
  async downloadTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await api.post(`/api/mobile/greetings/templates/${templateId}/download`);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      return false;
    }
  }

  // Get available stickers (mock data only - API endpoint removed)
  async getStickers(): Promise<string[]> {
    console.log('📡 [STICKERS] Using mock data (API endpoint removed)');
    return this.getMockStickers();
  }

  // Get available emojis (mock data only - API endpoint removed)
  async getEmojis(): Promise<string[]> {
    console.log('📡 [EMOJIS] Using mock data (API endpoint removed)');
    return this.getMockEmojis();
  }

  // Mock data methods
  private getMockCategories(): GreetingCategory[] {
    return [
      { id: 'good-morning', name: 'Good Morning', icon: 'wb-sunny', color: '#FFD700' },
      { id: 'good-night', name: 'Good Night', icon: 'nightlight', color: '#4A90E2' },
      { id: 'quotes', name: 'Quotes', icon: 'format-quote', color: '#E74C3C' },
      { id: 'birthday', name: 'Birthday', icon: 'cake', color: '#FF69B4' },
      { id: 'anniversary', name: 'Anniversary', icon: 'favorite', color: '#FF6B6B' },
      { id: 'congratulations', name: 'Congratulations', icon: 'emoji-events', color: '#FFD700' },
      { id: 'thank-you', name: 'Thank You', icon: 'favorite-border', color: '#4CAF50' },
      { id: 'festival', name: 'Festival', icon: 'celebration', color: '#9C27B0' },
    ];
  }

  private getMockTemplatesByCategory(category: string): GreetingTemplate[] {
    const templates: { [key: string]: GreetingTemplate[] } = {
      'good-morning': [
        {
          id: 'gm-1',
          name: 'Sunrise Greeting',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
          category: 'good-morning',
          content: {
            text: 'Good Morning! 🌅',
            background: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            layout: 'vertical'
          },
          downloads: 189,
          isDownloaded: false,
          isPremium: false
        },
        {
          id: 'gm-2',
          name: 'Coffee Morning',
          thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=400&fit=crop',
          category: 'good-morning',
          content: {
            text: 'Rise and shine! ☕',
            background: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop',
            layout: 'vertical'
          },
          downloads: 156,
          isDownloaded: false,
          isPremium: true
        }
      ],
      'quotes': [
        {
          id: 'q-1',
          name: 'Inspirational Quote',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
          category: 'quotes',
          content: {
            text: 'The only way to do great work is to love what you do.',
            background: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
            layout: 'vertical'
          },
          downloads: 234,
          isDownloaded: false,
          isPremium: false
        }
      ],
      'birthday': [
        {
          id: 'bd-1',
          name: 'Birthday Celebration',
          thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=400&fit=crop',
          category: 'birthday',
          content: {
            text: 'Happy Birthday! 🎂',
            background: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=600&fit=crop',
            layout: 'vertical'
          },
          downloads: 145,
          isDownloaded: false,
          isPremium: false
        }
      ]
    };

    return templates[category] || [];
  }

  private getMockTemplates(filters?: GreetingFilters): GreetingTemplate[] {
    const allTemplates = [
      ...this.getMockTemplatesByCategory('good-morning'),
      ...this.getMockTemplatesByCategory('quotes'),
      ...this.getMockTemplatesByCategory('birthday')
    ];

    let filtered = allTemplates;

    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters?.isPremium !== undefined) {
      filtered = filtered.filter(t => t.isPremium === filters.isPremium);
    }

    if (filters?.search) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        t.content.text?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filtered;
  }

  private getMockSearchResults(query: string): GreetingTemplate[] {
    const allTemplates = this.getMockTemplates();
    return allTemplates.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.content.text?.toLowerCase().includes(query.toLowerCase())
    );
  }

  private getMockStickers(): string[] {
    return [
      '🌟', '✨', '💫', '⭐', '🎉', '🎊', '🎈', '🎂', '🎁', '💝',
      '💖', '💕', '💗', '💓', '💞', '💘', '💌', '💋', '💍', '💎',
      '🌹', '🌷', '🌸', '🌺', '🌻', '🌼', '🌿', '🍀', '🌱', '🌲',
      '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
      '🌈', '☔', '⚡', '❄️', '🔥', '💧', '🌊', '🌍', '🌎', '🌏'
    ];
  }

  private getMockEmojis(): string[] {
    return [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
    ];
  }
}

export default new GreetingTemplatesService();
