document.addEventListener('DOMContentLoaded', () => {
  const authForms = document.querySelectorAll('.auth-form');
  const body = document.body;

  // Disable submit and show loading text on auth forms
  authForms.forEach((form) => {
    form.addEventListener('submit', () => {
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        const original = button.textContent;
        button.dataset.originalText = original;
        button.textContent = 'Please wait...';
      }
    });
  });

  // Dashboard role toggle (client vs Saarthi view)
  const roleToggleButtons = document.querySelectorAll('[data-role-toggle]');
  const roleSections = document.querySelectorAll('[data-role-section]');

  roleToggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-role-toggle');

      roleToggleButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      roleSections.forEach((section) => {
        const sectionRole = section.getAttribute('data-role-section');
        if (sectionRole === target) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });

  // Theme toggle (light / dark)
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const themeToggleText = document.querySelector('.theme-toggle-text');

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      if (themeToggleText) themeToggleText.textContent = 'Light';
    } else {
      body.classList.remove('dark-theme');
      if (themeToggleText) themeToggleText.textContent = 'Dark';
    }
  }

  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = body.classList.contains('dark-theme') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }

  // Gig page buttons: Request with tokens / Message Saarthi
  const isLoggedIn = body.getAttribute('data-logged-in') === 'true';

  const requestBtn = document.querySelector('.gig-sidebar .btn.btn-primary');
  const messageBtn = document.querySelector('.gig-sidebar .btn.btn-ghost');

  function showInfo(message) {
    alert(message);
  }

  if (requestBtn) {
    requestBtn.addEventListener('click', () => {
      if (!isLoggedIn) {
        showInfo('Please log in to request this Saarthi with tokens.');
        window.location.href = '/login';
        return;
      }
      showInfo('In a full app, this would open a confirmation dialog and lock the required tokens. For now, this is a demo interaction.');
    });
  }

  if (messageBtn) {
    messageBtn.addEventListener('click', () => {
      if (!isLoggedIn) {
        showInfo('Please log in to message this Saarthi.');
        window.location.href = '/login';
        return;
      }
      showInfo('In a full app, this would open an in-platform chat with the Saarthi. For this prototype, it is just a demo action.');
    });
  }

  // Explore page toggle (services vs requests)
  const exploreToggleButtons = document.querySelectorAll('[data-explore-toggle]');
  const exploreSections = document.querySelectorAll('[data-explore-section]');

  exploreToggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-explore-toggle');

      exploreToggleButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      exploreSections.forEach((section) => {
        const sectionKey = section.getAttribute('data-explore-section');
        if (sectionKey === target) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });

  // "Offer to help" buttons on explore requests
  const offerButtons = document.querySelectorAll('[data-explore-section="requests"] .btn');

  offerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isLoggedIn) {
        showInfo('Please log in to offer your help on this request.');
        window.location.href = '/login';
        return;
      }
      showInfo('In a full app, this would let you send an offer to the requester. For now, it is a demo interaction.');
    });
  });

  // Profile page: show applicants + approve/deny (frontend only)
  const showApplicantsBtn = document.querySelector('[data-show-applicants]');
  const applicantsList = document.querySelector('.applicants-list');
  const applicantFilterButtons = document.querySelectorAll('[data-applicant-filter]');
  const totalEl = document.querySelector('[data-applicants-total]');
  const approvedEl = document.querySelector('[data-applicants-approved]');
  const pendingEl = document.querySelector('[data-applicants-pending]');
  const deniedEl = document.querySelector('[data-applicants-denied]');

  if (showApplicantsBtn && applicantsList) {
    const applicantItems = applicantsList.querySelectorAll('li');

    function recalcApplicantSummary() {
      let total = 0;
      let approved = 0;
      let pending = 0;
      let denied = 0;

      applicantItems.forEach((item) => {
        total += 1;
        const status = item.getAttribute('data-applicant-status') || 'pending';
        if (status === 'approved') {
          approved += 1;
        } else if (status === 'denied') {
          denied += 1;
        } else {
          pending += 1;
        }
      });

      if (totalEl) totalEl.textContent = String(total);
      if (approvedEl) approvedEl.textContent = String(approved);
      if (pendingEl) pendingEl.textContent = String(pending);
      if (deniedEl) deniedEl.textContent = String(denied);
    }

    function applyApplicantFilter(filter) {
      applicantItems.forEach((item) => {
        const status = item.getAttribute('data-applicant-status') || 'pending';
        if (filter === 'all' || filter === status) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }

    showApplicantsBtn.addEventListener('click', () => {
      const isHidden = applicantsList.classList.contains('hidden');
      applicantsList.classList.toggle('hidden');
      showApplicantsBtn.textContent = isHidden ? 'Hide applicants' : 'View 4 applicants';
    });

    applicantItems.forEach((item) => {
      const statusEl = item.querySelector('.applicant-status');
      const approveBtn = item.querySelector('[data-approve]');
      const denyBtn = item.querySelector('[data-deny]');

      if (approveBtn && statusEl) {
        approveBtn.addEventListener('click', () => {
          statusEl.textContent = 'Approved';
          statusEl.classList.add('tag-success');
          item.setAttribute('data-applicant-status', 'approved');
          recalcApplicantSummary();

          const activeFilterBtn = document.querySelector('[data-applicant-filter].active');
          if (activeFilterBtn) {
            const filter = activeFilterBtn.getAttribute('data-applicant-filter') || 'all';
            applyApplicantFilter(filter);
          }
        });
      }

      if (denyBtn && statusEl) {
        denyBtn.addEventListener('click', () => {
          statusEl.textContent = 'Denied';
          statusEl.classList.remove('tag-success');
          item.setAttribute('data-applicant-status', 'denied');
          recalcApplicantSummary();

          const activeFilterBtn = document.querySelector('[data-applicant-filter].active');
          if (activeFilterBtn) {
            const filter = activeFilterBtn.getAttribute('data-applicant-filter') || 'all';
            applyApplicantFilter(filter);
          }
        });
      }
    });

    if (applicantFilterButtons.length) {
      applicantFilterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-applicant-filter') || 'all';

          applicantFilterButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          applyApplicantFilter(filter);
        });
      });
    }

    recalcApplicantSummary();
  }
});
