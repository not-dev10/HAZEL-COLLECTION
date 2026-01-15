import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Session Timeout Timer Component
 * Displays countdown timer and auto-logs out after 2 hours of inactivity
 * Syncs with backend session management
 */

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning at 5 minutes remaining
const UPDATE_INTERVAL = 1000; // Update every second

export const SessionTimeoutTimer = () => {
    const navigate = useNavigate();
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT);
    const [showWarning, setShowWarning] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Format time remaining as HH:MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Reset activity timer with debounce (prevent too frequent resets)
    const resetActivity = useCallback(() => {
        const now = Date.now();
        const timeSinceLastReset = now - lastActivityRef.current;

        // Only reset if at least 1 second has passed since last reset
        if (timeSinceLastReset > 1000) {
            lastActivityRef.current = now;
            setLastActivity(now);
            setShowWarning(false);
        }
    }, []);

    // Debounced activity handler
    const handleActivity = useCallback(() => {
        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer (only reset after 500ms of no activity)
        debounceTimerRef.current = setTimeout(() => {
            resetActivity();
        }, 500);
    }, [resetActivity]);

    // Handle logout
    const handleLogout = useCallback(() => {
        // Clear admin session
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminUser');

        // Redirect to login
        navigate('/admin/login');
    }, [navigate]);

    // Track user activity
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        // Add event listeners with debounce
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [handleActivity]);

    // Update timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const remaining = SESSION_TIMEOUT - elapsed;

            setTimeRemaining(remaining);

            // Show warning when 5 minutes remaining
            if (remaining <= WARNING_THRESHOLD && remaining > 0) {
                setShowWarning(true);
            }

            // Auto-logout when time expires
            if (remaining <= 0) {
                console.log('⏰ Session timeout - logging out');
                handleLogout();
            }
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [lastActivity, handleLogout]);

    // Get color based on time remaining
    const getTimerColor = () => {
        if (timeRemaining <= WARNING_THRESHOLD) {
            return 'text-red-600 dark:text-red-400';
        } else if (timeRemaining <= 15 * 60 * 1000) {
            return 'text-yellow-600 dark:text-yellow-400';
        }
        return 'text-green-600 dark:text-green-400';
    };

    // Get background color for warning
    const getBackgroundColor = () => {
        if (showWarning) {
            return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
        }
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${getBackgroundColor()}`}
                    >
                        <Clock className={`h-4 w-4 ${getTimerColor()}`} />
                        <span className={`text-sm font-mono font-medium ${getTimerColor()}`}>
                            {formatTime(timeRemaining)}
                        </span>

                        {showWarning && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetActivity}
                                className="h-6 px-2 text-xs"
                            >
                                Extend
                            </Button>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-sm">
                        <p className="font-semibold mb-1">Session Timeout</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Auto-logout after 2 hours of inactivity
                        </p>
                        {showWarning && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                ⚠️ Session expiring soon! Click "Extend" or perform any action to continue.
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Compact version for header/navbar
 */
export const SessionTimeoutBadge = () => {
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT);

    const resetActivity = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetActivity);
        });
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetActivity);
            });
        };
    }, [resetActivity]);

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = SESSION_TIMEOUT - (Date.now() - lastActivity);
            setTimeRemaining(remaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastActivity]);

    const minutes = Math.floor(timeRemaining / 60000);
    const isWarning = timeRemaining <= WARNING_THRESHOLD;

    return (
        <div className={`flex items-center gap-1 text-xs ${isWarning ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="h-3 w-3" />
            <span className="font-mono">{minutes}m</span>
        </div>
    );
};

export default SessionTimeoutTimer;
