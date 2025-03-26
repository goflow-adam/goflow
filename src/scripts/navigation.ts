document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBars = menuButton?.querySelectorAll('span');

    function toggleMenu(show: boolean) {
      if (!menuButton || !mobileMenu || !menuBars?.length) return;

      menuButton.setAttribute('aria-expanded', show ? 'true' : 'false');
      mobileMenu.classList.toggle('hidden', !show);

      // Animate hamburger icon
      if (show) {
        menuBars[0].style.transform = 'rotate(45deg) translate(4px, 5px)';
        menuBars[1].style.opacity = '0';
        menuBars[2].style.transform = 'rotate(-45deg) translate(4px, -5px)';
      } else {
        menuBars[0].style.transform = '';
        menuBars[1].style.opacity = '';
        menuBars[2].style.transform = '';
      }
    }

    // Toggle menu on button click
    menuButton?.addEventListener('click', () => {
      const isCurrentlyExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      toggleMenu(!isCurrentlyExpanded);
    });

    // Handle window resize
    const handleResize = () => window.innerWidth >= 768 && toggleMenu(false);
    window.addEventListener('resize', handleResize);

    // Initial state
    toggleMenu(false);
  });