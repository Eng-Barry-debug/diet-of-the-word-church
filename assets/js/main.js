// assets/js/main.js
// Main site-wide JavaScript (placeholder)

document.addEventListener('DOMContentLoaded', function () {
  // Example: highlight today's date in events, etc.
  console.log('Main JS loaded');
});

// Multi-step Contact Form Logic
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const progress = document.getElementById('form-progress');
  const stepLabel = document.getElementById('form-step-label');
  const nextBtn = document.getElementById('next-step');
  const prevBtn = document.getElementById('prev-step');
  const submitBtn = document.getElementById('submit-form');
  const reviewSummary = document.getElementById('review-summary');
  const fileInput = document.getElementById('attachment');
  const fileList = document.getElementById('file-list');
  const message = document.getElementById('message');
  const messageCounter = document.getElementById('message-counter');
  const messageProgress = document.getElementById('message-progress');
  const formSuccess = document.getElementById('form-success');

  // Overlay and Modal Elements
  let overlay, modal;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300';
    overlay.innerHTML = `
      <div class="flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
        <div class="text-white text-xl font-semibold drop-shadow-lg">Sending your message...</div>
      </div>
    `;
    overlay.tabIndex = -1;
    document.body.appendChild(overlay);
    overlay.focus();
  }
  function removeOverlay() {
    if (overlay) {
      overlay.classList.add('opacity-0');
      setTimeout(() => overlay && overlay.remove(), 300);
      overlay = null;
    }
  }
  function iconForField(field) {
    const icons = {
      name: '<svg class="w-5 h-5 text-blue-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      email: '<svg class="w-5 h-5 text-purple-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
      phone: '<svg class="w-5 h-5 text-green-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm14-12a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 12a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2z"/></svg>',
      organization: '<svg class="w-5 h-5 text-yellow-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h2a1 1 0 001-1v-2h3a1 1 0 001-1V7"/></svg>',
      country: '<svg class="w-5 h-5 text-pink-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20"/></svg>',
      city: '<svg class="w-5 h-5 text-indigo-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2"/></svg>',
      interests: '<svg class="w-5 h-5 text-teal-500 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
      subject: '<svg class="w-5 h-5 text-blue-400 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 17l4-4-4-4m8 8l-4-4 4-4"/></svg>',
      message: '<svg class="w-5 h-5 text-purple-400 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
      'preferred-contact': '<svg class="w-5 h-5 text-orange-400 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2"/></svg>',
      'best-time': '<svg class="w-5 h-5 text-blue-600 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>',
      newsletter: '<svg class="w-5 h-5 text-green-400 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
      files: '<svg class="w-5 h-5 text-gray-400 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7"/></svg>',
    };
    return icons[field] || '';
  }

  function confettiEffect() {
    // Simple confetti burst
    const confetti = document.createElement('div');
    confetti.className = 'pointer-events-none fixed inset-0 z-50';
    for (let i = 0; i < 32; i++) {
      const dot = document.createElement('div');
      dot.className = 'absolute rounded-full';
      dot.style.width = dot.style.height = `${Math.random()*8+6}px`;
      dot.style.background = `hsl(${Math.random()*360},90%,60%)`;
      dot.style.left = `${Math.random()*100}%`;
      dot.style.top = '50%';
      dot.style.transform = `translateY(-50%) scale(${Math.random()+0.5})`;
      dot.style.opacity = 0.85;
      dot.style.transition = 'all 1.2s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => {
        dot.style.top = `${Math.random()*100}%`;
        dot.style.left = `${Math.random()*100}%`;
        dot.style.opacity = 0;
      }, 10);
      confetti.appendChild(dot);
    }
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1400);
  }

  function buildSummaryCard(data) {
    return `
      <div class="bg-white rounded-xl shadow-lg p-6 mb-4 text-left max-w-lg mx-auto divide-y divide-blue-50">
        <div class="mb-3">
          <div class="font-bold text-blue-900 mb-1">Personal Info</div>
          <div class="flex flex-col gap-1">
            <div>${iconForField('name')}<span>${data['first-name']||''} ${data['last-name']||''}</span></div>
            <div>${iconForField('email')}<span>${data['email']||''}</span></div>
            <div>${iconForField('phone')}<span>${data['phone']||''}</span></div>
            ${data.organization ? `<div>${iconForField('organization')}<span>${data.organization}</span></div>` : ''}
            ${data.country ? `<div>${iconForField('country')}<span>${data.country}</span></div>` : ''}
            ${data.city ? `<div>${iconForField('city')}<span>${data.city}</span></div>` : ''}
          </div>
        </div>
        <div class="py-3">
          <div class="font-bold text-blue-900 mb-1">Inquiry</div>
          <div class="flex flex-col gap-1">
            ${data.interests ? `<div>${iconForField('interests')}<span>${Array.isArray(data.interests) ? data.interests.join(', ') : data.interests}</span></div>` : ''}
            <div>${iconForField('subject')}<span>${data.subject||''}</span></div>
            <div>${iconForField('message')}<span>${data.message||''}</span></div>
            ${data['preferred-contact'] ? `<div>${iconForField('preferred-contact')}<span>${data['preferred-contact']}</span></div>` : ''}
            ${data['best-time'] ? `<div>${iconForField('best-time')}<span>${data['best-time']}</span></div>` : ''}
            ${data.newsletter ? `<div>${iconForField('newsletter')}<span>Subscribed</span></div>` : ''}
            ${data.files.length ? `<div>${iconForField('files')}<span>${data.files.join(', ')}</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function downloadSummary(data) {
    const text = `Contact Form Submission\n\nName: ${data['first-name']||''} ${data['last-name']||''}\nEmail: ${data['email']||''}\nPhone: ${data['phone']||''}\nOrganization: ${data.organization||''}\nCountry: ${data.country||''}\nCity: ${data.city||''}\nInterests: ${Array.isArray(data.interests) ? data.interests.join(', ') : data.interests||''}\nSubject: ${data.subject||''}\nMessage: ${data.message||''}\nPreferred Contact: ${data['preferred-contact']||''}\nBest Time: ${data['best-time']||''}\nNewsletter: ${data.newsletter ? 'Subscribed' : 'No'}\nFiles: ${data.files.join(', ')}`;
    const blob = new Blob([text], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact-summary.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  function showModal({type, title, message, summary, onClose, onRetry, data}) {
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 text-center relative animate-fade-in overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="w-full py-6 px-8 ${type==='success' ? 'bg-gradient-to-r from-blue-700 via-purple-600 to-blue-900' : 'bg-gradient-to-r from-red-600 via-red-400 to-red-700'} text-white flex flex-col items-center">
          <button class="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold focus:outline-none" aria-label="Close" id="modal-close">&times;</button>
          <div class="mb-2">
            ${type === 'success' ?
              '<div class="mx-auto mb-2"><svg class="w-16 h-16 mx-auto text-green-400 animate-bounce-in" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="#dcfce7"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 13l3 3 7-7" stroke="#22c55e" stroke-width="3"/></svg></div>' :
              '<div class="mx-auto mb-2"><svg class="w-16 h-16 mx-auto text-red-200 animate-shake" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="#fee2e2"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6m0-6l6 6" stroke="#ef4444" stroke-width="3"/></svg></div>'}
          </div>
          <h3 id="modal-title" class="text-2xl font-bold mb-1">${title}</h3>
          <div class="text-base mb-2">${message}</div>
        </div>
        <div class="p-6">
          ${type==='success' && data ? buildSummaryCard(data) : ''}
          ${type==='error' ? `<div class="bg-red-50 rounded-lg p-4 text-left text-sm text-red-900 mb-4">
            <div class="font-bold mb-1">Troubleshooting Tips:</div>
            <ul class="list-disc ml-6">
              <li>Check your internet connection.</li>
              <li>Ensure all required fields are filled.</li>
              <li>Try again in a few moments.</li>
            </ul>
          </div>` : ''}
          <div class="flex flex-wrap justify-center gap-4 mt-4">
            ${type==='success' ? `<button id="modal-download" class="bg-blue-100 text-blue-900 px-5 py-2 rounded shadow hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400">Download Summary</button>` : ''}
            ${type==='success' ? `<button id="modal-another" class="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-5 py-2 rounded shadow hover:from-blue-700 hover:to-purple-900 focus-visible:ring-2 focus-visible:ring-purple-400">Send Another Message</button>` : ''}
            ${type==='error' ? `<button id="modal-retry" class="bg-red-500 text-white px-6 py-2 rounded shadow hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400">Retry</button>` : ''}
            <button id="modal-ok" class="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded shadow hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-purple-400">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    // Confetti on success
    if (type==='success') confettiEffect();
    // Focus management
    const closeBtn = modal.querySelector('#modal-close');
    const okBtn = modal.querySelector('#modal-ok');
    if (closeBtn) closeBtn.focus();
    function closeModal() {
      modal.remove();
      modal = null;
      if (onClose) onClose();
    }
    closeBtn.addEventListener('click', closeModal);
    okBtn.addEventListener('click', closeModal);
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') {
        // Trap focus
        e.preventDefault();
        okBtn.focus();
      }
    });
    if (type === 'success') {
      const downloadBtn = modal.querySelector('#modal-download');
      if (downloadBtn) downloadBtn.addEventListener('click', () => downloadSummary(data));
      const anotherBtn = modal.querySelector('#modal-another');
      if (anotherBtn) anotherBtn.addEventListener('click', closeModal);
    }
    if (type === 'error') {
      const retryBtn = modal.querySelector('#modal-retry');
      retryBtn.addEventListener('click', () => {
        closeModal();
        if (onRetry) onRetry();
      });
    }
  }

  let currentStep = 0;
  let files = [];

  function showStep(idx) {
    steps.forEach((step, i) => {
      step.classList.toggle('hidden', i !== idx);
      step.setAttribute('aria-hidden', i !== idx);
    });
    if (progress) progress.style.width = `${((idx+1)/steps.length)*100}%`;
    if (stepLabel) {
      stepLabel.textContent =
        idx === 0 ? 'Step 1 of 3: Personal Info' :
        idx === 1 ? 'Step 2 of 3: Inquiry Details' :
        'Step 3 of 3: Review & Submit';
    }
    prevBtn.classList.toggle('hidden', idx === 0);
    nextBtn.classList.toggle('hidden', idx === steps.length-1);
    submitBtn.classList.toggle('hidden', idx !== steps.length-1);
    // Focus first input in step
    const firstInput = steps[idx].querySelector('input,select,textarea,button');
    if (firstInput) setTimeout(() => firstInput.focus(), 200);
  }

  function validateStep(idx) {
    let valid = true;
    const fields = steps[idx].querySelectorAll('input,select,textarea');
    fields.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') return;
      if (field.required && !field.value.trim()) {
        valid = false;
        const err = document.getElementById(field.id+'-error');
        if (err) err.textContent = 'This field is required.';
        field.classList.add('border-red-400');
      } else {
        const err = document.getElementById(field.id+'-error');
        if (err) err.textContent = '';
        field.classList.remove('border-red-400');
      }
    });
    // Special: consent checkbox on last step
    if (idx === steps.length-1) {
      const consent = document.getElementById('consent');
      const err = document.getElementById('consent-error');
      if (consent && !consent.checked) {
        valid = false;
        if (err) err.textContent = 'You must agree before submitting.';
      } else if (err) {
        err.textContent = '';
      }
    }
    return valid;
  }

  function gatherFormData() {
    const data = {};
    const formData = new FormData(form);
    for (const [k, v] of formData.entries()) {
      if (data[k]) {
        if (Array.isArray(data[k])) data[k].push(v);
        else data[k] = [data[k], v];
      } else {
        data[k] = v;
      }
    }
    data.files = files.map(f => f.name);
    return data;
  }

  function populateReview() {
    const data = gatherFormData();
    let html = '';
    html += `<div><strong>Name:</strong> ${data['first-name']||''} ${data['last-name']||''}</div>`;
    html += `<div><strong>Email:</strong> ${data['email']||''}</div>`;
    html += `<div><strong>Phone:</strong> ${data['phone']||''}</div>`;
    html += data.organization ? `<div><strong>Organization:</strong> ${data.organization}</div>` : '';
    html += data.country ? `<div><strong>Country:</strong> ${data.country}</div>` : '';
    html += data.city ? `<div><strong>City:</strong> ${data.city}</div>` : '';
    html += data.interests ? `<div><strong>Interests:</strong> ${Array.isArray(data.interests) ? data.interests.join(', ') : data.interests}</div>` : '';
    html += `<div><strong>Subject:</strong> ${data.subject||''}</div>`;
    html += `<div><strong>Message:</strong> ${data.message||''}</div>`;
    html += data['preferred-contact'] ? `<div><strong>Preferred Contact:</strong> ${data['preferred-contact']}</div>` : '';
    html += data['best-time'] ? `<div><strong>Best Time to Contact:</strong> ${data['best-time']}</div>` : '';
    html += data.newsletter ? `<div><strong>Newsletter:</strong> Subscribed</div>` : '';
    html += data.files.length ? `<div><strong>Attachments:</strong> ${data.files.join(', ')}</div>` : '';
    reviewSummary.innerHTML = html;
  }

  function handleFileChange(e) {
    files = Array.from(e.target.files);
    renderFileList();
  }
  function renderFileList() {
    fileList.innerHTML = '';
    files.forEach((file, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2 bg-blue-50 rounded px-3 py-1';
      row.innerHTML = `<span class="text-blue-900">${file.name}</span><button type="button" class="text-red-500 hover:underline text-xs" aria-label="Remove file">Remove</button>`;
      row.querySelector('button').onclick = () => {
        files.splice(idx, 1);
        renderFileList();
        fileInput.value = '';
      };
      fileList.appendChild(row);
    });
  }

  // Message character counter and progress
  if (message && messageCounter && messageProgress) {
    message.addEventListener('input', function() {
      const len = message.value.length;
      messageCounter.textContent = `${len} / 500 characters`;
      messageProgress.style.width = `${Math.min(100, (len/500)*100)}%`;
    });
  }

  // File upload click
  if (fileInput && fileList) {
    fileInput.addEventListener('change', handleFileChange);
    const uploadBox = document.getElementById('file-upload');
    if (uploadBox) {
      uploadBox.addEventListener('click', () => fileInput.click());
      uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.classList.add('border-blue-500'); });
      uploadBox.addEventListener('dragleave', e => { e.preventDefault(); uploadBox.classList.remove('border-blue-500'); });
      uploadBox.addEventListener('drop', e => {
        e.preventDefault();
        files = Array.from(e.dataTransfer.files);
        renderFileList();
        fileInput.value = '';
        uploadBox.classList.remove('border-blue-500');
      });
    }
  }

  // Navigation
  nextBtn.addEventListener('click', function() {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length-1) {
      currentStep++;
      if (currentStep === steps.length-1) populateReview();
      showStep(currentStep);
    }
  });
  prevBtn.addEventListener('click', function() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    createOverlay();
    // Simulate async submit
    setTimeout(() => {
      removeOverlay();
      // Simulate random error for demo
      const isError = false; // set to Math.random() < 0.15 for demo errors
      const data = gatherFormData();
      if (!isError) {
        showModal({
          type: 'success',
          title: `Thank You, ${data['first-name']||'Friend'}!` ,
          message: 'Your message has been sent. We appreciate you reaching out and will respond as soon as possible.',
          summary: '',
          data,
          onClose: () => {
            form.reset();
            files = [];
            renderFileList();
            showStep(0);
            currentStep = 0;
          }
        });
      } else {
        showModal({
          type: 'error',
          title: 'Submission Failed',
          message: 'Something went wrong. Please check your connection and try again.',
          onRetry: () => form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})),
        });
      }
    }, 1800);
  });

  // Reset
  form.addEventListener('reset', function() {
    setTimeout(() => {
      files = [];
      renderFileList();
      showStep(0);
      currentStep = 0;
      formSuccess.classList.add('hidden');
      steps.forEach((step, i) => {
        const fields = step.querySelectorAll('input,select,textarea');
        fields.forEach(f => {
          f.classList.remove('border-red-400');
          const err = document.getElementById(f.id+'-error');
          if (err) err.textContent = '';
        });
      });
    }, 100);
  });

  // Initial
  showStep(0);
})();

