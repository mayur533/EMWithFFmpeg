import api from './api';

// ============================================================================
// CALENDAR API SERVICE
// ============================================================================
// This service handles fetching calendar posters/images for specific dates.
// Backend team should implement these endpoints.
// ============================================================================

export interface CalendarPoster {
  id: string;
  name: string;
  title?: string;
  description?: string;
  thumbnail: string;
  imageUrl?: string;
  category: string;
  downloads: number;
  isDownloaded: boolean;
  tags: string[];
  date: string; // ISO date string (YYYY-MM-DD)
  festivalName?: string;
  festivalEmoji?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarPostersResponse {
  success: boolean;
  data: {
    posters: CalendarPoster[];
    date: string;
    total: number;
  };
  message: string;
}

export interface CalendarMonthPostersResponse {
  success: boolean;
  data: {
    posters: { [date: string]: CalendarPoster[] };
    month: number;
    year: number;
    total: number;
  };
  message: string;
}

class CalendarApiService {
  private postersCache: Map<string, { data: CalendarPoster[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

  /**
   * Get posters for a specific date
   * @param date - Date string in format YYYY-MM-DD
   * @returns CalendarPostersResponse
   */
  async getPostersByDate(date: string): Promise<CalendarPostersResponse> {
    try {
      const cacheKey = `date_${date}`;
      const now = Date.now();

      // Check cache first
      if (this.postersCache.has(cacheKey)) {
        const cached = this.postersCache.get(cacheKey)!;
        const cacheAge = now - cached.timestamp;

        if (cacheAge < this.CACHE_DURATION) {
          console.log(`✅ [CALENDAR API] Returning ${cached.data.length} cached posters for date: ${date}`);
          return {
            success: true,
            data: {
              posters: cached.data,
              date,
              total: cached.data.length,
            },
            message: 'Posters fetched from cache',
          };
        }
      }

      console.log(`📡 [CALENDAR API] Fetching posters for date: ${date}`);
      console.log(`📡 [CALENDAR API] Endpoint: /api/mobile/calendar/posters/${date}`);

      const response = await api.get(`/api/mobile/calendar/posters/${date}`);

      console.log('═══════════════════════════════════════════════════════');
      console.log(`📦 [CALENDAR API] COMPLETE RESPONSE FOR DATE: ${date}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Response Status:', response.status);
      console.log('📋 Full Response Data:', JSON.stringify(response.data, null, 2));
      console.log('═══════════════════════════════════════════════════════');

      if (response.data.success) {
        const posters = response.data.data?.posters || response.data.posters || [];
        console.log(`✅ [CALENDAR API] ${posters.length} poster(s) fetched for ${date}`);

        // Convert backend response to frontend format and fix URLs
        const baseUrl = 'https://eventmarketersbackend.onrender.com';
        const postersWithAbsoluteUrls = posters.map((poster: any) => {
          const thumbnailUrl = poster.thumbnailUrl || poster.thumbnail || poster.imageUrl;
          const imageUrl = poster.imageUrl || poster.thumbnailUrl || poster.thumbnail;

          return {
            id: poster.id,
            name: poster.name || poster.title || 'Calendar Poster',
            title: poster.title || poster.name,
            description: poster.description || '',
            thumbnail:
              thumbnailUrl && !thumbnailUrl.startsWith('http')
                ? `${baseUrl}${thumbnailUrl}`
                : thumbnailUrl,
            imageUrl:
              imageUrl && !imageUrl.startsWith('http') ? `${baseUrl}${imageUrl}` : imageUrl,
            category: poster.category || 'Festival',
            downloads: poster.downloads || 0,
            isDownloaded: poster.isDownloaded || false,
            tags: poster.tags || [],
            date: poster.date || date,
            festivalName: poster.festivalName || poster.festival?.name,
            festivalEmoji: poster.festivalEmoji || poster.festival?.emoji,
            createdAt: poster.createdAt,
            updatedAt: poster.updatedAt || poster.createdAt,
          } as CalendarPoster;
        });

        // Cache the results
        this.postersCache.set(cacheKey, {
          data: postersWithAbsoluteUrls,
          timestamp: now,
        });

        console.log(`✅ [CALENDAR API] Cached ${postersWithAbsoluteUrls.length} poster(s) for date: ${date}`);

        return {
          success: true,
          data: {
            posters: postersWithAbsoluteUrls,
            date,
            total: postersWithAbsoluteUrls.length,
          },
          message: 'Posters fetched successfully',
        };
      } else {
        console.log('⚠️ [CALENDAR API] Response Success = false');
        console.log('⚠️ Error from API:', response.data.error || response.data.message);
        throw new Error(response.data.error || response.data.message || 'Failed to fetch posters');
      }
    } catch (error: any) {
      console.error('❌ [CALENDAR API] Error fetching posters:', error.message);
      if (error.response) {
        console.error('   ↳ Status:', error.response.status);
        console.error('   ↳ Message:', error.response.data?.message);
      }

      // Return empty data when API fails (graceful degradation)
      return {
        success: false,
        data: {
          posters: [],
          date,
          total: 0,
        },
        message: error.response?.data?.message || 'No posters available for this date',
      };
    }
  }

  /**
   * Get posters for an entire month
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns CalendarMonthPostersResponse
   */
  async getPostersByMonth(
    year: number,
    month: number,
  ): Promise<CalendarMonthPostersResponse> {
    try {
      const cacheKey = `month_${year}_${month}`;
      const now = Date.now();

      // Check cache first
      if (this.postersCache.has(cacheKey)) {
        const cached = this.postersCache.get(cacheKey)!;
        const cacheAge = now - cached.timestamp;

        if (cacheAge < this.CACHE_DURATION) {
          console.log(`✅ [CALENDAR API] Returning cached posters for month: ${year}-${month}`);
          // Convert array to date-keyed object
          const postersByDate: { [date: string]: CalendarPoster[] } = {};
          cached.data.forEach((poster) => {
            if (!postersByDate[poster.date]) {
              postersByDate[poster.date] = [];
            }
            postersByDate[poster.date].push(poster);
          });

          return {
            success: true,
            data: {
              posters: postersByDate,
              month,
              year,
              total: cached.data.length,
            },
            message: 'Posters fetched from cache',
          };
        }
      }

      console.log(`📡 [CALENDAR API] Fetching posters for month: ${year}-${month}`);
      console.log(`📡 [CALENDAR API] Endpoint: /api/mobile/calendar/posters/month/${year}/${month}`);

      const response = await api.get(`/api/mobile/calendar/posters/month/${year}/${month}`);

      if (response.data.success) {
        const posters = response.data.data?.posters || response.data.posters || [];
        console.log(`✅ [CALENDAR API] ${posters.length} poster(s) fetched for month ${year}-${month}`);

        // Convert backend response to frontend format
        const baseUrl = 'https://eventmarketersbackend.onrender.com';
        const postersWithAbsoluteUrls = posters.map((poster: any) => {
          const thumbnailUrl = poster.thumbnailUrl || poster.thumbnail || poster.imageUrl;
          const imageUrl = poster.imageUrl || poster.thumbnailUrl || poster.thumbnail;

          return {
            id: poster.id,
            name: poster.name || poster.title || 'Calendar Poster',
            title: poster.title || poster.name,
            description: poster.description || '',
            thumbnail:
              thumbnailUrl && !thumbnailUrl.startsWith('http')
                ? `${baseUrl}${thumbnailUrl}`
                : thumbnailUrl,
            imageUrl:
              imageUrl && !imageUrl.startsWith('http') ? `${baseUrl}${imageUrl}` : imageUrl,
            category: poster.category || 'Festival',
            downloads: poster.downloads || 0,
            isDownloaded: poster.isDownloaded || false,
            tags: poster.tags || [],
            date: poster.date,
            festivalName: poster.festivalName || poster.festival?.name,
            festivalEmoji: poster.festivalEmoji || poster.festival?.emoji,
            createdAt: poster.createdAt,
            updatedAt: poster.updatedAt || poster.createdAt,
          } as CalendarPoster;
        });

        // Group posters by date
        const postersByDate: { [date: string]: CalendarPoster[] } = {};
        postersWithAbsoluteUrls.forEach((poster) => {
          if (!postersByDate[poster.date]) {
            postersByDate[poster.date] = [];
          }
          postersByDate[poster.date].push(poster);
        });

        // Cache all posters (flattened)
        this.postersCache.set(cacheKey, {
          data: postersWithAbsoluteUrls,
          timestamp: now,
        });

        return {
          success: true,
          data: {
            posters: postersByDate,
            month,
            year,
            total: postersWithAbsoluteUrls.length,
          },
          message: 'Posters fetched successfully',
        };
      } else {
        throw new Error(response.data.error || response.data.message || 'Failed to fetch posters');
      }
    } catch (error: any) {
      console.error('❌ [CALENDAR API] Error fetching month posters:', error.message);
      return {
        success: false,
        data: {
          posters: {},
          month,
          year,
          total: 0,
        },
        message: error.response?.data?.message || 'No posters available for this month',
      };
    }
  }

  /**
   * Clear cache for a specific date or all cache
   */
  clearCache(date?: string): void {
    if (date) {
      this.postersCache.delete(`date_${date}`);
      console.log(`🗑️ [CALENDAR API] Cleared cache for date: ${date}`);
    } else {
      this.postersCache.clear();
      console.log('🗑️ [CALENDAR API] Cleared all cache');
    }
  }
}

export default new CalendarApiService();

