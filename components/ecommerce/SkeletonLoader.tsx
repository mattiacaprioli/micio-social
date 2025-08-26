import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import styled from 'styled-components/native';
import { wp } from '../../helpers/common';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

const SkeletonContainer = styled(Animated.View)<{
  width: number | string;
  height: number | string;
  borderRadius: number;
}>`
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height};
  border-radius: ${props => props.borderRadius}px;
  background-color: ${props => props.theme.colors.cardBorder};
  overflow: hidden;
`;

const ShimmerOverlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.colors.background};
`;

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <SkeletonContainer
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    >
      <ShimmerOverlay
        style={{
          opacity: opacity,
        }}
      />
    </SkeletonContainer>
  );
};

// Componente per skeleton di ProductCard
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={{
      backgroundColor: 'transparent',
      borderRadius: 12,
      margin: 8,
      padding: 12,
      flex: 1,
      minWidth: wp(42),
      maxWidth: wp(45),
    }}>
      {/* Category Badge Skeleton */}
      <SkeletonLoader
        width={60}
        height={20}
        borderRadius={10}
        style={{ marginBottom: 8 }}
      />
      
      {/* Image Skeleton */}
      <SkeletonLoader
        width="100%"
        height={wp(30)}
        borderRadius={8}
        style={{ marginBottom: 8 }}
      />
      
      {/* Title Skeleton */}
      <SkeletonLoader
        width="90%"
        height={16}
        borderRadius={4}
        style={{ marginBottom: 4 }}
      />
      <SkeletonLoader
        width="70%"
        height={16}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />
      
      {/* Price Skeleton */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <SkeletonLoader
          width={60}
          height={18}
          borderRadius={4}
          style={{ marginRight: 8 }}
        />
        <SkeletonLoader
          width={50}
          height={14}
          borderRadius={4}
        />
      </View>
      
      {/* Rating Skeleton */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SkeletonLoader
          width={80}
          height={14}
          borderRadius={4}
          style={{ marginRight: 8 }}
        />
        <SkeletonLoader
          width={40}
          height={14}
          borderRadius={4}
        />
      </View>
    </View>
  );
};

// Componente per skeleton di ProductDetails
export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Image Skeleton */}
      <SkeletonLoader
        width="100%"
        height={wp(80)}
        borderRadius={12}
        style={{ marginBottom: 16 }}
      />
      
      {/* Title Skeleton */}
      <SkeletonLoader
        width="100%"
        height={24}
        borderRadius={6}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader
        width="80%"
        height={24}
        borderRadius={6}
        style={{ marginBottom: 16 }}
      />
      
      {/* Price Section Skeleton */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <SkeletonLoader
          width={80}
          height={28}
          borderRadius={6}
          style={{ marginRight: 12 }}
        />
        <SkeletonLoader
          width={60}
          height={20}
          borderRadius={4}
          style={{ marginRight: 12 }}
        />
        <SkeletonLoader
          width={50}
          height={20}
          borderRadius={10}
        />
      </View>
      
      {/* Rating Skeleton */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <SkeletonLoader
          width={100}
          height={16}
          borderRadius={4}
          style={{ marginRight: 8 }}
        />
        <SkeletonLoader
          width={60}
          height={16}
          borderRadius={4}
        />
      </View>
      
      {/* Description Skeleton */}
      <SkeletonLoader
        width="100%"
        height={16}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader
        width="95%"
        height={16}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader
        width="85%"
        height={16}
        borderRadius={4}
        style={{ marginBottom: 16 }}
      />
      
      {/* Button Skeleton */}
      <SkeletonLoader
        width="100%"
        height={50}
        borderRadius={25}
        style={{ marginTop: 'auto', marginBottom: 20 }}
      />
    </View>
  );
};

export default SkeletonLoader;
