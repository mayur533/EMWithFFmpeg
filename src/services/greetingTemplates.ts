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
  likes: number;
  downloads: number;
  isLiked: boolean;
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

  /**
   * Convert relative image URLs to absolute URLs
   */
  private convertToAbsoluteUrl(url: string | undefined | null): string | undefined {
    if (!url) {
      console.log('⚠️ [URL CONVERSION] No URL provided, returning undefined');
      return undefined;
    }
    
    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('✅ [URL CONVERSION] Already absolute:', url);
      return url;
    }
    
    // Handle URLs that don't start with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const absoluteUrl = `${this.BASE_URL}${normalizedUrl}`;
    
    console.log('🔧 [URL CONVERSION] Converted:', url, '→', absoluteUrl);
    return absoluteUrl;
  }

  // Get all greeting categories
  async getCategories(): Promise<GreetingCategory[]> {
    try {
      console.log('📡 [GREETING CATEGORIES API] Calling: /api/mobile/greetings/categories');
      const response = await api.get('/api/mobile/greetings/categories');
      
      console.log('✅ [GREETING CATEGORIES API] Response received');
      console.log('📊 [GREETING CATEGORIES API] Full Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        // Extract categories array - backend returns { data: { categories: [...] } }
        const categoriesArray = response.data.data.categories || response.data.data;
        
        if (!Array.isArray(categoriesArray)) {
          console.error('❌ [GREETING CATEGORIES API] Categories is not an array:', typeof categoriesArray);
          throw new Error('Invalid categories format');
        }
        
        console.log('📊 [GREETING CATEGORIES API] Categories count:', categoriesArray.length);
        
        // Map backend response to frontend format
        const mappedCategories = categoriesArray.map((backendCategory: any) => ({
          id: backendCategory.id,
          name: backendCategory.name,
          icon: backendCategory.icon, // Don't provide fallback - show nothing if backend doesn't provide icon
          color: backendCategory.color || '#4A90E2'
        }));
        
        console.log('✅ [GREETING CATEGORIES API] Mapped', mappedCategories.length, 'categories');
        return mappedCategories;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING CATEGORIES API] Error:', error);
      console.log('⚠️ [GREETING CATEGORIES API] Returning empty array - no mock data');
      return []; // Return empty array instead of mock data
    }
  }

  // Get greeting templates by category
  async getTemplatesByCategory(category: string): Promise<GreetingTemplate[]> {
    try {
      console.log('📡 [GREETING BY CATEGORY API] Calling: /api/mobile/greetings/templates?category=' + category);
      const response = await api.get(`/api/mobile/greetings/templates?category=${category}`);
      
      console.log('✅ [GREETING BY CATEGORY API] Response received');
      console.log('📊 [GREETING BY CATEGORY API] Full Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        // Map backend response to frontend format with URL conversion
        const mappedTemplates = response.data.data.templates.map((backendTemplate: any) => {
          const originalUrl = backendTemplate.imageUrl;
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          console.log(`📸 [GREETING BY CATEGORY API] Template: ${backendTemplate.title}`);
          console.log(`   Original URL: ${originalUrl}`);
          console.log(`   Absolute URL: ${absoluteUrl}`);
          console.log(`   Final URL: ${finalThumbnail}`);
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title, // Backend uses 'title', frontend expects 'name'
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            likes: backendTemplate.likes || 0,
            downloads: backendTemplate.downloads || 0,
            isLiked: false,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        console.log('✅ [GREETING BY CATEGORY API] Mapped', mappedTemplates.length, 'templates');
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING BY CATEGORY API] Error:', error);
      console.log('⚠️ [GREETING BY CATEGORY API] Returning empty array - no mock data');
      return []; // Return empty array instead of mock data
    }
  }

  // Get all greeting templates with filters
  async getTemplates(filters?: GreetingFilters): Promise<GreetingTemplate[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());
      if (filters?.search) params.append('search', filters.search);

      console.log('📡 [GREETING TEMPLATES API] Calling: /api/mobile/greetings/templates?' + params.toString());
      const response = await api.get(`/api/mobile/greetings/templates?${params.toString()}`);
      
      console.log('✅ [GREETING TEMPLATES API] Response received');
      console.log('📊 [GREETING TEMPLATES API] Full Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('📊 [GREETING TEMPLATES API] Templates count:', response.data.data.templates.length);
        
        // Map backend response to frontend format with URL conversion
        const mappedTemplates = response.data.data.templates.map((backendTemplate: any) => {
          const originalUrl = backendTemplate.imageUrl;
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          console.log(`📸 [GREETING TEMPLATES API] Template: ${backendTemplate.title}`);
          console.log(`   Original URL: ${originalUrl}`);
          console.log(`   Absolute URL: ${absoluteUrl}`);
          console.log(`   Final URL: ${finalThumbnail}`);
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title, // Backend uses 'title', frontend expects 'name'
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            likes: backendTemplate.likes || 0,
            downloads: backendTemplate.downloads || 0,
            isLiked: false,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        console.log('✅ [GREETING TEMPLATES API] Mapped', mappedTemplates.length, 'templates with absolute URLs');
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING TEMPLATES API] Error:', error);
      console.log('⚠️ [GREETING TEMPLATES API] Returning empty array - no mock data');
      return []; // Return empty array instead of mock data
    }
  }

  // Search greeting templates
  async searchTemplates(query: string): Promise<GreetingTemplate[]> {
    try {
      console.log('📡 [GREETING SEARCH API] Calling: /api/mobile/greetings/templates/search?q=' + query);
      const response = await api.get(`/api/mobile/greetings/templates/search?q=${query}`);
      
      console.log('✅ [GREETING SEARCH API] Response received');
      console.log('📊 [GREETING SEARCH API] Full Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        // Check if templates array exists and has items
        const templates = response.data.data?.templates || [];
        
        if (templates.length === 0) {
          console.log('⚠️ [GREETING SEARCH API] No templates found for query:', query);
          return [];
        }
        
        // Map backend response to frontend format with URL conversion
        const mappedTemplates = templates.map((backendTemplate: any) => {
          const originalUrl = backendTemplate.imageUrl;
          const absoluteUrl = this.convertToAbsoluteUrl(backendTemplate.imageUrl);
          
          // Fallback to Unsplash if no URL
          const finalThumbnail = absoluteUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop';
          
          console.log(`📸 [GREETING SEARCH API] Template: ${backendTemplate.title}`);
          console.log(`   Original URL: ${originalUrl}`);
          console.log(`   Absolute URL: ${absoluteUrl}`);
          console.log(`   Final URL: ${finalThumbnail}`);
          
          return {
            id: backendTemplate.id,
            name: backendTemplate.title, // Backend uses 'title', frontend expects 'name'
            thumbnail: finalThumbnail,
            category: backendTemplate.category,
            content: {
              text: backendTemplate.description,
              background: absoluteUrl || finalThumbnail,
              layout: 'vertical' as const
            },
            likes: backendTemplate.likes || 0,
            downloads: backendTemplate.downloads || 0,
            isLiked: false,
            isDownloaded: false,
            isPremium: backendTemplate.isPremium || false
          };
        });
        
        console.log('✅ [GREETING SEARCH API] Found', mappedTemplates.length, 'templates');
        return mappedTemplates;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [GREETING SEARCH API] Error:', error);
      console.log('⚠️ [GREETING SEARCH API] Returning empty array - no mock data');
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

  // Get available stickers
  async getStickers(): Promise<string[]> {
    try {
      const response = await api.get('/api/mobile/greetings/stickers');
      
      if (response.data.success) {
        // Map backend response to frontend format
        return response.data.data.stickers.map((sticker: any) => sticker.emoji || sticker.name);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.log('Using mock stickers due to API error:', error);
      return this.getMockStickers();
    }
  }

  // Get available emojis
  async getEmojis(): Promise<string[]> {
    try {
      const response = await api.get('/api/mobile/greetings/emojis');
      
      if (response.data.success) {
        // Map backend response to frontend format
        return response.data.data.emojis.map((emoji: any) => emoji.emoji || emoji.name);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.log('Using mock emojis due to API error:', error);
      return this.getMockEmojis();
    }
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
          likes: 245,
          downloads: 189,
          isLiked: false,
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
          likes: 189,
          downloads: 156,
          isLiked: true,
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
          likes: 312,
          downloads: 234,
          isLiked: false,
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
          likes: 178,
          downloads: 145,
          isLiked: false,
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
