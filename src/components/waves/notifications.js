// lib/notifications.js
export async function notify(title, body) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const options = {
        body,
        icon: `${process.env.PUBLIC_URL || ""}/logo192.png`,
        badge: `${process.env.PUBLIC_URL || ""}/logo192.png`
    };

    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && typeof registration.showNotification === "function") {
                await registration.showNotification(title, options);
                return;
            }
        } catch (error) {
            // fall through to constructor fallback for environments where this is allowed
        }
    }

    try {
        // Some browsers still support direct constructor usage outside Service Workers.
        new Notification(title, options);
    } catch (error) {
        // Ignore: environments that require showNotification already attempted above.
    }
}