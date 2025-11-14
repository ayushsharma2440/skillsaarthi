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

      // Get gig information
      const gigTitle = document.querySelector('.gig-section h1')?.textContent || 'Service Request';
      const sellerName = document.querySelector('.seller-name')?.textContent || 'Saarthi';
      const tokenCost = document.querySelector('.pricing-value span:last-child')?.textContent || '0';

      // Check if user has enough tokens
      const walletBalance = parseInt(document.querySelector('.wallet-balance')?.textContent || '0');
      const requiredTokens = parseInt(tokenCost) || 0;

      if (walletBalance < requiredTokens) {
        showInfo(`You need ${requiredTokens} ST but only have ${walletBalance} ST. Please earn more tokens first.`);
        return;
      }

      // Confirm request
      if (confirm(`Request this service for ${tokenCost} Saarthi Tokens?\n\nThis will create a workspace where you can collaborate with ${sellerName}.`)) {
        // Create workspace URL
        const requestId = 'req-' + Date.now();
        const applicantId = 'app-' + Date.now();
        const workspaceUrl = `/workspace/${requestId}/${applicantId}?applicantName=${encodeURIComponent(sellerName)}&requestTitle=${encodeURIComponent(gigTitle)}`;
        
        // Navigate to workspace
        window.location.href = workspaceUrl;
      }
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

      // Get request information
      const requestCard = button.closest('.card');
      const requestTitle = requestCard?.querySelector('h3')?.textContent || 'Request';
      const requesterName = requestCard?.querySelector('.seller strong')?.textContent || 'Requester';
      const budget = requestCard?.querySelector('.token-value')?.textContent || '0';

      // Show confirmation
      if (confirm(`Apply to help with "${requestTitle}"?\n\nBudget: ${budget} ST\n\nYour application will be sent to ${requesterName}. They can approve you from their profile.`)) {
        showInfo('Application sent! The requester will review your application in their profile. You can check your dashboard for updates.');
        // In a full app, this would create an application record
        // For now, redirect to profile to show where they would see applicants
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      }
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
  const overviewBtn = document.querySelector('[data-profile-edit-overview]');
  const overviewEmpty = document.querySelector('[data-profile-overview-empty]');
  const overviewText = document.querySelector('[data-profile-overview-text]');
  const linkedinBtn = document.querySelector('[data-profile-connect-linkedin]');
  const linkedinStatus = document.querySelector('[data-profile-linkedin-status]');
  const botToggle = document.querySelector('.saarthi-bot-toggle');
  const botPanel = document.querySelector('.saarthi-bot-panel');
  const botClose = document.querySelector('.saarthi-bot-close');
  const botMessages = document.querySelector('[data-saarthi-messages]');
  const botForm = document.querySelector('.saarthi-bot-form');
  const botInput = botForm ? botForm.querySelector('input[name="message"]') : null;

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

          // Get applicant name and request title
          const applicantNameEl = item.querySelector('strong');
          const applicantName = applicantNameEl ? applicantNameEl.textContent.trim() : 'Applicant';
          
          // Try to get request title from the page
          const requestTitleEl = document.querySelector('.dashboard-column h2 + p strong');
          const requestTitle = requestTitleEl ? requestTitleEl.textContent.trim() : 'Your Request';

          // Navigate to workspace
          const requestId = 'req-1'; // Mock request ID
          const applicantId = 'app-' + Date.now(); // Mock applicant ID
          const workspaceUrl = `/workspace/${requestId}/${applicantId}?applicantName=${encodeURIComponent(applicantName)}&requestTitle=${encodeURIComponent(requestTitle)}`;
          
          // Show confirmation and navigate
          if (confirm(`Approve ${applicantName} and open collaborative workspace?`)) {
            window.location.href = workspaceUrl;
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

  // Profile Overview: add/edit simple experience text (frontend only)
  if (overviewBtn && overviewText && overviewEmpty) {
    overviewBtn.addEventListener('click', () => {
      const current = overviewText.textContent ? overviewText.textContent.trim() : '';
      const input = window.prompt(
        'Describe your experience, skills, and what kind of work you want help with:',
        current
      );

      if (input && input.trim().length > 0) {
        overviewEmpty.classList.add('hidden');
        overviewText.textContent = input.trim();
        overviewText.classList.remove('hidden');
        overviewBtn.textContent = 'Edit experience';
      }
    });
  }

  // Profile LinkedIn connect (frontend-only simulation)
  if (linkedinBtn && linkedinStatus) {
    linkedinBtn.addEventListener('click', () => {
      const alreadyConnected = linkedinBtn.dataset.connected === 'true';

      if (alreadyConnected) {
        showInfo('Your profile is already marked as connected to LinkedIn in this demo.');
        return;
      }

      showInfo(
        'In a full app, this would open LinkedIn and ask for permission to connect your profile. For this prototype, we will just mark it as connected.'
      );

      linkedinBtn.dataset.connected = 'true';
      linkedinBtn.textContent = 'LinkedIn connected';
      linkedinBtn.classList.add('btn-secondary');
      linkedinStatus.textContent = 'Connected via LinkedIn (demo)';
    });
  }

  // SAARTHI-BOT chatbot (frontend only)
  if (botToggle && botPanel && botMessages && botForm && botInput) {
    let botHasGreeted = false;
    let questionsShown = false;

    // Predefined questions
    const predefinedQuestions = [
      'What are Saarthi Tokens?',
      'How do I earn tokens?',
      'How does the dashboard work?',
      'What can I do on my profile?',
      'How do I post a request?',
      'How do I offer my services?',
      'What is the difference between client and Saarthi?'
    ];

    function appendBotMessage(text, from) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('saarthi-bot-message');
      wrapper.classList.add(from === 'user' ? 'user' : 'bot');
      wrapper.textContent = text;
      botMessages.appendChild(wrapper);
      botMessages.scrollTop = botMessages.scrollHeight;
    }

    function showPredefinedQuestions() {
      if (questionsShown) return;
      // Check if questions already exist
      if (botMessages.querySelector('.saarthi-bot-questions')) return;
      questionsShown = true;

      const questionsContainer = document.createElement('div');
      questionsContainer.classList.add('saarthi-bot-questions');
      
      const title = document.createElement('div');
      title.classList.add('saarthi-bot-questions-title');
      title.textContent = 'Quick questions:';
      questionsContainer.appendChild(title);

      predefinedQuestions.forEach((question) => {
        const questionBtn = document.createElement('button');
        questionBtn.classList.add('saarthi-bot-question-btn');
        questionBtn.textContent = question;
        questionBtn.addEventListener('click', () => {
          // Remove questions after clicking
          questionsContainer.remove();
          questionsShown = false;
          // Send the question
          appendBotMessage(question, 'user');
          const reply = getBotReply(question);
          setTimeout(() => appendBotMessage(reply, 'bot'), 150);
        });
        questionsContainer.appendChild(questionBtn);
      });

      botMessages.appendChild(questionsContainer);
      botMessages.scrollTop = botMessages.scrollHeight;
    }

    function getBotReply(text) {
      const lower = text.toLowerCase();

      if (lower.includes('token') && (lower.includes('what') || lower.includes('are'))) {
        return 'Saarthi Tokens (ST) are the credits you use instead of money. You earn them by helping others and spend them to request work from Saarthis. New users start with 120 tokens!';
      }
      if (lower.includes('earn') || (lower.includes('how') && lower.includes('token'))) {
        return 'You earn Saarthi Tokens by completing work for others. When someone requests your service or accepts your offer, you receive tokens as payment. The amount depends on the work complexity and your skill tier.';
      }
      if (lower.includes('dashboard')) {
        return 'The dashboard shows your wallet balance, tokens earned and spent, and lets you switch between client view (your requests) and Saarthi view (services you offer). It\'s your central hub for managing activity.';
      }
      if (lower.includes('profile')) {
        return 'On your Profile tab you can see your requests, manage applicants (approve/deny), edit your experience overview, connect LinkedIn, set communication preferences, and view reviews.';
      }
      if (lower.includes('post') && lower.includes('request')) {
        return 'Go to "Post a new request" from the dashboard or navigation. Fill in the title, category, description, and set your token budget. Others can then see and apply to help with your request.';
      }
      if (lower.includes('offer') || (lower.includes('service') && lower.includes('how'))) {
        return 'Click "Publish a new service" from the dashboard. Describe what you can help with, set your token price, choose a category and skill tier. Your service will appear in the Explore section.';
      }
      if (lower.includes('difference') || (lower.includes('client') && lower.includes('saarthi'))) {
        return 'Clients post requests when they need help and spend tokens. Saarthis offer services or respond to requests and earn tokens. You can be both! Use the dashboard toggle to switch views.';
      }
      if (lower.includes('token')) {
        return 'Saarthi Tokens (ST) are the credits you use instead of money. You earn them by helping others and spend them to request work from Saarthis.';
      }
      if (lower.includes('role') || lower.includes('client') || lower.includes('saarthi')) {
        return 'Skillसारथी has two main roles: clients who post requests and Saarthis who fulfil them. You can switch views in the dashboard to see both sides.';
      }
      if (lower.includes('theme') || lower.includes('dark') || lower.includes('light')) {
        return 'Use the theme toggle in the top-right header to switch between light and dark mode. Your choice is saved for your next visit.';
      }
      if (lower.includes('linkedin')) {
        return 'The LinkedIn button on your profile is a demo that simulates connecting your LinkedIn profile to Skillसारथी.';
      }
      if (lower.includes('request') || lower.includes('explore')) {
        return 'From Explore you can browse Saarthi services or open requests to fulfil. From the dashboard/profile you can manage your own requests and applicants.';
      }
      if (lower.includes('login') || lower.includes('register') || lower.includes('auth')) {
        return 'You can register and log in with email and password. After login, your token balance, dashboard, and profile become active.';
      }

      return 'I am SAARTHI-BOT. I can explain Skillसारथी features like Saarthi Tokens, roles, dashboard, profile, LinkedIn connect, and the light/dark theme toggle. Try asking "What are Saarthi Tokens?" or "What can I do on the profile page?".';
    }

    function ensureGreeting() {
      if (!botHasGreeted) {
        appendBotMessage(
          'Hi, I am SAARTHI-BOT. Ask me anything about Skillसारथी and how this prototype works.',
          'bot'
        );
        botHasGreeted = true;
        // Show predefined questions after greeting
        setTimeout(() => showPredefinedQuestions(), 300);
      }
    }

    botToggle.addEventListener('click', () => {
      const isHidden = botPanel.classList.contains('hidden');
      if (isHidden) {
        botPanel.classList.remove('hidden');
        ensureGreeting();
        // Reset questions flag when reopening and show questions
        questionsShown = false;
        setTimeout(() => {
          botInput.focus();
          // Show questions after a short delay
          setTimeout(() => {
            if (!botMessages.querySelector('.saarthi-bot-questions')) {
              showPredefinedQuestions();
            }
          }, 350);
        }, 50);
      } else {
        botPanel.classList.add('hidden');
      }
    });

    if (botClose) {
      botClose.addEventListener('click', () => {
        botPanel.classList.add('hidden');
      });
    }

    botForm.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const text = botInput.value.trim();
      if (!text) return;

      // Hide questions if still showing
      const questionsContainer = botMessages.querySelector('.saarthi-bot-questions');
      if (questionsContainer) {
        questionsContainer.remove();
        questionsShown = false;
      }

      appendBotMessage(text, 'user');
      botInput.value = '';

      const reply = getBotReply(text);
      setTimeout(() => appendBotMessage(reply, 'bot'), 150);
    });
  }

  // Workspace functionality
  const workspacePage = document.querySelector('.page-workspace');
  if (workspacePage) {
    let videoEnabled = true;
    let audioEnabled = true;
    let screenSharing = false;

    // Video toggle
    const videoToggleBtns = document.querySelectorAll('[data-video-toggle]');
    videoToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        videoEnabled = !videoEnabled;
        const videoOverlays = document.querySelectorAll('.video-overlay');
        videoOverlays.forEach((overlay) => {
          if (!videoEnabled) {
            overlay.style.opacity = '1';
          } else {
            overlay.style.opacity = '0.9';
          }
        });
        btn.querySelector('span').textContent = videoEnabled ? '📹' : '📹❌';
        showInfo(videoEnabled ? 'Video enabled' : 'Video disabled');
      });
    });

    // Audio toggle
    const audioToggleBtns = document.querySelectorAll('[data-audio-toggle]');
    audioToggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        btn.querySelector('span').textContent = audioEnabled ? '🎤' : '🎤❌';
        showInfo(audioEnabled ? 'Audio enabled' : 'Audio muted');
      });
    });

    // Screen share
    const screenShareBtn = document.querySelector('[data-screen-share]');
    const screenShareModal = document.querySelector('[data-screen-share-modal]');
    const cancelShareBtn = document.querySelector('[data-cancel-share]');
    const shareOptionBtns = document.querySelectorAll('[data-share-option]');

    if (screenShareBtn && screenShareModal) {
      screenShareBtn.addEventListener('click', () => {
        screenShareModal.classList.remove('hidden');
      });
    }

    if (cancelShareBtn && screenShareModal) {
      cancelShareBtn.addEventListener('click', () => {
        screenShareModal.classList.add('hidden');
      });
    }

    shareOptionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const option = btn.getAttribute('data-share-option');
        screenSharing = true;
        screenShareModal.classList.add('hidden');
        showInfo(`Sharing ${option.replace('-', ' ')}. In a full app, this would start screen sharing via WebRTC.`);
        screenShareBtn.querySelector('span').textContent = '🖥️✓';
        screenShareBtn.classList.add('btn-control-active');
      });
    });

    // End call
    const endCallBtn = document.querySelector('[data-end-call]');
    if (endCallBtn) {
      endCallBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to end this call?')) {
          showInfo('Call ended. In a full app, this would disconnect the session.');
          setTimeout(() => {
            window.location.href = '/profile';
          }, 1000);
        }
      });
    }

    // Chat functionality
    const chatForm = document.querySelector('[data-chat-form]');
    const chatMessages = document.querySelector('[data-chat-messages]');
    const chatInput = chatForm ? chatForm.querySelector('input') : null;

    if (chatForm && chatInput && chatMessages) {
      chatForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', 'chat-message-user');
        messageEl.innerHTML = `
          <div class="chat-message-content">
            <p>${text}</p>
          </div>
          <div class="chat-message-time">Just now</div>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        // Simulate response after a delay
        setTimeout(() => {
          const responseEl = document.createElement('div');
          responseEl.classList.add('chat-message', 'chat-message-bot');
          const responses = [
            'Got it! I\'ll work on that.',
            'Understood. Let me check that for you.',
            'Perfect! I\'ll get started on that right away.',
            'Sounds good! I\'ll update you once it\'s done.'
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          responseEl.innerHTML = `
            <div class="chat-message-content">
              <p>${randomResponse}</p>
            </div>
            <div class="chat-message-time">Just now</div>
          `;
          chatMessages.appendChild(responseEl);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
      });
    }

    // Chat toggle (minimize)
    const chatToggleBtn = document.querySelector('[data-chat-toggle]');
    const chatSection = document.querySelector('.workspace-chat-section');
    if (chatToggleBtn && chatSection) {
      chatToggleBtn.addEventListener('click', () => {
        const isMinimized = chatSection.classList.contains('minimized');
        if (isMinimized) {
          chatSection.classList.remove('minimized');
          chatToggleBtn.textContent = 'Minimize';
        } else {
          chatSection.classList.add('minimized');
          chatToggleBtn.textContent = 'Expand';
        }
      });
    }
  }
});
