// assets/js/admin.js
// Admin panel interactivity: sidebar active link, modal, dropdowns

document.addEventListener('DOMContentLoaded', function () {
  // Sidebar active link highlighting
  const sidebarLinks = document.querySelectorAll('#admin-sidebar a');
  const path = window.location.pathname;
  sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('bg-blue-100', 'font-bold');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Admin header dropdown (placeholder logic)
  const userBtn = document.querySelector('#admin-header button[aria-haspopup]');
  if (userBtn) {
    userBtn.addEventListener('click', function () {
      // Implement dropdown toggle logic here if needed
      alert('Dropdown menu placeholder');
    });
  }

  // Modal open/close logic (if modal is used)
  document.body.addEventListener('click', function (e) {
    if (e.target.matches('[data-modal-open]')) {
      document.querySelector('.fixed[role="dialog"]').classList.remove('hidden');
    }
    if (e.target.closest('[aria-label="Close Modal"]')) {
      document.querySelector('.fixed[role="dialog"]').classList.add('hidden');
    }
  });
}); 