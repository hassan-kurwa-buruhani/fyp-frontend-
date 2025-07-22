import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// 🔘 Custom Dot Indicator - Glowing feel
const Dots = ({ selected }) => (
  <View
    style={{
      width: selected ? 10 : 8,
      height: selected ? 10 : 8,
      borderRadius: 5,
      marginHorizontal: 4,
      backgroundColor: selected ? '#FF6B81' : '#FFD6DD',
      shadowColor: '#FF6B81',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: selected ? 0.6 : 0,
      shadowRadius: 4,
    }}
  />
);

// 🎞️ OCR & AI Animation with Fade Effect
const OCRAndAIAnimation = () => {
  const [showAI, setShowAI] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowAI(prev => !prev);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <LottieView
        source={
          showAI
            ? require('../assets/exams-onboarding.json') // AI
            : require('../assets/onboarding2.json')      // OCR
        }
        autoPlay
        loop
        style={{ width: width * 0.9, height: 320 }}
      />
    </Animated.View>
  );
};

// 📱 Modern page styling
const styledPage = (imageComponent, titleText, subtitleText, backgroundColor) => ({
  backgroundColor,
  image: imageComponent,
  title: (
    <Text
      style={{
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        paddingHorizontal: 25,
        letterSpacing: 0.3,
      }}
    >
      {titleText}
    </Text>
  ),
  subtitle: (
    <Text
      style={{
        fontSize: 17,
        fontWeight: '500',
        color: '#475569',
        textAlign: 'center',
        paddingHorizontal: 25,
        marginTop: 14,
        lineHeight: 24,
      }}
    >
      {subtitleText}
    </Text>
  ),
});

const OnboardingScreen = () => {
  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@viewedOnboarding', 'true');
    router.replace('/login');
  };

  return (
    <Onboarding
      DotComponent={Dots}
      onDone={completeOnboarding}
      onSkip={completeOnboarding}
      skipLabel="Skip"
      nextLabel="Next"
      doneLabel="Get Started"
      bottomBarHighlight={false}
      bottomBarHeight={80}
      transitionAnimationDuration={300}
      pages={[
        styledPage(
          <LottieView
            source={require('../assets/exams-onboarding1.json')}
            autoPlay
            loop
            style={{ width: width * 0.9, height: 320 }}
          />,
          'Welcome to Exam Portal',
          'Streamline your exams, save time, and make grading smarter.',
          '#FFEDED' // Soft red-pink
        ),
        styledPage(
          <OCRAndAIAnimation />,
          'Powered by OCR & AI',
          'Automatically detect answers and score in seconds with intelligent technology.',
          '#E0F7FA' // Light cyan-blue
        ),
        styledPage(
          <LottieView
            source={require('../assets/exams.json')}
            autoPlay
            loop
            style={{ width: width * 0.9, height: 320 }}
          />,
          'A new way to grade exams',
          'Save time and Energy, Reduce bias and speed up your academic workflow.',
          '#FDF6EC' // Warm cream
        ),
        styledPage(
          <LottieView
            source={require('../assets/exams-onboarding4.json')}
            autoPlay
            loop
            style={{ width: width * 0.9, height: 320 }}
          />,
          'Smart Reports',
          'Instantly visualize scores and export clean reports for your institution.',
          '#E8F0FE' // Soft blue
        ),
      ]}
    />
  );
};

export default OnboardingScreen;
