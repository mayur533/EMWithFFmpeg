import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import * as Animatable from 'react-native-animatable';
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

// Sample festival data with dates for 2024-2025 (using emojis instead of images)
const festivalDays: FestivalDays = {
  '2024-10-12': {
    name: 'Navratri',
    emoji: '🕉️',
    description: 'Nine nights of dance, devotion, and celebration',
    color: '#FF6B6B',
  },
  '2024-10-31': {
    name: 'Diwali',
    emoji: '🪔',
    description: 'Festival of lights and prosperity',
    color: '#FFD93D',
  },
  '2024-11-15': {
    name: 'Kartik Purnima',
    emoji: '🌕',
    description: 'Sacred full moon celebration',
    color: '#6BCF7F',
  },
  '2024-12-25': {
    name: 'Christmas',
    emoji: '🎄',
    description: 'Celebration of joy and giving',
    color: '#4ECDC4',
  },
  '2025-01-14': {
    name: 'Makar Sankranti',
    emoji: '🪁',
    description: 'Harvest festival and kite flying',
    color: '#45B7D1',
  },
  '2025-02-14': {
    name: 'Valentine\'s Day',
    emoji: '💕',
    description: 'Day of love and romance',
    color: '#FF9FF3',
  },
  '2025-03-10': {
    name: 'Holi',
    emoji: '🎨',
    description: 'Festival of colors and joy',
    color: '#FF6B9D',
  },
  '2025-04-14': {
    name: 'Baisakhi',
    emoji: '🌾',
    description: 'Spring harvest festival',
    color: '#96CEB4',
  },
  '2025-05-15': {
    name: 'Eid al-Fitr',
    emoji: '🌙',
    description: 'Festival of breaking the fast',
    color: '#A8E6CF',
  },
  '2025-06-21': {
    name: 'International Yoga Day',
    emoji: '🧘',
    description: 'Celebration of yoga and wellness',
    color: '#FFB6C1',
  },
};

