import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import OptimizedImage from './OptimizedImage';
import { Template } from '../services/dashboard';
import calendarApi from '../services/calendarApi';
import LinearGradient from 'react-native-linear-gradient';

// Festival data structure
interface FestivalData {
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface FestivalDays {
  [date: string]: FestivalData;
}

interface DatePosters {
  [date: string]: Template[];
}

// Festival data with correct dates from Google Calendar 2025
const festivalDays: FestivalDays = {
  '2025-01-01': {
    name: 'New Year\'s Day',
    emoji: '🎊',
    description: 'Welcome the new year with celebration',
    color: '#FF6B6B',
  },
  '2025-01-14': {
    name: 'Makar Sankranti',
    emoji: '🪁',
    description: 'Harvest festival and kite flying',
    color: '#45B7D1',
  },
  '2025-01-26': {
    name: 'Republic Day',
    emoji: '🇮🇳',
    description: 'Celebrating India\'s constitution',
    color: '#FFD93D',
  },
  '2025-02-14': {
    name: 'Valentine\'s Day',
    emoji: '💕',
    description: 'Day of love and romance',
    color: '#FF9FF3',
  },
  '2025-02-18': {
    name: 'Maha Shivaratri',
    emoji: '🕉️',
    description: 'Great night of Lord Shiva',
    color: '#6BCF7F',
  },
  '2025-03-01': {
    name: 'Holi Dahan',
    emoji: '🔥',
    description: 'Bonfire celebration before Holi',
    color: '#FF8C00',
  },
  '2025-03-02': {
    name: 'Holi',
    emoji: '🎨',
    description: 'Festival of colors and joy',
    color: '#FF6B9D',
  },
  '2025-03-30': {
    name: 'Ram Navami',
    emoji: '🕉️',
    description: 'Birth of Lord Rama',
    color: '#4ECDC4',
  },
  '2025-04-13': {
    name: 'Baisakhi',
    emoji: '🌾',
    description: 'Spring harvest festival',
    color: '#96CEB4',
  },
  '2025-04-14': {
    name: 'Ambedkar Jayanti',
    emoji: '📚',
    description: 'Birth anniversary of Dr. B.R. Ambedkar',
    color: '#9370DB',
  },
  '2025-05-01': {
    name: 'Labour Day',
    emoji: '👷',
    description: 'International Workers\' Day',
    color: '#FF6B6B',
  },
  '2025-05-12': {
    name: 'Eid al-Fitr',
    emoji: '🌙',
    description: 'Festival of breaking the fast',
    color: '#A8E6CF',
  },
  '2025-05-13': {
    name: 'Buddha Purnima',
    emoji: '🧘',
    description: 'Birth of Lord Buddha',
    color: '#FFB6C1',
  },
  '2025-06-21': {
    name: 'International Yoga Day',
    emoji: '🧘',
    description: 'Celebration of yoga and wellness',
    color: '#FFB6C1',
  },
  '2025-08-15': {
    name: 'Independence Day',
    emoji: '🇮🇳',
    description: 'India\'s Independence Day',
    color: '#FFD93D',
  },
  '2025-08-26': {
    name: 'Raksha Bandhan',
    emoji: '🎀',
    description: 'Bond of protection between siblings',
    color: '#FF69B4',
  },
  '2025-08-30': {
    name: 'Janmashtami',
    emoji: '🕉️',
    description: 'Birth of Lord Krishna',
    color: '#9370DB',
  },
  '2025-09-07': {
    name: 'Ganesh Chaturthi',
    emoji: '🐘',
    description: 'Birth of Lord Ganesha',
    color: '#FF8C00',
  },
  '2025-10-02': {
    name: 'Gandhi Jayanti',
    emoji: '🕊️',
    description: 'Birth anniversary of Mahatma Gandhi',
    color: '#32CD32',
  },
  '2025-10-03': {
    name: 'Navratri Starts',
    emoji: '🕉️',
    description: 'Nine nights of dance, devotion, and celebration',
    color: '#FF6B6B',
  },
  '2025-10-12': {
    name: 'Dussehra',
    emoji: '⚔️',
    description: 'Victory of good over evil',
    color: '#FF8C00',
  },
  '2025-10-20': {
    name: 'Diwali',
    emoji: '🪔',
    description: 'Festival of lights and prosperity',
    color: '#FFD93D',
  },
  '2025-10-21': {
    name: 'Govardhan Puja',
    emoji: '🏔️',
    description: 'Worship of Govardhan Hill',
    color: '#6BCF7F',
  },
  '2025-10-22': {
    name: 'Bhai Dooj',
    emoji: '👫',
    description: 'Brother-sister bond celebration',
    color: '#FF9FF3',
  },
  '2025-12-25': {
    name: 'Christmas',
    emoji: '🎄',
    description: 'Celebration of joy and giving',
    color: '#4ECDC4',
  },
  '2025-12-31': {
    name: 'New Year\'s Eve',
    emoji: '🎊',
    description: 'Ring in the new year',
    color: '#FF6B6B',
  },
};

// Mock poster data - in production, this would come from an API
const datePosters: DatePosters = {
  '2025-01-01': [
    {
      id: '1',
      name: 'New Year Celebration',
      thumbnail: 'https://picsum.photos/300/400?random=1',
      category: 'New Year',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
    {
      id: '2',
      name: 'Happy New Year 2025',
      thumbnail: 'https://picsum.photos/300/400?random=2',
      category: 'Celebration',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
  '2025-01-14': [
    {
      id: '3',
      name: 'Makar Sankranti Wishes',
      thumbnail: 'https://picsum.photos/300/400?random=3',
      category: 'Festival',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
  '2025-01-26': [
    {
      id: '4',
      name: 'Republic Day Pride',
      thumbnail: 'https://picsum.photos/300/400?random=4',
      category: 'National',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
  '2025-03-02': [
    {
      id: '6',
      name: 'Holi Colors',
      thumbnail: 'https://picsum.photos/300/400?random=6',
      category: 'Festival',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
  '2025-10-20': [
    {
      id: '8',
      name: 'Diwali Lights',
      thumbnail: 'https://picsum.photos/300/400?random=8',
      category: 'Festival',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
  '2025-12-25': [
    {
      id: '10',
      name: 'Merry Christmas',
      thumbnail: 'https://picsum.photos/300/400?random=10',
      category: 'Christmas',
      downloads: 0,
      isDownloaded: false,
      tags: [],
    },
  ],
};

// Get screen dimensions and helper functions
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

const moderateScale = (size: number, factor = 0.5) => {
  const scale = (s: number) => (SCREEN_WIDTH / 375) * s;
  return size + (scale(size) - size) * factor;
};

const HorizontalFestivalCalendar: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDatePosters, setSelectedDatePosters] = useState<Template[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const borderAnimation = useRef(new Animated.Value(0)).current;

  const gradientColors = [theme.colors.secondary, theme.colors.primary];
  const borderThickness = 2.5;
  const borderInset = borderThickness + 1.2;

  const rotation = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    borderAnimation.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [borderAnimation]);

  // Use state for current date so it updates automatically
  const [currentDateState, setCurrentDateState] = useState(() => new Date());
  
  // Generate dates from today to 15 days forward
  const upcomingDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    const dates: Date[] = [];
    for (let i = 0; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDateState]);

  // Update current date periodically to handle month changes
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDateState(now);
    };

    // Update immediately
    updateDate();

    // Check every hour if the date has changed (handles day/month changes)
    const interval = setInterval(() => {
      updateDate();
    }, 3600000); // Check every hour (3600000ms)

    return () => clearInterval(interval);
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
    
    // First, try to get from mock data (fallback)
    const mockPosters = datePosters[dateString] || [];
    if (mockPosters.length > 0) {
      setSelectedDatePosters(mockPosters);
    }
    
    // Fetch posters from API
    try {
      const response = await calendarApi.getPostersByDate(dateString);
      if (response.success && response.data.posters.length > 0) {
        // Convert CalendarPoster to Template format
        const templates: Template[] = response.data.posters.map((poster) => ({
          id: poster.id,
          name: poster.name || poster.title || 'Calendar Poster',
          thumbnail: poster.thumbnail,
          category: poster.category || 'Festival',
          downloads: poster.downloads || 0,
          isDownloaded: poster.isDownloaded || false,
          tags: poster.tags || [],
        }));
        setSelectedDatePosters(templates);
      } else if (mockPosters.length === 0) {
        // Only clear if no mock data available
        setSelectedDatePosters([]);
      }
    } catch (error) {
      console.error('❌ [CALENDAR] Error fetching calendar posters:', error);
      // Keep mock data if API fails
      if (mockPosters.length === 0) {
        setSelectedDatePosters([]);
      }
    }
  }, []);

  // Check if date is today
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  }, []);

  // Check if date has festival
  const hasFestival = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivalDays[dateString];
  }, []);

  // Auto-scroll to today's date on component mount
  useEffect(() => {
    const scrollToToday = () => {
      if (scrollViewRef.current) {
        const itemWidth = isTablet ? 70 : 60;
        // Today is always the first item (index 0)
        const scrollPosition = 0 * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2;
        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }
    };
    
    setTimeout(scrollToToday, 100);
  }, [SCREEN_WIDTH, isTablet]);

  // Pre-load posters for upcoming dates (optional - improves performance)
  useEffect(() => {
    const loadUpcomingPosters = async () => {
      try {
        // Pre-load posters for all upcoming dates
        const loadPromises = upcomingDates.map(async (date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          try {
            await calendarApi.getPostersByDate(dateString);
          } catch (error) {
            // Silently fail for individual dates
          }
        });
        await Promise.allSettled(loadPromises);
      } catch (error) {
        // Silently fail - this is just a performance optimization
        if (__DEV__) {
          console.log('⚠️ [CALENDAR] Could not pre-load upcoming posters (this is okay)');
        }
      }
    };
    
    loadUpcomingPosters();
  }, [upcomingDates]);

  const renderPosterCard = useCallback(({ item }: { item: Template }) => {
    const cardWidth = SCREEN_WIDTH * 0.28;
    
    return (
      <TouchableOpacity
        style={[styles.posterCard, { width: cardWidth }]}
        activeOpacity={0.8}
      >
        <View style={styles.posterImageContainer}>
          <OptimizedImage 
            uri={item.thumbnail} 
            style={styles.posterImage} 
            resizeMode="cover" 
          />
        </View>
        <View style={styles.posterInfo}>
          <Text style={[styles.posterTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.posterCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme, SCREEN_WIDTH]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontWeight: 'bold' }]}>
          Festivals
        </Text>
      </View>

      {/* Horizontal Scrollable Calendar */}
      <View style={styles.calendarContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScrollContent}
        >
          {upcomingDates.map((date) => {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateString;
            const isCurrentDay = isToday(date);
            const festival = hasFestival(date);
            const dayOfWeek = date.getDay();

            const dayCellStyles = [
              styles.dayCell,
              { backgroundColor: theme.colors.cardBackground },
            ];

            if (isCurrentDay) {
              dayCellStyles.push(styles.currentDayCell, styles.dayCellFill);
            }

            if (isSelected) {
              dayCellStyles.push(isCurrentDay ? styles.selectedCurrentDayCell : styles.selectedDayCell);
            }

            const dayContent = (
              <View
                style={dayCellStyles}
              >
                <Text style={[styles.dayNameText, { color: theme.colors.textSecondary }]}>
                  {dayNames[dayOfWeek]}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: theme.colors.text },
                    isSelected && { color: theme.colors.primary, fontWeight: 'bold' },
                    isCurrentDay && !isSelected && { color: theme.colors.primary },
                  ]}
                >
                  {day}
                </Text>
                {festival && (
                  <View style={[styles.festivalDot, { backgroundColor: festival.color }]} />
                )}
              </View>
            );

            return (
              <TouchableOpacity
                key={dateString}
                onPress={() => handleDateSelect(date)}
                activeOpacity={0.7}
                style={styles.dayTouchable}
              >
                {isCurrentDay ? (
                  <View style={styles.gradientBorderWrapper}>
                    <Animated.View
                      style={[
                        styles.runningBorderOverlay,
                        {
                          transform: [{ rotate: rotation }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          gradientColors[0],
                          '#ffffff',
                          gradientColors[1],
                          'rgba(255,255,255,0.6)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBorderFill}
                      />
                    </Animated.View>
                    <View
                      style={[
                        styles.gradientBorderInner,
                        {
                          backgroundColor: theme.colors.cardBackground,
                          top: borderInset,
                          bottom: borderInset,
                          left: borderInset,
                          right: borderInset,
                        },
                      ]}
                    >
                      {dayContent}
                    </View>
                  </View>
                ) : (
                  dayContent
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Date Posters Section */}
      {selectedDate && selectedDatePosters.length > 0 && (
        <View style={styles.postersSection}>
          <FlatList
            data={selectedDatePosters}
            renderItem={renderPosterCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postersList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(8),
  },
  sectionHeader: {
    marginBottom: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: moderateScale(10),
  },
  calendarScrollContent: {
    paddingHorizontal: moderateScale(3),
  },
  dayTouchable: {
    marginRight: moderateScale(4),
  },
  dayCell: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 75 : 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(6),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  currentDayCell: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  dayCellFill: {
    width: '100%',
    height: '100%',
  },
  selectedDayCell: {
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  selectedCurrentDayCell: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  dayNameText: {
    fontSize: moderateScale(9),
    fontWeight: '500',
    marginBottom: moderateScale(2),
  },
  dayNumberText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  festivalDot: {
    position: 'absolute',
    bottom: moderateScale(4),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  gradientBorderWrapper: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 75 : 65,
    borderRadius: moderateScale(10),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientBorderInner: {
    position: 'absolute',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  runningBorderOverlay: {
    position: 'absolute',
    width: isTablet ? 60 : 50,
    height: isTablet ? 75 : 65,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  gradientBorderFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(12),
  },
  postersSection: {
    marginTop: moderateScale(10),
    paddingHorizontal: moderateScale(3),
  },
  postersList: {
    paddingVertical: moderateScale(5),
  },
  posterCard: {
    marginRight: moderateScale(8),
    backgroundColor: 'transparent',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  posterImageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    marginBottom: moderateScale(4),
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterInfo: {
    paddingHorizontal: moderateScale(4),
  },
  posterTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginBottom: moderateScale(2),
  },
  posterCategory: {
    fontSize: moderateScale(9),
  },
});

export default HorizontalFestivalCalendar;

