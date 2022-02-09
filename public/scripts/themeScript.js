if (localStorage.getItem('theme') === 'dark' || !('theme' in localStorage)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
