document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  // Mobile menu toggle
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    });
  }

  // Desktop navigation - keyboard and ARIA support
  const desktopNavTriggers = document.querySelectorAll('[data-nav-trigger]');
  desktopNavTriggers.forEach(trigger => {
    const parent = trigger.closest('.group');
    const submenu = parent?.querySelector('.submenu-wrapper');
    
    // Toggle on click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      closeAllDesktopMenus();
      if (!isExpanded) {
        trigger.setAttribute('aria-expanded', 'true');
        submenu?.classList.add('open');
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      } else if (e.key === 'Escape') {
        closeAllDesktopMenus();
        trigger.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const firstItem = submenu?.querySelector('a, button');
        firstItem?.focus();
      }
    });
  });

  // Desktop city submenu triggers
  const cityTriggers = document.querySelectorAll('[data-city-trigger]');
  cityTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = trigger.closest('.submenu-city');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      parent?.classList.toggle('open');
      trigger.setAttribute('aria-expanded', (!isExpanded).toString());
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // Mobile navigation triggers
  const mobileNavTriggers = document.querySelectorAll('[data-mobile-nav-trigger]');
  mobileNavTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.closest('.mobile-nav-item');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      parent?.classList.toggle('open');
      trigger.setAttribute('aria-expanded', (!isExpanded).toString());
    });
  });

  // Mobile city triggers
  const mobileCityTriggers = document.querySelectorAll('[data-mobile-city-trigger]');
  mobileCityTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.closest('.mobile-city-item');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      parent?.classList.toggle('open');
      trigger.setAttribute('aria-expanded', (!isExpanded).toString());
    });
  });

  // Close desktop menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.group') && !e.target.closest('[data-nav-trigger]')) {
      closeAllDesktopMenus();
    }
  });

  // Close menus on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDesktopMenus();
      // Also close mobile menu if open
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuButton?.setAttribute('aria-expanded', 'false');
        menuButton?.focus();
      }
    }
  });

  function closeAllDesktopMenus() {
    desktopNavTriggers.forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      t.closest('.group')?.querySelector('.submenu-wrapper')?.classList.remove('open');
    });
  }
});
