// PWA Push Notification Manager
// Handles requesting permissions and sending notifications when conditions are good

class PWAPushManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
        this.isEnabled = false;
    }

    // Request notification permission from user
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('PWA notifications not supported in this browser');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.isEnabled = true;
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Notification permission denied by user');
            return false;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        this.isEnabled = permission === 'granted';
        
        if (this.isEnabled) {
            this.sendNotification('Surf Alerts Active!', {
                body: 'You will receive notifications when conditions look good.',
                icon: '🌊',
                tag: 'surf-alerts-enabled',
            });
        }

        return this.isEnabled;
    }

    // Send notification to user
    sendNotification(title, options = {}) {
        if (!this.isEnabled || !this.isSupported) {
            return;
        }

        try {
            // Try to use service worker notification first
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, {
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        ...options,
                    });
                });
            } else {
                // Fallback to simple notification
                new Notification(title, options);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    // Analyze conditions and send appropriate notification
    checkConditionsAndNotify(data, alerts) {
        if (!this.isEnabled) return;

        // Calculate average score across all beaches
        const scores = Object.entries(data)
            .map(([beach, readings]) => {
                if (readings.length === 0) return 0;
                return readings.reduce((sum, r) => sum + (r.y || 0), 0) / readings.length;
            });

        const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

        // Alert thresholds
        if (avgScore >= 80) {
            this.sendNotification('🌊 Excellent Conditions! 🌊', {
                body: 'Swell is exceptional today - get out there now!',
                tag: 'excellent-surf',
                requireInteraction: true,
            });
        } else if (avgScore >= 60 && avgScore < 80) {
            this.sendNotification('🌊 Good Surf Conditions', {
                body: 'Conditions are favorable for surfing',
                tag: 'good-surf',
            });
        }

        // Alert on high wind
        if (alerts.length > 2) {
            const recentAlerts = alerts.slice(-5);
            const highAlerts = recentAlerts.filter(a => a.type === 'wind');
            if (highAlerts.length > 2) {
                this.sendNotification('💨 High Wind Alert', {
                    body: 'Wind conditions are strong - check forecasts before paddling out',
                    tag: 'wind-alert',
                });
            }
        }
    }

    // Get current permission status
    getPermissionStatus() {
        if (!this.isSupported) return 'unsupported';
        return Notification.permission || 'default';
    }

    // Enable/disable notifications
    setEnabled(enabled) {
        if (!this.isSupported) {
            console.warn('PWA notifications not supported');
            return;
        }

        if (enabled && Notification.permission !== 'granted') {
            this.requestPermission();
        } else {
            this.isEnabled = enabled;
        }
    }
}

// Export singleton instance
const pwaPushManager = new PWAPushManager();

export default pwaPushManager;
