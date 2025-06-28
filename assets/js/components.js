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