import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveInfo {
  width: number;
  height: number;
  screenSize: ScreenSize;
  orientation: Orientation;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const getScreenSize = (width: number): ScreenSize => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

const getResponsiveInfo = (dimensions: ScaledSize): ResponsiveInfo => {
  const { width, height } = dimensions;
  const screenSize = getScreenSize(width);
  const orientation = getOrientation(width, height);

  return {
    width,
    height,
    screenSize,
    orientation,
    isWeb: Platform.OS === 'web',
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
  };
};

/**
 * Hook for responsive design across platforms
 */
export function useResponsive(): ResponsiveInfo {
  const [info, setInfo] = useState<ResponsiveInfo>(() =>
    getResponsiveInfo(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setInfo(getResponsiveInfo(window));
    });

    return () => subscription?.remove();
  }, []);

  return info;
}

/**
 * Get responsive value based on screen size
 */
export function responsive<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}, screenSize: ScreenSize): T {
  if (screenSize === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (screenSize === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  if (screenSize === 'tablet' && values.desktop !== undefined) {
    return values.desktop;
  }
  return values.mobile;
}

/**
 * Scale value based on screen width (base: 375 - iPhone SE width)
 */
export function scale(size: number, width: number, baseWidth = 375): number {
  return (width / baseWidth) * size;
}

/**
 * Get platform-specific value
 */
export function platformSelect<T>(options: {
  web?: T;
  ios?: T;
  android?: T;
  native?: T;
  default: T;
}): T {
  if (Platform.OS === 'web' && options.web !== undefined) {
    return options.web;
  }
  if (Platform.OS === 'ios' && options.ios !== undefined) {
    return options.ios;
  }
  if (Platform.OS === 'android' && options.android !== undefined) {
    return options.android;
  }
  if (Platform.OS !== 'web' && options.native !== undefined) {
    return options.native;
  }
  return options.default;
}

export default useResponsive;
