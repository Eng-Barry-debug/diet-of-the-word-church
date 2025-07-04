// assets/js/components.js
// Dynamically loads shared HTML components into containers

function loadComponent(selector, url) {
  const container = document.querySelector(selector);
  if (container) {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        return res.text();
      })
      .then(html => {
        container.insertAdjacentHTML('beforeend', html);
      })
      .catch(err => {
        console.error(err);
      });
  }
}

// Main site components
loadComponent('#header', 'components/header.html');
loadComponent('#footer', 'components/footer.html');

// Admin components
loadComponent('#admin-header', '/components/admin-header.html');
loadComponent('#admin-sidebar', '/components/admin-sidebar.html');

// === Navigation Accessibility & Interactivity Enhancements ===
document.addEventListener('DOMContentLoaded', function () {
  // Highlight active nav link
  var path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(function(link) {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });

  // Sticky shadow on scroll
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.classList.add('shadow-lg');
    } else {
      header.classList.remove('shadow-lg');
    }
  });

  // Mobile menu slide-in/out and overlay with focus trap
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-menu-close');
  let lastFocusedElement = null;

  function trapFocus(element) {
    const focusableEls = element.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];
    element.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) { // shift + tab
          if (document.activeElement === firstFocusableEl) {
            e.preventDefault();
            lastFocusableEl.focus();
          }
        } else { // tab
          if (document.activeElement === lastFocusableEl) {
            e.preventDefault();
            firstFocusableEl.focus();
          }
        }
      } else if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    lastFocusedElement = document.activeElement;
    menu.classList.add('open');
    overlay.classList.add('open');
    btn.classList.add('open');
    setTimeout(() => overlay.classList.remove('hidden'), 10);
    menu.setAttribute('aria-expanded', 'true');
    trapFocus(menu);
    // Focus first link
    setTimeout(() => {
      const firstLink = menu.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }, 100);
  }
  function closeMobileMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('open');
    btn.classList.remove('open');
    setTimeout(() => overlay.classList.add('hidden'), 300);
    menu.setAttribute('aria-expanded', 'false');
    if (lastFocusedElement) lastFocusedElement.focus();
  }
  if (btn && menu && overlay && closeBtn) {
    btn.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
  }

  // Ministries dropdown functionality (desktop)
  const dropdownBtn = document.getElementById('ministries-dropdown-btn');
  const dropdown = document.getElementById('ministries-mega');
  const arrow = document.getElementById('ministries-arrow');
  if (dropdownBtn && dropdown && arrow) {
    function openDropdown() {
      dropdown.classList.remove('opacity-0', 'invisible', 'scale-95');
      dropdown.classList.add('opacity-100', 'visible', 'scale-100');
      arrow.classList.add('rotate-180');
      dropdownBtn.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown() {
      dropdown.classList.remove('opacity-100', 'visible', 'scale-100');
      dropdown.classList.add('opacity-0', 'invisible', 'scale-95');
      arrow.classList.remove('rotate-180');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
    dropdownBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('opacity-100');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
        // Focus first submenu item
        setTimeout(() => {
          const firstLink = dropdown.querySelector('a');
          if (firstLink) firstLink.focus();
        }, 100);
      }
    });
    // Keyboard navigation for dropdown
    dropdownBtn.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
        const firstLink = dropdown.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    dropdown.addEventListener('keydown', function(e) {
      const links = Array.from(dropdown.querySelectorAll('a'));
      const idx = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < links.length - 1) links[idx + 1].focus();
        else links[0].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) links[idx - 1].focus();
        else links[links.length - 1].focus();
      } else if (e.key === 'Escape') {
        closeDropdown();
        dropdownBtn.focus();
      }
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
        closeDropdown();
      }
    });
    // Close dropdown on escape key globally
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    });
  }

  // Mobile ministries submenu toggle (keyboard accessible)
  const mobileMinistriesBtn = document.querySelector('#mobile-menu button[aria-controls="mobile-ministries"]');
  const mobileMinistriesMenu = document.getElementById('mobile-ministries');
  if (mobileMinistriesBtn && mobileMinistriesMenu) {
    mobileMinistriesBtn.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mobileMinistriesMenu.classList.toggle('hidden');
        const firstLink = mobileMinistriesMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    mobileMinistriesMenu.addEventListener('keydown', function(e) {
      const links = Array.from(mobileMinistriesMenu.querySelectorAll('a'));
      const idx = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < links.length - 1) links[idx + 1].focus();
        else links[0].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) links[idx - 1].focus();
        else links[links.length - 1].focus();
      } else if (e.key === 'Escape') {
        mobileMinistriesMenu.classList.add('hidden');
        mobileMinistriesBtn.focus();
      }
    });
  }
}); 