const FestivalCalendarDemo: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<FestivalData | null>(null);

  // Handle date selection
  const handleDateSelect = useCallback((day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    
    // Check if selected date has a festival
    const festival = festivalDays[dateString];
    setSelectedFestival(festival || null);
  }, []);

  // Custom day component with animation for festival dates
  const renderCustomDay = useCallback((day: DateData) => {
    const dateString = day.dateString;
    const isFestival = festivalDays[dateString];
    const isSelected = selectedDate === dateString;

    if (isFestival) {
      return (
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={[
            styles.festivalDayContainer,
            { backgroundColor: isSelected ? theme.colors.primary : 'transparent' },
          ]}
        >
          <View
            style={[
              styles.festivalDayBorder,
              { borderColor: isFestival.color },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: isSelected ? '#FFFFFF' : theme.colors.text,
                  fontWeight: 'bold',
                },
              ]}
            >
              {day.day}
            </Text>
          </View>
        </Animatable.View>
      );
    }

    return (
      <View
        style={[
          styles.regularDayContainer,
          { backgroundColor: isSelected ? theme.colors.primary : 'transparent' },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.text,
            },
          ]}
        >
          {day.day}
        </Text>
      </View>
    );
  }, [selectedDate, theme.colors]);

  // Get marked dates for calendar highlighting
  const getMarkedDates = useCallback(() => {
    const marked: any = {};
    
    // Mark festival dates
    Object.keys(festivalDays).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: festivalDays[date].color,
        customStyles: {
          container: {
            backgroundColor: 'transparent',
          },
        },
      };
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    }

    return marked;
  }, [selectedDate, theme.colors.primary]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Festival Calendar
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Discover festivals and celebrations
        </Text>
      </View>

      <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }]}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.text,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textSecondary,
            dotColor: theme.colors.primary,
            selectedDotColor: '#FFFFFF',
            arrowColor: theme.colors.primary,
            disabledArrowColor: theme.colors.textSecondary,
            monthTextColor: theme.colors.text,
            indicatorColor: theme.colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          renderArrow={(direction) => (
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.primary }]}>
                {direction === 'left' ? '‹' : '›'}
              </Text>
            </View>
          )}
          customHeader={() => null}
          hideExtraDays={true}
          firstDay={1} // Start week with Monday
          showWeekNumbers={false}
          disableMonthChange={false}
          enableSwipeMonths={true}
        />
      </View>

      {/* Selected Date Information */}
      {selectedDate && (
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.dateHeader}>
            <Text style={[styles.selectedDateText, { color: theme.colors.text }]}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {selectedFestival ? (
            <View style={styles.festivalInfo}>
              <View style={styles.festivalEmojiContainer}>
                <View
                  style={[
                    styles.festivalEmojiBackground,
                    { backgroundColor: selectedFestival.color + '20' },
                  ]}
                >
                  <Text style={styles.festivalEmoji}>
                    {selectedFestival.emoji}
                  </Text>
                </View>
                <View
                  style={[
                    styles.festivalBadge,
                    { backgroundColor: selectedFestival.color },
                  ]}
                >
                  <Text style={styles.festivalBadgeText}>🎉</Text>
                </View>
              </View>

              <View style={styles.festivalDetails}>
                <Text style={[styles.festivalName, { color: theme.colors.text }]}>
                  {selectedFestival.name}
                </Text>
                <Text style={[styles.festivalDescription, { color: theme.colors.textSecondary }]}>
                  {selectedFestival.description}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noFestivalContainer}>
              <Text style={[styles.noFestivalText, { color: theme.colors.textSecondary }]}>
                No festival today 🎉
              </Text>
              <Text style={[styles.noFestivalSubtext, { color: theme.colors.textSecondary }]}>
                Enjoy a peaceful day!
              </Text>
            </View>
          )}
        </Animatable.View>
      )}

      {/* Festival Legend */}
      <View style={[styles.legendContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
          Upcoming Festivals
        </Text>
        <View style={styles.legendList}>
          {Object.entries(festivalDays)
            .filter(([date]) => new Date(date) >= new Date())
            .slice(0, 6)
            .map(([date, festival]) => (
              <TouchableOpacity
                key={date}
                style={styles.legendItem}
                onPress={() => handleDateSelect({ dateString: date, day: parseInt(date.split('-')[2]) })}
              >
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: festival.color },
                  ]}
                />
                <Text style={styles.legendEmoji}>{festival.emoji}</Text>
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendFestivalName, { color: theme.colors.text }]}>
                    {festival.name}
                  </Text>
                  <Text style={[styles.legendDate, { color: theme.colors.textSecondary }]}>
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenHeight * 0.02,
    paddingBottom: screenHeight * 0.01,
    alignItems: 'center',
  },
  title: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.005,
  },
  subtitle: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
  },
  calendarContainer: {
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
    borderRadius: 16,
    padding: screenWidth * 0.03,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  festivalDayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  festivalDayBorder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  regularDayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
    borderRadius: 16,
    padding: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateHeader: {
    marginBottom: screenHeight * 0.02,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '600',
    textAlign: 'center',
  },
  festivalInfo: {
    alignItems: 'center',
  },
  festivalEmojiContainer: {
    position: 'relative',
    marginBottom: screenHeight * 0.02,
  },
  festivalEmojiBackground: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: screenWidth * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  festivalEmoji: {
    fontSize: screenWidth * 0.15,
  },
  festivalBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  festivalBadgeText: {
    fontSize: 16,
  },
  festivalDetails: {
    alignItems: 'center',
  },
  festivalName: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.01,
    textAlign: 'center',
  },
  festivalDescription: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
    lineHeight: Math.min(screenWidth * 0.06, 24),
  },
  noFestivalContainer: {
    alignItems: 'center',
    paddingVertical: screenHeight * 0.03,
  },
  noFestivalText: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '600',
    marginBottom: screenHeight * 0.01,
  },
  noFestivalSubtext: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    textAlign: 'center',
  },
  legendContainer: {
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
    borderRadius: 16,
    padding: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.02,
    textAlign: 'center',
  },
  legendList: {
    gap: screenHeight * 0.01,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: screenHeight * 0.008,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: screenWidth * 0.03,
  },
  legendEmoji: {
    fontSize: 20,
    marginRight: screenWidth * 0.03,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendFestivalName: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '600',
  },
  legendDate: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    marginTop: 2,
  },
});

export default FestivalCalendarDemo;