/* Animations for modal icons and confetti */
const style = document.createElement('style');
style.innerHTML = `
@keyframes bounce-in { 0%{transform:scale(0.7);opacity:0;} 60%{transform:scale(1.1);} 80%{transform:scale(0.95);} 100%{transform:scale(1);opacity:1;} }
.animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.4,0,.2,1) both; }
@keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
.animate-shake { animation: shake 0.5s cubic-bezier(.4,0,.2,1) both; }
@keyframes fade-in { from{opacity:0;transform:translateY(40px);} to{opacity:1;transform:none;} }
.animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
`;
document.head.appendChild(style);

// Custom Areas of Interest Dropdown
(function() {
  const wrapper = document.getElementById('custom-interests-dropdown');
  if (!wrapper) return;
  const input = wrapper.querySelector('#interests-input');
  const dropdown = wrapper.querySelector('#interests-dropdown');
  const hidden = wrapper.querySelector('input[type="hidden"]');
  const placeholder = input.querySelector('.select-placeholder');

  let open = false;
  let selected = [];

  function updateTags() {
    // Remove old tags
    input.querySelectorAll('.interest-tag').forEach(tag => tag.remove());
    // Add tags for selected
    selected.forEach(val => {
      const tag = document.createElement('span');
      tag.className = 'interest-tag bg-teal-100 text-teal-800 rounded px-2 py-0.5 text-xs font-semibold flex items-center gap-1 mr-1 mb-1';
      tag.innerHTML = `${val.charAt(0).toUpperCase() + val.slice(1)} <button type="button" aria-label="Remove ${val}" class="ml-1 text-teal-500 hover:text-teal-700 focus:outline-none">&times;</button>`;
      tag.querySelector('button').onclick = e => {
        e.stopPropagation();
        setChecked(val, false);
        updateDropdown();
        updateTags();
        updateHidden();
      };
      input.appendChild(tag);
    });
    // Placeholder
    if (selected.length === 0 && placeholder) placeholder.style.display = '';
    else if (placeholder) placeholder.style.display = 'none';
  }

  function updateDropdown() {
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = selected.includes(cb.value);
    });
  }

  function updateHidden() {
    hidden.value = selected.join(',');
  }

  function setChecked(val, checked) {
    if (checked && !selected.includes(val)) selected.push(val);
    else if (!checked) selected = selected.filter(v => v !== val);
  }

  function openDropdown() {
    dropdown.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
    open = true;
    // Focus first checkbox
    setTimeout(() => {
      const first = dropdown.querySelector('input[type="checkbox"]');
      if (first) first.focus();
    }, 100);
  }
  function closeDropdown() {
    dropdown.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    open = false;
  }

  // Toggle dropdown
  input.addEventListener('click', () => {
    open ? closeDropdown() : openDropdown();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
    if (e.key === 'Escape') closeDropdown();
  });

  // Handle checkbox changes
  dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', e => {
      setChecked(cb.value, cb.checked);
      updateTags();
      updateHidden();
    });
    cb.addEventListener('keydown', e => {
      if (e.key === 'Tab') closeDropdown();
      if (e.key === 'Escape') closeDropdown();
    });
  });

  // Click outside to close
  document.addEventListener('mousedown', e => {
    if (!wrapper.contains(e.target)) closeDropdown();
  });

  // Sync tags and dropdown on load
  updateTags();
  updateDropdown();
  updateHidden();
})(); 