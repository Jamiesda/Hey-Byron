// app/(tabs)/calendar.tsx
// @ts-nocheck

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const backgroundPattern = require('../../assets/background.png');

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    router.push(`/?date=${day.dateString}`);
  };

  // Get current month and year for display
  const currentDate = new Date(selectedDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <ImageBackground 
      source={backgroundPattern} 
      style={styles.background}
      resizeMode="repeat"
    >
      {/* Inverted Gradient Overlay */}
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(43, 146, 168, 0.9)']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Calendar</Text>
          <Text style={styles.subHeader}>{monthName} {year}</Text>
        </View>
        
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: { 
                selected: true, 
                disableTouchEvent: true,
                selectedColor: '#D2B48C',
                selectedTextColor: '#000'
              },
            }}
            style={styles.calendar}
            theme={{
              calendarBackground: 'rgba(255, 255, 255, 0.1)',
              dayTextColor: '#ffffff',
              textSectionTitleColor: '#D2B48C',
              monthTextColor: '#ffffff',
              arrowColor: '#D2B48C',
              selectedDayBackgroundColor: '#D2B48C',
              selectedDayTextColor: '#000000',
              todayTextColor: '#D2B48C',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 15,
                  marginBottom: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                },
                dayHeader: {
                  marginTop: 2,
                  marginBottom: 7,
                  width: 32,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#D2B48C',
                },
              },
              'stylesheet.day.basic': {
                base: {
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                },
                text: {
                  marginTop: Platform.OS === 'android' ? 4 : 6,
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#ffffff',
                },
                today: {
                  backgroundColor: 'rgba(210, 180, 140, 0.2)',
                  borderWidth: 2,
                  borderColor: '#D2B48C',
                },
                selected: {
                  backgroundColor: '#D2B48C',
                },
              },
            }}
            hideExtraDays={true}
            disableMonthChange={false}
            firstDay={1}
            showWeekNumbers={false}
            enableSwipeMonths={true}
          />
        </View>
        
        <View style={styles.bottomContainer}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D2B48C' }]} />
              <Text style={styles.legendText}>Selected Date</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[
                styles.legendDot, 
                { 
                  backgroundColor: 'rgba(210, 180, 140, 0.2)', 
                  borderWidth: 2, 
                  borderColor: '#D2B48C' 
                }
              ]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
          
          <Text style={styles.instructionText}>
            Tap any date to view events for that day
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

CalendarScreen.options = { headerShown: false };

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 8,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
    marginTop: -5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#D2B48C',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  calendarContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendar: {
    backgroundColor: 'transparent',
    borderRadius: 15,
  },
  bottomContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionText: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});