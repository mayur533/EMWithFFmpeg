import api from './api';

export interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface BusinessCategoriesResponse {
  success: boolean;
  categories: BusinessCategory[];
}

class BusinessCategoriesService {
  private categoriesCache: BusinessCategory[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

  // Get all business categories
  async getBusinessCategories(): Promise<BusinessCategoriesResponse> {
    try {
      console.log('📡 [CATEGORY API] Calling: /api/mobile/business-categories/business');
      const response = await api.get('/api/mobile/business-categories/business');
      
      console.log('✅ [CATEGORY API] Response received');
      console.log('📊 [CATEGORY API] Full Response:', JSON.stringify(response.data, null, 2));
      console.log('📊 [CATEGORY API] Success:', response.data.success);
      
      // Handle new response structure: categories are in response.data.data.categories
      const categories = response.data.data?.categories || response.data.categories || [];
      console.log('📊 [CATEGORY API] Categories count:', categories.length);
      
      if (categories && categories.length > 0) {
        console.log('📊 [CATEGORY API] First category:', JSON.stringify(categories[0], null, 2));
        console.log('📊 [CATEGORY API] All category names:', categories.map((cat: BusinessCategory) => cat.name));
      }
      
      // Cache the categories
      if (response.data.success && categories.length > 0) {
        this.categoriesCache = categories;
        this.cacheTimestamp = Date.now();
        console.log('💾 [CATEGORY API] Categories cached successfully');
      }
      
      // Return in expected format
      return {
        success: response.data.success || true,
        categories: categories
      };
    } catch (error) {
      console.error('❌ [CATEGORY API] Error:', error);
      console.error('❌ [CATEGORY API] Error details:', JSON.stringify(error, null, 2));
      
      // Return cached data if available
      if (this.categoriesCache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
        console.log('⚠️ [CATEGORY API] Using cached business categories due to API error');
        console.log('💾 [CATEGORY API] Cached categories count:', this.categoriesCache.length);
        return {
          success: true,
          categories: this.categoriesCache
        };
      }
      
      // Return mock data as fallback
      console.log('⚠️ [CATEGORY API] Using mock business categories due to API error');
      return this.getMockCategories();
    }
  }

  // Get categories using alias endpoint
  async getCategories(): Promise<BusinessCategoriesResponse> {
    try {
      console.log('📡 [CATEGORY API ALIAS] Calling: /api/v1/categories');
      const response = await api.get('/api/v1/categories');
      
      console.log('✅ [CATEGORY API ALIAS] Response received');
      console.log('📊 [CATEGORY API ALIAS] Full Response:', JSON.stringify(response.data, null, 2));
      console.log('📊 [CATEGORY API ALIAS] Categories count:', response.data.categories?.length || 0);
      
      // Cache the categories
      if (response.data.success && response.data.categories) {
        this.categoriesCache = response.data.categories;
        this.cacheTimestamp = Date.now();
        console.log('💾 [CATEGORY API ALIAS] Categories cached successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [CATEGORY API ALIAS] Error:', error);
      console.log('🔄 [CATEGORY API ALIAS] Falling back to main endpoint');
      
      // Fallback to main endpoint
      return this.getBusinessCategories();
    }
  }

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<BusinessCategory | null> {
    try {
      const response = await this.getBusinessCategories();
      if (response.success) {
        return response.categories.find(category => category.id === categoryId) || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get category by ID:', error);
      return null;
    }
  }

  // Search categories by name
  async searchCategories(query: string): Promise<BusinessCategory[]> {
    try {
      const response = await this.getBusinessCategories();
      if (response.success) {
        return response.categories.filter(category => 
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          category.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      return [];
    } catch (error) {
      console.error('Failed to search categories:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    this.categoriesCache = null;
    this.cacheTimestamp = 0;
  }

  // Get mock categories for fallback
  private getMockCategories(): BusinessCategoriesResponse {
    return {
      success: true,
      categories: [
        {
          id: '1',
          name: 'Restaurant',
          description: 'Food and dining business content',
          icon: '🍽️'
        },
        {
          id: '2',
          name: 'Wedding Planning',
          description: 'Wedding and event planning content',
          icon: '💒'
        },
        {
          id: '3',
          name: 'Electronics',
          description: 'Electronic products and gadgets',
          icon: '📱'
        },
        {
          id: '4',
          name: 'Fashion',
          description: 'Fashion and clothing business content',
          icon: '👗'
        },
        {
          id: '5',
          name: 'Health & Fitness',
          description: 'Health and fitness related content',
          icon: '💪'
        },
        {
          id: '6',
          name: 'Education',
          description: 'Educational institutions and services',
          icon: '🎓'
        },
        {
          id: '7',
          name: 'Automotive',
          description: 'Automotive and transportation services',
          icon: '🚗'
        },
        {
          id: '8',
          name: 'Real Estate',
          description: 'Real estate and property services',
          icon: '🏠'
        }
      ]
    };
  }
}

export default new BusinessCategoriesService();
