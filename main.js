'use strict';

const { app, BrowserWindow, Notification } = require('electron');
const path = require('node:path');

const APP_ID = 'ro.liner.studyapp';

// Keep the previous StudyTimer profile folder so existing calendar entries
// and timer preferences remain available after the LINER rebrand.
app.setPath('userData', path.join(app.getPath('appData'), 'StudyTimer'));
const HTML_FILE = path.join(__dirname, 'index.html');
let mainWindow = null;
let reminderChecked = false;

app.setAppUserModelId(APP_ID);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 900,
    minWidth: 780,
    minHeight: 680,
    show: false,
    backgroundColor: '#1d2b6e',
    title: 'LINER',
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // A dedicated, persistent Chromium profile keeps the calendar and timer
      // settings between launches and app updates.
      partition: 'persist:study-timer'
    }
  });

  mainWindow.loadFile(HTML_FILE);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  mainWindow.webContents.once('did-finish-load', () => {
    // Give the existing HTML calendar time to initialize localStorage.
    setTimeout(checkForUpcomingTest, 1200);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function checkForUpcomingTest() {
  if (reminderChecked || !mainWindow || mainWindow.isDestroyed()) return;
  reminderChecked = true;

  try {
    const nextTest = await mainWindow.webContents.executeJavaScript(`(() => {
      try {
        if (localStorage.getItem('liner-onboarding-complete') !== 'true') return null;
        const saved = JSON.parse(localStorage.getItem('timer-glass-events') || '[]');
        if (!Array.isArray(saved)) return null;

        const now = new Date();
        const today = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0')
        ].join('-');

        const tests = saved.filter(item =>
          item && item.type === 'Test' && typeof item.title === 'string' &&
          /^\\d{4}-\\d{2}-\\d{2}$/.test(item.date) && item.date >= today
        );
        tests.sort((a, b) => a.date.localeCompare(b.date));
        const language = localStorage.getItem('liner-language') === 'en' ? 'en' : 'ro';
        return tests.length ? { title: tests[0].title, date: tests[0].date, language } : null;
      } catch (_) {
        return null;
      }
    })()`, true);

    if (!nextTest || !Notification.isSupported()) return;

    const [year, month, day] = nextTest.date.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
    const isEnglish = nextTest.language === 'en';
    const when = isEnglish
      ? (daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`)
      : (daysLeft === 0 ? 'Astăzi' : daysLeft === 1 ? 'Mâine' : `În ${daysLeft} zile`);
    const dateLabel = new Intl.DateTimeFormat(isEnglish ? 'en-GB' : 'ro-RO', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(target);

    const notification = new Notification({
      title: isEnglish ? '📚 Your next test is coming up!' : '📚 Se apropie următorul test!',
      body: `${nextTest.title}\n${when} · ${dateLabel}`,
      silent: false
    });

    notification.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
    notification.show();
  } catch (error) {
    // The calendar remains usable even if Windows notifications are unavailable.
    console.error('Nu s-a putut verifica următorul test:', error);
  }
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Register automatic launch only for the installed Windows application.
    // The user can disable it later in Windows Settings > Apps > Startup.
    if (process.platform === 'win32' && app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        args: ['--startup']
      });
    }

    createWindow();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
