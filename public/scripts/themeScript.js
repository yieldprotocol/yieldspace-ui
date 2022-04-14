(() => {
  if (localStorage.getItem('yieldspace-theme') === 'dark' || !('yieldspace-theme' in localStorage)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();
