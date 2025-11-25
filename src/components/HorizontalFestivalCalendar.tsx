import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import OptimizedImage from './OptimizedImage';
import { Template } from '../services/dashboard';

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

  // Use state for current date so it updates automatically
  const [currentDateState, setCurrentDateState] = useState(() => new Date());
  const currentMonth = currentDateState.getMonth();
  const currentYear = currentDateState.getFullYear();
  const currentDay = currentDateState.getDate();
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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
  const handleDateSelect = useCallback((day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
    
    // Get posters for the selected date
    const posters = datePosters[dateString] || [];
    setSelectedDatePosters(posters);
  }, [currentMonth, currentYear]);

  // Check if date is today
  const isToday = useCallback((day: number) => {
    return day === currentDay && 
           currentMonth === currentDateState.getMonth() && 
           currentYear === currentDateState.getFullYear();
  }, [currentDay, currentMonth, currentYear, currentDateState]);

  // Check if date has festival
  const hasFestival = useCallback((day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivalDays[dateString];
  }, [currentMonth, currentYear]);

  // Auto-scroll to today's date on component mount and when month changes
  useEffect(() => {
    const scrollToToday = () => {
      if (scrollViewRef.current) {
        const itemWidth = isTablet ? 70 : 60;
        const scrollPosition = (currentDay - 1) * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2;
        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }
    };
    
    setTimeout(scrollToToday, 100);
  }, [SCREEN_WIDTH, isTablet, currentDay, currentMonth, currentYear]);

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
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateString;
            const isCurrentDay = isToday(day);
            const festival = hasFestival(day);
            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isCurrentDay && styles.currentDayCell,
                  isSelected && styles.selectedDayCell,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
                onPress={() => handleDateSelect(day)}
                activeOpacity={0.7}
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
  dayCell: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 75 : 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    marginRight: moderateScale(4),
    paddingVertical: moderateScale(6),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  currentDayCell: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  selectedDayCell: {
    borderWidth: 2,
    borderColor: '#667eea',
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

