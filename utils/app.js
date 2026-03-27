// NOETICA - Private Neural Companion
// NO MODULES VERSION

const App = {
  currentView: 'mind',
  messages: [],
  isLoading: false,
  user: null,
  streak: 7,
  moodScore: 85,
  tokens: 1250,

  init() {
    this.loadUser();
    this.setupEventListeners();
    this.renderNavigation();
    this.renderMindView();
    this.updateWalletDisplay();
  },

  loadUser() {
    const savedUser = localStorage.getItem('noetica_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  },

  saveUser() {
    if (this.user) {
      localStorage.setItem('noetica_user', JSON.stringify(this.user));
    }
  },

  setupEventListeners() {
    window.addEventListener('online', () => this.updateConnectionStatus(true));
    window.addEventListener('offline', () => this.updateConnectionStatus(false));
  },

  updateConnectionStatus(online) {
    const status = document.getElementById('connection-status');
    if (status) {
      status.textContent = online ? 'Connected to COTI Network' : 'Offline';
      status.style.color = online ? '#10b981' : '#ef4444';
    }
  },

  renderNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    
    const views = ['mind', 'mood', 'journal', 'rewards'];
    const labels = ['Mind', 'Mood', 'Journal', 'Rewards'];
    
    nav.innerHTML = labels.map((label, i) => 
      \`<button class="\${views[i] === this.currentView ? 'active' : ''}" onclick="App.switchView('\${views[i]}')">\${label}</button>\`
    ).join('');
  },

  switchView(view) {
    this.currentView = view;
    this.renderNavigation();
    if (view === 'mind') this.renderMindView();
    else if (view === 'mood') this.renderMoodView();
    else if (view === 'journal') this.renderJournalView();
    else if (view === 'rewards') this.renderRewardsView();
  },

  updateWalletDisplay() {
    const walletAddr = document.getElementById('wallet-address');
    if (walletAddr && this.user && this.user.wallet) {
      walletAddr.textContent = this.user.wallet.slice(0, 6) + '...' + this.user.wallet.slice(-4);
    }
  },

  async sendMessage(content) {
    if (this.isLoading || !content.trim()) return;
    
    this.isLoading = true;
    this.addMessage('user', content);
    this.renderMindView();
    
    try {
      const response = await AI.sendMessage(this.messages.map(m => ({ role: m.role, content: m.content })));
      if (response.error) {
        this.addMessage('assistant', 'Error: ' + response.error);
      } else {
        this.addMessage('assistant', response.content);
      }
    } catch (e) {
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
    
    this.isLoading = false;
    this.renderMindView();
  },

  addMessage(role, content) {
    this.messages.push({ role, content, timestamp: Date.now() });
  },

  renderMindView() {
    const main = document.getElementById('main-view');
    if (!main) return;
    
    const messagesHtml = this.messages.map(m => 
      \`<div class="message \${m.role}"><div class="message-content">\${m.content}</div></div>\`
    ).join('');
    
    const quickReplies = ['I feel anxious today', 'Help me process my thoughts', 'I need someone to talk to', 'What can you help me with?'];
    const quickHtml = quickReplies.map(q => 
      \`<button class="quick-reply" onclick="App.sendMessage('\${q}')">\${q}</button>\`
    ).join('');
    
    main.innerHTML = \`
      <div class="mind-container">
        <div class="messages">\${messagesHtml || '<p class="welcome">How are you feeling today?</p>'}</div>
        \${quickHtml}
        <div class="input-area">
          <input type="text" id="message-input" placeholder="Share what's on your mind..." onkeypress="if(event.key==='Enter')App.handleInput()">
          <button onclick="App.handleInput()">Send</button>
        </div>
      </div>
    \`;
  },

  handleInput() {
    const input = document.getElementById('message-input');
    if (input && input.value.trim()) {
      this.sendMessage(input.value.trim());
      input.value = '';
    }
  },

  renderMoodView() {
    const main = document.getElementById('main-view');
    if (!main) return;
    main.innerHTML = '<div class="mood-tracker"><h2>How are you feeling?</h2><p>Track your emotional wellness journey</p></div>';
  },

  renderJournalView() {
    const main = document.getElementById('main-view');
    if (!main) return;
    main.innerHTML = '<div class="journal"><h2>Private Journal</h2><p>Your thoughts, encrypted forever</p></div>';
  },

  renderRewardsView() {
    const main = document.getElementById('main-view');
    if (!main) return;
    main.innerHTML = '<div class="rewards"><h2>NOETICA Rewards</h2><p>Earn tokens for engaging with your mental wellness</p></div>';
  }
};

// AI Module
const AI = {
  async sendMessage(messages) {
    const key = localStorage.getItem('noetica_apikey');
    if (!key) {
      return { content: '', error: 'No API key. Please add your Hermes API key.' };
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, apiKey: key })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        return { content: '', error: data.error || 'Request failed' };
      }
      return { content: data.content };
    } catch (e) {
      return { content: '', error: 'Network error. Please try again.' };
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
