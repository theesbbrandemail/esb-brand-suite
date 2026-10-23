importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

const config = Object.fromEntries(new URL(self.location.href).searchParams.entries());
if (!config.apiKey || !config.projectId || !config.appId) {
  throw new Error("Firebase messaging configuration is missing");
}
firebase.initializeApp(config);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(({ notification, data }) => {
  if (!notification?.title) return;
  self.registration.showNotification(notification.title, {
    body: notification.body || "New ESB update",
    data: data || {},
    icon: "/favicon.ico",
  });
});
