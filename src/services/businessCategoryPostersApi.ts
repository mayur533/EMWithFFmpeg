import api from './api';
import authService from './auth';

export interface BusinessCategoryPoster {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  imageUrl: string;
  downloadUrl: string;
  likes: number;
  downloads: number;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCategoryPostersResponse {
  success: boolean;
  data: {
    posters: BusinessCategoryPoster[];
    category: string;
    total: number;
  };
  message: string;
}

class BusinessCategoryPostersApiService {
  private postersCache: Map<string, { data: BusinessCategoryPoster[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get posters for a specific business category
   */
  async getPostersByCategory(category: string): Promise<BusinessCategoryPostersResponse> {
    try {
      const cacheKey = `category_${category}`;
      const now = Date.now();
      
      // Check cache first
      if (this.postersCache.has(cacheKey)) {
        const cached = this.postersCache.get(cacheKey)!;
        if ((now - cached.timestamp) < this.CACHE_DURATION) {
          console.log('✅ Using cached posters for category:', category);
          console.log('   Cached posters already have absolute URLs');
          return {
            success: true,
            data: {
              posters: cached.data,
              category,
              total: cached.data.length
            },
            message: 'Posters fetched from cache'
          };
        }
      }

      console.log('🔍 Fetching posters for business category:', category);
      const response = await api.get(`/api/mobile/posters/category/${encodeURIComponent(category)}`);
      
      if (response.data.success) {
        const posters = response.data.data.posters;
        
        // TEMPORARY FIX: Convert relative paths to absolute URLs
        const baseUrl = 'https://eventmarketersbackend.onrender.com';
        const postersWithAbsoluteUrls = posters.map((poster: BusinessCategoryPoster) => ({
          ...poster,
          thumbnail: poster.thumbnail && !poster.thumbnail.startsWith('http') 
            ? `${baseUrl}${poster.thumbnail}` 
            : poster.thumbnail,
          imageUrl: poster.imageUrl && !poster.imageUrl.startsWith('http')
            ? `${baseUrl}${poster.imageUrl}`
            : poster.imageUrl,
          downloadUrl: poster.downloadUrl && !poster.downloadUrl.startsWith('http')
            ? `${baseUrl}${poster.downloadUrl}`
            : poster.downloadUrl,
        }));
        
        console.log('🔧 Converted relative paths to absolute URLs');
        console.log('   Example URL:', postersWithAbsoluteUrls[0]?.thumbnail || 'No posters');
        
        // Cache the results with absolute URLs
        this.postersCache.set(cacheKey, {
          data: postersWithAbsoluteUrls,
          timestamp: now
        });
        
        console.log('✅ Fetched posters for category:', category, 'Count:', postersWithAbsoluteUrls.length);
        return {
          ...response.data,
          data: {
            ...response.data.data,
            posters: postersWithAbsoluteUrls
          }
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch posters');
      }
    } catch (error: any) {
      console.error('❌ Error fetching posters by category:', error);
      
      // Return empty data when API fails
      return {
        success: false,
        data: {
          posters: [],
          category,
          total: 0
        },
        message: 'No posters available - API endpoint not found'
      };
    }
  }

  /**
   * Get user's business category and fetch relevant posters
   */
  async getUserCategoryPosters(): Promise<BusinessCategoryPostersResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available, returning general posters');
        return this.getPostersByCategory('General');
      }

      // Get user's business profiles to determine category
      const businessProfileService = (await import('./businessProfile')).default;
      const userProfiles = await businessProfileService.getUserBusinessProfiles(userId);
      
      if (userProfiles.length > 0) {
        const primaryCategory = userProfiles[0].category;
        console.log('🎯 User business category:', primaryCategory);
        return this.getPostersByCategory(primaryCategory);
      } else {
        console.log('⚠️ No business profiles found, returning general posters');
        return this.getPostersByCategory('General');
      }
    } catch (error) {
      console.error('❌ Error getting user category posters:', error);
      // Return empty data when there's an error
      return {
        success: false,
        data: {
          posters: [],
          category: 'General',
          total: 0
        },
        message: 'No posters available - unable to determine user category'
      };
    }
  }

  /**
   * Like a poster
   */
  async likePoster(posterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.post(`/api/mobile/likes`, {
        resourceType: 'POSTER',
        resourceId: posterId,
        mobileUserId: userId
      });

      if (response.data.success) {
        console.log('✅ Poster liked successfully:', posterId);
        return { success: true, message: 'Poster liked successfully' };
      } else {
        throw new Error(response.data.error || 'Failed to like poster');
      }
    } catch (error: any) {
      console.error('❌ Error liking poster:', error);
      return { success: false, message: error.message || 'Failed to like poster' };
    }
  }

  /**
   * Unlike a poster
   */
  async unlikePoster(posterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.delete(`/api/mobile/likes`, {
        data: {
          resourceType: 'POSTER',
          resourceId: posterId,
          mobileUserId: userId
        }
      });

      if (response.data.success) {
        console.log('✅ Poster unliked successfully:', posterId);
        return { success: true, message: 'Poster unliked successfully' };
      } else {
        throw new Error(response.data.error || 'Failed to unlike poster');
      }
    } catch (error: any) {
      console.error('❌ Error unliking poster:', error);
      return { success: false, message: error.message || 'Failed to unlike poster' };
    }
  }

  /**
   * Download a poster
   */
  async downloadPoster(posterId: string): Promise<{ success: boolean; message: string; downloadUrl?: string }> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Track the download
      const downloadResponse = await api.post('/api/mobile/downloads/track', {
        mobileUserId: userId,
        resourceId: posterId,
        resourceType: 'POSTER',
        fileUrl: `https://example.com/posters/${posterId}.jpg`
      });

      if (downloadResponse.data.success) {
        console.log('✅ Poster download tracked successfully:', posterId);
        return { 
          success: true, 
          message: 'Poster download tracked successfully',
          downloadUrl: `https://example.com/posters/${posterId}.jpg`
        };
      } else {
        throw new Error(downloadResponse.data.error || 'Failed to track download');
      }
    } catch (error: any) {
      console.error('❌ Error downloading poster:', error);
      return { success: false, message: error.message || 'Failed to download poster' };
    }
  }

  /**
   * Get mock posters for different business categories
   */
  // Mock data method removed - using only API data

  /**
   * Clear cache
   */
  clearCache(): void {
    this.postersCache.clear();
    console.log('🗑️ Business category posters cache cleared');
  }
}

export default new BusinessCategoryPostersApiService();
