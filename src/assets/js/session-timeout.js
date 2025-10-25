document.addEventListener('DOMContentLoaded', () => {
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const WARNING_TIME = 13 * 60 * 1000; // 2-minute warning
  const IFRAME_FOCUS_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes
  const MAX_IFRAME_EXTENSIONS = 3; // Allow ~12 minutes additional while actively focused

  let sessionTimer;
  let warningTimer;
  let iframeFocusChecker;
  let iframeExtensionsUsed = 0;

  function scheduleTimers() {
    clearTimeout(sessionTimer);
    clearTimeout(warningTimer);

    warningTimer = setTimeout(() => {
      if (window.confirm('Your session will expire in 2 minutes due to inactivity. Click OK to continue.')) {
        resetSession();
      }
    }, WARNING_TIME);

    sessionTimer = setTimeout(() => {
      cleanupTimers();
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch (storageErr) {
        console.warn('Storage cleanup failed:', storageErr);
      }
      window.alert('Session expired due to inactivity for security purposes.');
      window.location.href = '/';
    }, SESSION_TIMEOUT);
  }

  function resetSession() {
    iframeExtensionsUsed = 0;
    scheduleTimers();
  }

  function extendSessionForIframeFocus() {
    if (iframeExtensionsUsed < MAX_IFRAME_EXTENSIONS) {
      iframeExtensionsUsed += 1;
      scheduleTimers();
    }
  }

  function setupIframeFocusHeartbeat() {
    const iframe = document.getElementById('ghl-form');
    if (!iframe) return;

    clearInterval(iframeFocusChecker);
    iframeFocusChecker = setInterval(() => {
      if (!document.hidden && document.hasFocus() && document.activeElement === iframe) {
        extendSessionForIframeFocus();
      }
    }, IFRAME_FOCUS_CHECK_INTERVAL);
  }

  function cleanupTimers() {
    clearTimeout(sessionTimer);
    clearTimeout(warningTimer);
    clearInterval(iframeFocusChecker);
  }

  ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, resetSession, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resetSession();
    }
  });

  window.addEventListener('focus', () => {
    resetSession();
  });

  setupIframeFocusHeartbeat();
  scheduleTimers();
});
