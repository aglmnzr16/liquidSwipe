import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Wave, { HEIGHT, MARGIN_WIDTH, MIN_LEDGE, Side, WIDTH } from "./Wave";
import Button from "./Button";
import { PanGestureHandler } from "react-native-gesture-handler";
import { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { snapPoint, useVector } from "react-native-redash";
import Animated from "react-native-reanimated";

const PREV = WIDTH;
const NEXT = 0;

interface SliderProps {
  index: number;
  setIndex: (value: number) => void;
  children: JSX.Element;
  prev?: JSX.Element;
  next?: JSX.Element;
}

const Slider = ({
  index,
  children: current,
  prev,
  next,
  setIndex,
}: SliderProps) => {
  const hasPrev = !!prev;
  const hasNext = !!next;
  const activeSide = useSharedValue(Side.NONE)
  const isTransitionLeft = useSharedValue(false)
  const isTransitionRight = useSharedValue(false)
  const left = useVector(0, HEIGHT / 2)
  const right = useVector(0, HEIGHT / 2) 
  const onGestureEvent = useAnimatedGestureHandler({
    onStart: ({x}) => {
      if(x < MARGIN_WIDTH) {
        activeSide.value = Side.LEFT
      } else if(x > WIDTH - MARGIN_WIDTH) {
        activeSide.value = Side.RIGHT
      } else {
        activeSide.value = Side.NONE
      }
    },
    onActive: ({x,y}) => {
      if(activeSide.value === Side.LEFT) {
        left.x.value = x;
        left.y.value = y;
      } else if(activeSide.value === Side.RIGHT) {
        right.x.value = WIDTH - x
        right.y.value = y
      }
    },
    onEnd: ({x, velocityX, velocityY}) => {

      if(activeSide.value === Side.LEFT) {
        const snapPoints = [MIN_LEDGE, WIDTH]
        const dest = snapPoint(x, velocityX, snapPoints)
        isTransitionLeft.value = dest === WIDTH
        left.y.value = withSpring(HEIGHT / 2, {velocity: velocityY})

        left.x.value = withSpring(dest, {velocity : velocityX, overshootClamping: isTransitionLeft.value ? true : false, restSpeedThreshold: isTransitionLeft.value ? 100 : 0.01,  restDisplacementThreshold: isTransitionLeft.value ? 100 : 0.01}, () => {
          if(isTransitionLeft.value) {
            runOnJS(setIndex)(index-1)
          }
        })

      } else if(activeSide.value === Side.RIGHT) {

        const snapPoints = [WIDTH - MIN_LEDGE, 0]
        const dest = snapPoint(x, velocityX, snapPoints)
        isTransitionRight.value = dest === 0
        right.y.value = withSpring(HEIGHT / 2, {velocity: velocityY})
        right.x.value = withSpring(WIDTH  - dest, {velocity : velocityX, overshootClamping: isTransitionRight.value ? true : false, restSpeedThreshold: isTransitionRight.value ? 100 : 0.01,  restDisplacementThreshold: isTransitionRight.value ? 100 : 0.01}, () => {
          if(isTransitionRight.value) {
            runOnJS(setIndex)(index+1)
          }
        })
      } 
    }
  })

  useEffect(() => {
    left.x.value = withSpring(MIN_LEDGE) 
    right.x.value = withSpring(MIN_LEDGE)
  },[left.x, right.x])

  const leftStyle = useAnimatedStyle(() => ({zIndex : activeSide.value === Side.LEFT ? 100 :0}))

  return ( 
    
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={StyleSheet.absoluteFill}>
      {current}
      {prev && (
        <Animated.View style={[StyleSheet.absoluteFill, leftStyle]}>
          <Wave side={Side.LEFT} position={left} isTransitioning={isTransitionLeft}>{prev}</Wave>
        </Animated.View>
      )}
      {next && (
        <View style={StyleSheet.absoluteFill}>
          <Wave side={Side.RIGHT} position={right} isTransitioning={isTransitionRight}>{next}</Wave>
        </View>
      )}
    </Animated.View>
    </PanGestureHandler>
  );
};

export default Slider;
