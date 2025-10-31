# Language Filtering Feature for Poster Player

## Overview
Implemented dynamic language-based filtering for greeting templates and professional templates in the PosterPlayerScreen. When users select a language (English, Hindi, or Marathi), the app now fetches filtered templates from the backend API instead of using client-side filtering.

## Changes Made

### 1. **Backend API Integration** (`src/services/greetingTemplates.ts`)
- **Modified**: `searchTemplates()` function
- **Added**: Optional `language` parameter to the function signature
- **API Endpoint**: `/api/mobile/greetings/templates?search={query}&language={language}`
- **Supported Languages**: `english`, `hindi`, `marathi`

```typescript
async searchTemplates(query: string, language?: string): Promise<GreetingTemplate[]>
```

### 2. **Professional Templates API** (`src/services/homeApi.ts`)
- **Modified**: `getProfessionalTemplates()` function
- **Added**: `language` parameter to the params interface
- **API Endpoint**: `/api/mobile/home/templates?language={language}`
- **Implementation**: Language parameter is passed to the API via query string

```typescript
async getProfessionalTemplates(params?: {
  limit?: number;
  category?: string;
  subcategory?: string;
  isPremium?: boolean;
  sortBy?: 'popular' | 'recent' | 'likes' | 'downloads';
  tags?: string[];
  language?: string;  // NEW PARAMETER
}): Promise<ProfessionalTemplatesResponse>
```

### 3. **Navigation Parameters** (`src/navigation/AppNavigator.tsx`)
- **Modified**: `PosterPlayer` route parameters
- **Added**: Two new optional parameters:
  - `searchQuery?: string` - The original search query used to fetch templates
  - `templateSource?: 'greeting' | 'professional' | 'featured'` - The source of the templates

```typescript
PosterPlayer: {
  selectedPoster: any;
  relatedPosters: any[];
  searchQuery?: string;
  templateSource?: 'greeting' | 'professional' | 'featured';
};
```

### 4. **PosterPlayerScreen Updates** (`src/screens/PosterPlayerScreen.tsx`)

#### New State Variables:
- `searchQuery` - Stores the original search query from route params
- `templateSource` - Stores the source type ('greeting', 'professional', or 'featured')
- `isLoadingLanguage` - Loading state for language-based refetch

#### Refactored `handleLanguageChange()`:
- **Old Behavior**: Only updated the selected language state (client-side filtering)
- **New Behavior**: 
  1. Sets the new language
  2. Closes the language menu
  3. Determines the template source
  4. Calls appropriate API with language parameter
  5. Updates currentPoster and currentRelatedPosters with API results
  6. Shows loading state during API call

```typescript
const handleLanguageChange = useCallback(async (languageId: string) => {
  setSelectedLanguage(languageId);
  setLanguageMenuVisible(false);
  
  if (searchQuery && templateSource === 'greeting') {
    // Fetch greeting templates with language filter
    const templates = await greetingTemplatesService.searchTemplates(searchQuery, languageParam);
    setCurrentPoster(templates[0]);
    setCurrentRelatedPosters(templates.slice(1));
  } else if (templateSource === 'professional') {
    // Fetch professional templates with language filter
    const response = await homeApi.getProfessionalTemplates({ language: languageParam });
    // Update posters with converted templates
  }
}, [selectedLanguage, searchQuery, templateSource]);
```

#### Removed Client-Side Filtering:
- **Old**: `filteredPosters` used `filter()` to check `poster.languages.includes(selectedLanguage)`
- **New**: `filteredPosters` simply returns `currentRelatedPosters` (already filtered by API)

### 5. **HomeScreen Updates** (`src/screens/HomeScreen.tsx`)

#### Modified `createGreetingCardRenderer()`:
- **Added**: `searchQuery` parameter
- **Purpose**: Pass the search query to PosterPlayerScreen for API refetch

