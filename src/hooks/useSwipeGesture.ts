import { useRef, type TouchEvent } from 'react';

interface SwipeGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    minSwipeDistance?: number;
    preventDefaultTouchmoveEvent?: boolean;
}

interface TouchPosition {
    x: number;
    y: number;
    time: number;
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        minSwipeDistance = 50,
        preventDefaultTouchmoveEvent = false
    } = options;

    const touchStart = useRef<TouchPosition | null>(null);
    const touchEnd = useRef<TouchPosition | null>(null);

    const handleTouchStart = (e: TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
            time: Date.now()
        };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (preventDefaultTouchmoveEvent) {
            e.preventDefault();
        }
        touchEnd.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
            time: Date.now()
        };
    };

    const handleTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;

        const distanceX = touchStart.current.x - touchEnd.current.x;
        const distanceY = touchStart.current.y - touchEnd.current.y;
        const absDistanceX = Math.abs(distanceX);
        const absDistanceY = Math.abs(distanceY);

        // Determine if it's a horizontal or vertical swipe
        const isHorizontalSwipe = absDistanceX > absDistanceY;

        if (isHorizontalSwipe) {
            // Horizontal swipe
            if (absDistanceX > minSwipeDistance) {
                if (distanceX > 0 && onSwipeLeft) {
                    // Vibrate for haptic feedback
                    if ('vibrate' in navigator) {
                        navigator.vibrate(10);
                    }
                    onSwipeLeft();
                } else if (distanceX < 0 && onSwipeRight) {
                    if ('vibrate' in navigator) {
                        navigator.vibrate(10);
                    }
                    onSwipeRight();
                }
            }
        } else {
            // Vertical swipe
            if (absDistanceY > minSwipeDistance) {
                if (distanceY > 0 && onSwipeUp) {
                    onSwipeUp();
                } else if (distanceY < 0 && onSwipeDown) {
                    onSwipeDown();
                }
            }
        }

        touchStart.current = null;
        touchEnd.current = null;
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    };
};

// Hook for pull-to-refresh
export const usePullToRefresh = (onRefresh: () => Promise<void>, threshold: number = 80) => {
    const pullStart = useRef<number | null>(null);
    const isPulling = useRef(false);
    const isRefreshing = useRef(false);

    const handleTouchStart = (e: TouchEvent) => {
        if (window.scrollY === 0) {
            pullStart.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isPulling.current || pullStart.current === null || isRefreshing.current) return;

        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - pullStart.current;

        if (pullDistance > 0 && window.scrollY === 0) {
            // User is pulling down from top
            if (pullDistance > threshold) {
                // Visual feedback here (could be handled in component)
            }
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling.current || pullStart.current === null || isRefreshing.current) {
            isPulling.current = false;
            pullStart.current = null;
            return;
        }

        const pullDistance = pullStart.current;

        if (pullDistance > threshold) {
            isRefreshing.current = true;

            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(20);
            }

            try {
                await onRefresh();
            } catch (error) {
                console.error('Error during refresh:', error);
            } finally {
                isRefreshing.current = false;
            }
        }

        isPulling.current = false;
        pullStart.current = null;
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    };
};

export default useSwipeGesture;

