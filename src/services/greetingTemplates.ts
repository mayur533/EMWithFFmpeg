import api from './api';

export interface GreetingTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  categoryId?: string; // Optional category ID for better filtering
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
  
  // Cache for faster subsequent loads
  private categoriesCache: GreetingCategory[] | null = null;
  private templatesCache: GreetingTemplate[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Convert relative image URLs to absolute URLs with quality parameters (optimized - minimal logging)
   */
  private convertToAbsoluteUrl(url: string | undefined | null, addQuality: boolean = false): string | undefined {
    if (!url) {
      return undefined;
    }
    
    // Already absolute URL (including Cloudinary URLs)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Add quality parameters for higher resolution if requested and not Unsplash
      if (addQuality && !url.includes('unsplash') && !url.includes('cloudinary')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}quality=high&width=1200`;
      }
      return url;
    }
    
    // Handle URLs that don't start with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const absoluteUrl = `${this.BASE_URL}${normalizedUrl}`;
    
    // Add quality parameters for higher resolution if requested
    if (addQuality) {
      return `${absoluteUrl}?quality=high&width=1200`;
    }
    
    return absoluteUrl;
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    if (!this.cacheTimestamp) return false;
    const timeSinceCache = Date.now() - this.cacheTimestamp;
    return timeSinceCache < this.CACHE_DURATION;
  }

  // Clear cache
  clearCache(): void {
    this.categoriesCache = null;
    this.templatesCache = null;
    this.cacheTimestamp = 0;
  }

  // Get all greeting categories
  async getCategories(): Promise<GreetingCategory[]> {
    // Return cached data if available and valid
    if (this.categoriesCache && this.isCacheValid()) {
      return this.categoriesCache;
    }
    
    try {
      const response = await api.get('/api/mobile/greetings/categories');
      
      if (response.data.success) {
        // Extract categories array - backend returns { data: { categories: [...] } }
        const categoriesArray = response.data.data.categories || response.data.data;
        
        if (!Array.isArray(categoriesArray)) {
          throw new Error('Invalid categories format');
        }
        
        // Map backend response to frontend format
        const mappedCategories = categoriesArray.map((backendCategory: any) => ({
          id: backendCategory.id,
          name: backendCategory.name,
          icon: backendCategory.icon,
          color: backendCategory.color || '#4A90E2'
        }));
        
        // Cache the results
        this.categoriesCache = mappedCategories;
        this.cacheTimestamp = Date.now();
        
        return mappedCategories;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching greeting categories:', error);
      // Return cached data if available, even if expired
      if (this.categoriesCache) {
        return this.categoriesCache;
      }
      return []; // Return empty array instead of mock data
    }
  }

  // Get greeting templates by category
  async getTemplatesByCategory(category: string): Promise<GreetingTemplate[]> {
    try {
      const response = await api.get(`/api/mobile/greetings/templates?category=${category}`);
      
      if (response.data.success) {
        // API returns images in businessCategoryImages, not templates
        const templates = response.data.data?.templates || [];
        const businessCategoryImages = response.data.data?.businessCategoryImages || [];
        
        // Use businessCategoryImages if templates is empty
        const dataToMap = businessCategoryImages.length > 0 ? businessCategoryImages : templates;
        
        if (dataToMap.length === 0) {
          return [];
        }
        
        // Map backend response to frontend format with URL conversion
        const mappedTemplates = dataToMap.map((backendTemplate: any) => {
          // For businessCategoryImages: prefer url, then thumbnailUrl
          // For templates: use imageUrl or thumbnail
          let imageUrl = backendTemplate.url || backendTemplate.imageUrl || backendTemplate.thumbnail;
          let thumbnailUrl = backendTemplate.thumbnailUrl || backendTemplate.url || backendTemplate.imageUrl;
          
          const absoluteImageUrl = this.convertToAbsoluteUrl(imageUrl, true);
          const absoluteThumbnailUrl = this.convertToAbsoluteUrl(thumbnailUrl, true);
          const finalThumbnail = absoluteThumbnailUrl || absoluteImageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&q=85';
          const finalBackground = absoluteImageUrl || absoluteThumbnailUrl || finalThumbnail;
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.business_categories?.name || backendTemplate.category || 'General',
            categoryId: backendTemplate.business_categories?.id || backendTemplate.businessCategoryId || undefined,
            content: {
              text: backendTemplate.description || '',
              background: finalBackground,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false,
            tags: Array.isArray(backendTemplate.tags) ? backendTemplate.tags : [],
          };
        });
        
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching greeting templates by category:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Get all greeting templates with filters
  async getTemplates(filters?: GreetingFilters): Promise<GreetingTemplate[]> {
    // Return cached data if available, valid, and no filters applied
    if (!filters && this.templatesCache && this.isCacheValid()) {
      return this.templatesCache;
    }
    
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());
      if (filters?.search) params.append('search', filters.search);

      const endpoint = `/api/mobile/greetings/templates?${params.toString()}`;
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        // API returns images in businessCategoryImages, not templates
        const templates = response.data.data?.templates || [];
        const businessCategoryImages = response.data.data?.businessCategoryImages || [];
        
        // Use businessCategoryImages if templates is empty
        const dataToMap = businessCategoryImages.length > 0 ? businessCategoryImages : templates;
        
        if (dataToMap.length === 0) {
          return [];
        }
        
        // Map backend response to frontend format with URL conversion
        const mappedTemplates = dataToMap.map((backendTemplate: any) => {
          // For businessCategoryImages: prefer url, then thumbnailUrl
          // For templates: use imageUrl or thumbnail
          let imageUrl = backendTemplate.url || backendTemplate.imageUrl || backendTemplate.thumbnail;
          let thumbnailUrl = backendTemplate.thumbnailUrl || backendTemplate.url || backendTemplate.imageUrl;
          
          const absoluteImageUrl = this.convertToAbsoluteUrl(imageUrl, true);
          const absoluteThumbnailUrl = this.convertToAbsoluteUrl(thumbnailUrl, true);
          const finalThumbnail = absoluteThumbnailUrl || absoluteImageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&q=85';
          const finalBackground = absoluteImageUrl || absoluteThumbnailUrl || finalThumbnail;
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.business_categories?.name || backendTemplate.category || 'General',
            categoryId: backendTemplate.business_categories?.id || backendTemplate.businessCategoryId || undefined,
            content: {
              text: backendTemplate.description || '',
              background: finalBackground,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false,
            tags: Array.isArray(backendTemplate.tags) ? backendTemplate.tags : [],
          };
        });
        
        // Cache the results if no filters were applied
        if (!filters) {
          this.templatesCache = mappedTemplates;
          this.cacheTimestamp = Date.now();
        }
        
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error: any) {
      console.error('Error fetching greeting templates:', error);
      // Return cached data if available, even if expired
      if (!filters && this.templatesCache) {
        return this.templatesCache;
      }
      return []; // Return empty array instead of mock data
    }
  }

  // Search greeting templates
  async searchTemplates(query: string, language?: string): Promise<GreetingTemplate[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', encodeURIComponent(query));
      if (language) {
        params.append('language', language);
      }
      params.append('limit', '200');
      
      const response = await api.get(`/api/mobile/greetings/templates?${params.toString()}`);
      
      if (response.data.success) {
        // API returns images in businessCategoryImages, not templates
        const templates = response.data.data?.templates || [];
        const businessCategoryImages = response.data.data?.businessCategoryImages || [];
        
        // Use businessCategoryImages if templates is empty
        const dataToMap = businessCategoryImages.length > 0 ? businessCategoryImages : templates;
        
        if (dataToMap.length === 0) {
          return [];
        }
        
        // Map backend response to frontend format
        const mappedTemplates = dataToMap.map((backendTemplate: any) => {
          // For businessCategoryImages: prefer url (full quality), then thumbnailUrl
          // For templates: use imageUrl or thumbnail
          let fullUrl = backendTemplate.url || backendTemplate.imageUrl || backendTemplate.thumbnailUrl || backendTemplate.thumbnail || backendTemplate.image;
          let thumbnailUrl = backendTemplate.thumbnailUrl || backendTemplate.url || backendTemplate.imageUrl || backendTemplate.thumbnail || backendTemplate.image;
          
          // If thumbnail URL is missing extension, use the full URL instead
          if (thumbnailUrl && !thumbnailUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            thumbnailUrl = fullUrl;
          }
          
          // Convert to absolute URLs with high quality
          const absoluteFullUrl = this.convertToAbsoluteUrl(fullUrl, true);
          const absoluteThumbnailUrl = this.convertToAbsoluteUrl(thumbnailUrl, true);
          
          const finalBackground = absoluteFullUrl || absoluteThumbnailUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&q=85';
          const finalThumbnail = absoluteThumbnailUrl || absoluteFullUrl || finalBackground;
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title,
            thumbnail: finalThumbnail,
            category: backendTemplate.business_categories?.name || backendTemplate.category || 'General',
            content: {
              text: backendTemplate.description || '',
              background: finalBackground,
              layout: 'vertical' as const
            },
            downloads: backendTemplate.downloads || 0,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false,
            tags: Array.isArray(backendTemplate.tags) ? backendTemplate.tags : [],
          };
        });
        
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error searching greeting templates:', error);
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
    return this.getMockStickers();
  }

  // Get available emojis (mock data only - API endpoint removed)
  async getEmojis(): Promise<string[]> {
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
