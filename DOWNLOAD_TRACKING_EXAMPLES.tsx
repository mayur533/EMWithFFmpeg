/**
 * DOWNLOAD TRACKING - QUICK REFERENCE EXAMPLES
 * 
 * Copy these examples to implement download tracking in your screens
 */

import { Alert } from 'react-native';
import { 
  trackPosterDownload, 
  trackTemplateDownload, 
  trackVideoDownload,
  trackGreetingDownload 
} from './src/utils/downloadHelper';

// ============================================================================
// EXAMPLE 1: Track Poster Download (PosterPlayerScreen, HomeScreen, etc.)
// ============================================================================
const handleDownloadPoster = async (poster: any) => {
  try {
    // Your existing download logic here
    const downloadedUrl = await downloadPosterToDevice(poster);
    
    // Track the download - JUST ADD THIS LINE
    await trackPosterDownload(
      poster.id,
      downloadedUrl,
      poster.title,
      poster.thumbnail,
      poster.category
    );
    
    Alert.alert('Success', 'Poster downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Error', 'Failed to download poster');
  }
};

// ============================================================================
// EXAMPLE 2: Track Template Download (TemplateGalleryScreen)
// ============================================================================
const handleDownloadTemplate = async (template: any) => {
  try {
    const downloadedUrl = await downloadTemplateToDevice(template);
    
    // Track the download
    await trackTemplateDownload(
      template.id,
      downloadedUrl,
      template.name,
      template.thumbnail,
      template.category
    );
    
    Alert.alert('Success', 'Template downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};

// ============================================================================
// EXAMPLE 3: Track Video Download (VideoPlayerScreen)
// ============================================================================
const handleDownloadVideo = async (video: any) => {
  try {
    const downloadedUrl = await downloadVideoToDevice(video);
    
    // Track the download
    await trackVideoDownload(
      video.id,
      downloadedUrl,
      video.title,
      video.thumbnail,
      video.category
    );
    
    Alert.alert('Success', 'Video downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};

// ============================================================================
// EXAMPLE 4: Track Greeting Download (GreetingTemplatesScreen)
// ============================================================================
const handleDownloadGreeting = async (greeting: any) => {
  try {
    const downloadedUrl = await downloadGreetingToDevice(greeting);
    
    // Track the download
    await trackGreetingDownload(
      greeting.id,
      downloadedUrl,
      greeting.name,
      greeting.thumbnail,
      greeting.category
    );
    
    Alert.alert('Success', 'Greeting downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};

// ============================================================================
// EXAMPLE 5: Generic Download with Manual Tracking
// ============================================================================
import { trackDownload } from './src/utils/downloadHelper';

const handleGenericDownload = async (content: any, type: 'POSTER' | 'TEMPLATE' | 'VIDEO' | 'GREETING') => {
  try {
    const downloadedUrl = await downloadContentToDevice(content);
    
    // Track with custom data
    await trackDownload(
      type,
      content.id,
      downloadedUrl,
      {
        title: content.title || content.name,
        thumbnail: content.thumbnail || content.imageUrl,
        category: content.category || 'General'
      }
    );
    
    Alert.alert('Success', 'Content downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};

// ============================================================================
// EXAMPLE 6: Download with Progress and Tracking
// ============================================================================
import { useState } from 'react';

const DownloadWithProgress = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDownload = async (poster: any) => {
    try {
      setDownloading(true);
      
      // Download with progress
      const downloadedUrl = await downloadWithProgress(
        poster.downloadUrl,
        (percent) => setProgress(percent)
      );
      
      // Track after successful download
      await trackPosterDownload(
        poster.id,
        downloadedUrl,
        poster.title,
        poster.thumbnail,
        poster.category
      );
      
      Alert.alert('Success', 'Poster downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download poster');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };
  
  return null; // Your UI components here
};

// ============================================================================
// EXAMPLE 7: Batch Download Multiple Items
// ============================================================================
const handleBatchDownload = async (posters: any[]) => {
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };
  
  for (const poster of posters) {
    try {
      const downloadedUrl = await downloadPosterToDevice(poster);
      
      // Track each download
      const tracked = await trackPosterDownload(
        poster.id,
        downloadedUrl,
        poster.title,
        poster.thumbnail,
        poster.category
      );
      
      if (tracked) {
        results.success.push(poster.title);
      }
    } catch (error) {
      console.error(`Failed to download ${poster.title}:`, error);
      results.failed.push(poster.title);
    }
  }
  
  Alert.alert(
    'Download Complete',
    `Successfully downloaded: ${results.success.length}\nFailed: ${results.failed.length}`
  );
};

// ============================================================================
// EXAMPLE 8: Check Download Status Before Downloading
// ============================================================================
import downloadTrackingService from './src/services/downloadTracking';
import authService from './src/services/auth';

const handleSmartDownload = async (poster: any) => {
  try {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      Alert.alert('Error', 'Please log in to download');
      return;
    }
    
    // Check if already downloaded
    const isDownloaded = await downloadTrackingService.isContentDownloaded(
      userId,
      'POSTER',
      poster.id
    );
    
    if (isDownloaded) {
      Alert.alert('Already Downloaded', 'You have already downloaded this poster');
      return;
    }
    
    // Download and track
    const downloadedUrl = await downloadPosterToDevice(poster);
    await trackPosterDownload(
      poster.id,
      downloadedUrl,
      poster.title,
      poster.thumbnail,
      poster.category
    );
    
    Alert.alert('Success', 'Poster downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
  }
};

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/*

WHERE TO ADD DOWNLOAD TRACKING:

1. ✅ PosterPlayerScreen.tsx
   - Find: handleDownload function
   - Add: await trackPosterDownload(...) after successful download

2. ✅ VideoPlayerScreen.tsx
   - Find: handleDownload function
   - Add: await trackVideoDownload(...) after successful download

3. ✅ TemplateGalleryScreen.tsx
   - Find: handleDownload function
   - Add: await trackTemplateDownload(...) after successful download

4. ✅ GreetingTemplatesScreen.tsx
   - Find: handleDownload function
   - Add: await trackGreetingDownload(...) after successful download

5. ✅ HomeScreen.tsx (if it has download feature)
   - Find: handleDownload function
   - Add appropriate tracking based on content type

6. ✅ MyBusinessScreen.tsx (if it has download feature)
   - Find: handleDownload function
   - Add appropriate tracking

ENDPOINTS SUMMARY:

Track Download:
POST /api/mobile/downloads/track

Get User Downloads:
GET /api/mobile/users/{userId}/downloads/all

Get Download Stats:
GET /api/mobile/users/{userId}/downloads/stats

*/

export {
  handleDownloadPoster,
  handleDownloadTemplate,
  handleDownloadVideo,
  handleDownloadGreeting,
  handleGenericDownload,
  handleBatchDownload,
  handleSmartDownload
};

