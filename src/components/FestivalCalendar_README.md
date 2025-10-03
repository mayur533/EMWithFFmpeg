# FestivalCalendar Component

A comprehensive React Native calendar component that displays festivals with animated borders and detailed information.

## Features

- ✅ **Calendar Integration**: Uses `react-native-calendars` for smooth calendar functionality
- ✅ **Festival Detection**: Automatically highlights festival dates with animated borders
- ✅ **Pulse Animation**: Festival dates have animated pulse borders using `react-native-animatable`
- ✅ **Date Selection**: Click on any date to see festival information or "No festival today"
- ✅ **Responsive Design**: Adapts to different screen sizes and orientations
- ✅ **Theme Support**: Integrates with your app's theme system
- ✅ **Festival Legend**: Shows upcoming festivals with color-coded indicators
- ✅ **Clean UI**: Modern, clean interface with proper spacing and shadows

## Installation

### Required Dependencies

```bash
npm install react-native-calendars react-native-animatable
# or
yarn add react-native-calendars react-native-animatable
```

### iOS Setup (if needed)

```bash
cd ios && pod install
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import { View } from 'react-native';
import FestivalCalendar from './components/FestivalCalendar';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <FestivalCalendar />
    </View>
  );
};
```

### With Theme Context

```tsx
import React from 'react';
import { View } from 'react-native';
import FestivalCalendar from './components/FestivalCalendar';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <FestivalCalendar />
      </View>
    </ThemeProvider>
  );
};
```

## Component Variants

### 1. FestivalCalendar (with Images)
- Uses actual festival images
- Requires festival images in `src/assets/festivals/` directory
- More visually appealing with real photos

### 2. FestivalCalendarDemo (with Emojis)
- Uses emojis instead of images
- No external image dependencies
- Perfect for testing and development

## Festival Data Structure

```typescript
interface FestivalData {
  name: string;
  image: any; // or emoji: string for demo version
  description: string;
  color: string;
}

interface FestivalDays {
  [date: string]: FestivalData;
}
```

## Customizing Festivals

### Adding New Festivals

```typescript
const festivalDays: FestivalDays = {
  '2024-12-31': {
    name: 'New Year\'s Eve',
    emoji: '🎊', // or image: require('../assets/festivals/new-year.jpg')
    description: 'Ring in the new year with celebration',
    color: '#FF6B6B',
  },
  // ... more festivals
};
```

### Updating Festival Information

```typescript
// Update existing festival
festivalDays['2024-10-31'] = {
  name: 'Diwali - Festival of Lights',
  emoji: '🪔',
  description: 'Celebrate the victory of light over darkness',
  color: '#FFD93D',
};
```

## Styling Customization

### Theme Integration

The component automatically adapts to your theme:

```typescript
const { theme } = useTheme();
// Component uses:
// - theme.colors.background
// - theme.colors.surface
// - theme.colors.text
// - theme.colors.textSecondary
// - theme.colors.primary
```

### Custom Colors

```typescript
// Festival colors are customizable
const festivalColors = {
  '2024-10-31': '#FFD93D', // Diwali - Gold
  '2024-12-25': '#4ECDC4', // Christmas - Teal
  '2025-03-10': '#FF6B9D', // Holi - Pink
};
```

## Animation Customization

### Pulse Animation

```typescript
<Animatable.View
  animation="pulse"
  iterationCount="infinite"
  duration={2000} // 2 seconds per pulse
  style={styles.festivalDayContainer}
>
```

### Fade Animation

```typescript
<Animatable.View
  animation="fadeInUp"
  duration={500} // 0.5 seconds fade in
  style={styles.infoContainer}
>
```

## Responsive Design

The component uses responsive utilities:

```typescript
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive font sizes
fontSize: Math.min(screenWidth * 0.08, 32)

// Responsive spacing
paddingHorizontal: screenWidth * 0.05
```

## Performance Considerations

- **Memoized Callbacks**: Uses `useCallback` for event handlers
- **Optimized Rendering**: Custom day components only re-render when necessary
- **Efficient Marking**: Marked dates are calculated once and memoized

## Troubleshooting

### Common Issues

1. **Images not loading**
   - Ensure images are in the correct directory
   - Check image file names match exactly
   - Use the demo version with emojis for testing

2. **Animation not working**
   - Verify `react-native-animatable` is installed
   - Check for any conflicting animations

3. **Theme not applying**
   - Ensure `ThemeProvider` wraps your app
   - Check theme context implementation

### Debug Mode

Add console logs to track festival data:

```typescript
console.log('Festival data:', festivalDays);
console.log('Selected date:', selectedDate);
console.log('Selected festival:', selectedFestival);
```

## Example Integration

### In Navigation

```tsx
// AppNavigator.tsx
import FestivalCalendarScreen from './screens/FestivalCalendarScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FestivalCalendar" 
        component={FestivalCalendarScreen}
        options={{ title: 'Festival Calendar' }}
      />
    </Stack.Navigator>
  );
};
```

### In Tab Navigation

```tsx
// TabNavigator.tsx
import FestivalCalendarScreen from './screens/FestivalCalendarScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Calendar" 
        component={FestivalCalendarScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
```

## Future Enhancements

- [ ] Add festival categories (religious, national, cultural)
- [ ] Implement festival search functionality
- [ ] Add festival reminders/notifications
- [ ] Support for multiple languages
- [ ] Integration with calendar apps
- [ ] Festival sharing functionality
- [ ] Custom festival creation by users

## License

This component is part of the EventMarketers React Native application.
