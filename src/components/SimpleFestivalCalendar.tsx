import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

// Festival data with correct dates from Google Calendar 2025
const festivalDays: FestivalDays = {
  // January 2025
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
  
  // February 2025
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
  
  // March 2025
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
  
  // April 2025
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
  
  // May 2025
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
  
  // June 2025
  '2025-06-21': {
    name: 'International Yoga Day',
    emoji: '🧘',
    description: 'Celebration of yoga and wellness',
    color: '#FFB6C1',
  },
  '2025-06-29': {
    name: 'Guru Purnima',
    emoji: '👨‍🏫',
    description: 'Honoring spiritual teachers',
    color: '#DDA0DD',
  },
  
  // July 2025
  '2025-07-04': {
    name: 'Independence Day (US)',
    emoji: '🇺🇸',
    description: 'American Independence Day',
    color: '#FF6B6B',
  },
  '2025-07-13': {
    name: 'Guru Purnima',
    emoji: '👨‍🏫',
    description: 'Honoring spiritual teachers',
    color: '#DDA0DD',
  },
  
  // August 2025
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
  
  // September 2025
  '2025-09-07': {
    name: 'Ganesh Chaturthi',
    emoji: '🐘',
    description: 'Birth of Lord Ganesha',
    color: '#FF8C00',
  },
  '2025-09-17': {
    name: 'Ganesh Visarjan',
    emoji: '🌊',
    description: 'Immersion of Lord Ganesha',
    color: '#4ECDC4',
  },
  
  // October 2025
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
  
  // November 2025
  '2025-11-01': {
    name: 'Kartik Purnima',
    emoji: '🌕',
    description: 'Sacred full moon celebration',
    color: '#6BCF7F',
  },
  '2025-11-27': {
    name: 'Thanksgiving',
    emoji: '🦃',
    description: 'Day of gratitude and feasting',
    color: '#8B4513',
  },
  
  // December 2025
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

// Custom animated gradient border component for festival dates
const AnimatedGradientBorder: React.FC<{ 
  children: React.ReactNode; 
  festivalColor: string;
  isSelected: boolean;
  isCurrentDay: boolean;
}> = ({ children, festivalColor, isSelected, isCurrentDay }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 4000, // Slower, more elegant animation
          useNativeDriver: false,
        })
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  // Create professional gradient animation with sophisticated colors
  const gradientColors = animatedValue.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      '#667eea', // Professional Blue
      '#764ba2', // Deep Purple
      '#f093fb', // Soft Pink
      '#f5576c', // Coral Red
      '#4facfe', // Sky Blue
      '#667eea'  // Back to Professional Blue
    ],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.movingBorderContainer}>
      {/* Outer glow effect */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            borderColor: gradientColors,
            shadowColor: gradientColors,
            shadowOpacity: 0.3,
          },
        ]}
      />
      {/* Main border */}
      <Animated.View
        style={[
          styles.gradientBorder,
          {
            borderColor: gradientColors,
            borderWidth: isSelected ? 3 : 2.5,
            shadowColor: gradientColors,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 6,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const SimpleFestivalCalendar: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<FestivalData | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Debug: Log current month and year
  console.log(`📅 Calendar showing: ${monthNames[currentMonth]} ${currentYear}`);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Handle date selection
  const handleDateSelect = useCallback((day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
    
    // Check if selected date has a festival
    const festival = festivalDays[dateString];
    setSelectedFestival(festival || null);
  }, [currentMonth, currentYear]);

  // Check if date is today
  const isToday = useCallback((day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  }, [currentMonth, currentYear]);

  // Check if date has festival
  const hasFestival = useCallback((day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const festival = festivalDays[dateString];
    if (festival) {
      console.log(`🎉 Festival found for ${dateString}:`, festival.name);
    }
    return festival;
  }, [currentMonth, currentYear]);

  // Auto-scroll to today's date on component mount
  useEffect(() => {
    const today = new Date().getDate();
    const scrollToToday = () => {
      if (scrollViewRef.current) {
        const itemWidth = 68; // 60 width + 8 margin
        const scrollPosition = (today - 1) * itemWidth - screenWidth / 2 + itemWidth / 2;
        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }
    };
    
    // Delay to ensure the component is fully rendered
    setTimeout(scrollToToday, 100);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Festival Calendar
        </Text>
        <Text style={styles.subtitle}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
      </View>

      {/* Horizontal Scrollable Calendar */}
      <View style={styles.calendarContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCalendarContainer}
          style={styles.horizontalCalendarScroll}
        >
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const isSelected = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCurrentDay = isToday(day);
            const festival = hasFestival(day);
            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            return (
              <View key={day}>
                {festival ? (
                  <AnimatedGradientBorder
                    festivalColor={festival.color}
                    isSelected={isSelected}
                    isCurrentDay={isCurrentDay}
                  >
                    <TouchableOpacity
                      style={[
                        styles.horizontalDayCell,
                        isSelected && { backgroundColor: '#007AFF' },
                        isCurrentDay && !isSelected && { backgroundColor: 'rgba(0, 122, 255, 0.2)' },
                      ]}
                      onPress={() => handleDateSelect(day)}
                    >
                      <Text style={styles.dayNameText}>
                        {dayNames[dayOfWeek]}
                      </Text>
                      <Text
                        style={[
                          styles.horizontalDayText,
                          isSelected && { color: '#FFFFFF', fontWeight: 'bold' },
                          isCurrentDay && !isSelected && { color: '#FFD700', fontWeight: 'bold' },
                          { fontWeight: 'bold' },
                        ]}
                      >
                        {day}
                      </Text>
                      <View style={[styles.festivalDot, { backgroundColor: festival.color }]} />
                    </TouchableOpacity>
                  </AnimatedGradientBorder>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.horizontalDayCell,
                      isSelected && { backgroundColor: '#007AFF' },
                      isCurrentDay && !isSelected && { backgroundColor: 'rgba(0, 122, 255, 0.2)' },
                    ]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text style={styles.dayNameText}>
                      {dayNames[dayOfWeek]}
                    </Text>
                    <Text
                      style={[
                        styles.horizontalDayText,
                        isSelected && { color: '#FFFFFF', fontWeight: 'bold' },
                        isCurrentDay && !isSelected && { color: '#FFD700', fontWeight: 'bold' },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Date Information */}
      {selectedDate && (
        <View style={styles.infoContainer}>
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {selectedFestival ? (
            <View style={styles.festivalInfo}>
              <View style={styles.festivalEmojiContainer}>
                <Text style={styles.festivalEmoji}>{selectedFestival.emoji}</Text>
              </View>
              <View style={styles.festivalDetails}>
                <Text style={styles.festivalName}>
                  {selectedFestival.name}
                </Text>
                <Text style={styles.festivalDescription}>
                  {selectedFestival.description}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noFestivalContainer}>
              <Text style={styles.noFestivalText}>
                No festival today 🎉
              </Text>
              <Text style={styles.noFestivalSubtext}>
                Enjoy a peaceful day!
              </Text>
            </View>
          )}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Match HomeScreen section styling - transparent background
  },
  header: {
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth < 480 ? 14 : screenWidth < 768 ? 16 : Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: screenWidth < 480 ? 6 : screenWidth < 768 ? 8 : screenHeight * 0.015,
    paddingHorizontal: screenWidth < 480 ? 16 : screenWidth < 768 ? 20 : 24,
  },
  subtitle: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: screenHeight * 0.01,
  },
  calendarContainer: {
    marginBottom: screenHeight * 0.02,
    paddingHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : screenWidth * 0.05,
  },
  horizontalCalendarScroll: {
    maxHeight: 100,
  },
  horizontalCalendarContainer: {
    paddingHorizontal: screenWidth * 0.02,
    alignItems: 'center',
  },
  horizontalDayCell: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    position: 'relative',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  movingBorderContainer: {
    position: 'relative',
    width: 60,
    height: 80,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 66,
    height: 86,
    borderRadius: 15,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  gradientBorder: {
    width: 60,
    height: 80,
    borderRadius: 12,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  dayNameText: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    fontWeight: '500',
    marginBottom: 2,
    color: '#ffffff',
    opacity: 0.8,
  },
  horizontalDayText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '600',
    color: '#ffffff',
  },
  festivalDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infoContainer: {
    borderRadius: 12,
    padding: screenWidth * 0.04,
    marginBottom: screenHeight * 0.02,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: screenWidth < 480 ? 8 : screenWidth < 768 ? 12 : screenWidth * 0.05,
  },
  selectedDateText: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: screenHeight * 0.015,
    color: '#ffffff',
  },
  festivalInfo: {
    alignItems: 'center',
  },
  festivalEmojiContainer: {
    marginBottom: screenHeight * 0.01,
  },
  festivalEmoji: {
    fontSize: screenWidth * 0.12,
  },
  festivalDetails: {
    alignItems: 'center',
  },
  festivalName: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.005,
    textAlign: 'center',
    color: '#ffffff',
  },
  festivalDescription: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.05, 20),
    color: '#ffffff',
    opacity: 0.8,
  },
  noFestivalContainer: {
    alignItems: 'center',
    paddingVertical: screenHeight * 0.02,
  },
  noFestivalText: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: '600',
    marginBottom: screenHeight * 0.005,
    color: '#ffffff',
  },
  noFestivalSubtext: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    textAlign: 'center',
    color: '#ffffff',
    opacity: 0.8,
  },
});

export default SimpleFestivalCalendar;