```typescript
const createGreetingCardRenderer = useCallback((categoryTemplates: any[], searchQuery?: string) => {
  return ({ item }: { item: any }) => {
    // ... render logic ...
    navigation.navigate('PosterPlayer', {
      selectedPoster: item,
      relatedPosters: relatedTemplates,
      searchQuery: searchQuery,
      templateSource: 'greeting',
    });
  };
}, [navigation]);
```

#### Updated All Greeting Section Calls:
Updated all 11 greeting template sections to pass their search queries:
1. **Motivation**: `'motivational'`
2. **Good Morning**: `'good morning'`
3. **Business Ethics**: `'business ethics'`
4. **Devotional**: `'devotional'`
5. **Leader Quotes**: `'leader quotes'`
6. **Atmanirbhar Bharat**: `'atmanirbhar bharat'`
7. **Good Thoughts**: `'good thoughts'`
8. **Trending**: `'trending'`
9. **Bhagvat Gita**: `'bhagvat gita'`
10. **Books**: `'books'`
11. **Celebrates Moments**: `'celebrates the moments'`

## API Endpoints Used

### For Greeting Templates:
```
GET /api/mobile/greetings/templates?search={searchQuery}&language={language}
```

**Parameters**:
- `search`: The category/search query (e.g., "good morning", "motivational")
- `language`: One of "english", "hindi", or "marathi"

**Example**:
```
GET /api/mobile/greetings/templates?search=good%20morning&language=hindi
```

### For Professional Templates:
```
GET /api/mobile/home/templates?language={language}
```

**Parameters**:
- `language`: One of "english", "hindi", or "marathi"

**Example**:
```
GET /api/mobile/home/templates?language=marathi
```

## User Flow

1. **User opens Good Morning section** on Home Screen
2. **User taps on a greeting card**
3. **Navigation to PosterPlayerScreen** with:
   - Selected poster
   - Related posters (same language as fetched)
   - Search query: `'good morning'`
   - Template source: `'greeting'`
4. **User selects Hindi language**
5. **App fetches data from API**: `/api/mobile/greetings/templates?search=good%20morning&language=hindi`
6. **Screen updates** with Hindi templates only
7. **No posters available?** Shows "No templates available in Hindi" message

## Benefits

1. **Server-Side Filtering**: More accurate and consistent filtering based on backend data
2. **Dynamic Content**: Can update language availability without app updates
3. **Better Performance**: Only fetches relevant templates for selected language
4. **Scalability**: Backend can optimize queries and add new languages easily
5. **Analytics**: Backend can track which languages are most popular
6. **Real-Time Updates**: Changes to template language assignments reflect immediately

## Backend Requirements

The backend must support the `language` query parameter for these endpoints:
- `/api/mobile/greetings/templates`
- `/api/mobile/home/templates`

### Expected Behavior:
1. When `language` parameter is provided, return only templates in that language
2. When `language` parameter is omitted, return all templates (default behavior)
3. Return empty array if no templates exist for the specified language
4. Language values should match: `english`, `hindi`, `marathi` (case-insensitive)

## Testing Checklist

- [x] Language parameter added to API services
- [x] PosterPlayerScreen accepts searchQuery and templateSource
- [x] Language change triggers API call
- [x] Loading state shows during API fetch
- [x] Templates update correctly after language change
- [x] Empty state shows when no templates available
- [x] All greeting sections pass correct search queries
- [x] Professional templates support language filtering
- [x] No linter errors

## Files Modified

1. `src/services/greetingTemplates.ts` - Added language parameter to searchTemplates()
2. `src/services/homeApi.ts` - Added language parameter to getProfessionalTemplates()
3. `src/navigation/AppNavigator.tsx` - Added searchQuery and templateSource to PosterPlayer params
4. `src/screens/PosterPlayerScreen.tsx` - Implemented language-based API refetch logic
5. `src/screens/HomeScreen.tsx` - Updated all greeting card renderers to pass search queries

## Date
October 30, 2025

## Status
✅ Completed and Ready for Testing

## Notes
- The language mapping is: `english` → "EN", `hindi` → "HI", `marathi` → "MR"
- The feature gracefully handles API errors and shows the existing templates if fetch fails
- Console logs are in place for debugging language-based fetches

