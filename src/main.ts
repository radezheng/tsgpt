import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';

const app = createApp(App);

app.use(router);
router.isReady().then(() => {
  // Waiting for the router to be ready prevents race conditions when returning from a loginRedirect or acquireTokenRedirect
  app.mount('#app');
});
