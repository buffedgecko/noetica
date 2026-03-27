// NOETICA - Private Neural Companion
// Mobile-first, professional chat UI

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
    // Handle online status
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
    
    const navItems = [
      { id: 'mind', icon: '🧠', label: 'Mind' },
      { id: 'mood', icon: '💚', label: 'Mood' },
      { id: 'journal', icon: '📓', label: 'Journal' },
      { id: 'rewards', icon: '🎁', label: 'Rewards' }
    ];

    nav.innerHTML = navItems.map(item => \`
      <button class="nav-item \${this.currentView === item.id ? 'active' : ''}" onclick="App.switchView('\${item.id}')">
        <span class="nav-icon">\${item.icon}</span>
        <span class="nav-label">\${item.label}</span>
      </button>
    \`).join('');
  },

  switchView(view) {
    this.currentView = view;
    this.renderNavigation();
    
    const content = document.getElementById('content');
    if (!content) return;

    switch(view) {
      case 'mind':
        this.renderMindView();
        break;
      case 'mood':
        this.renderMoodView();
        break;
      case 'journal':
        this.renderJournalView();
        break;
      case 'rewards':
        this.renderRewardsView();
        break;
    }
  },

  renderMindView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = \`
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
          \${this.messages.length === 0 ? \`
            <div class="welcome-message">
              <div class="welcome-icon">🧠</div>
              <h2>Welcome back, \${this.user?.name || 'Friend'}</h2>
              <p>Your private sanctuary awaits. How are you feeling today?</p>
            </div>
          \` : this.messages.map(msg => this.renderMessage(msg)).join('')}
        </div>
        
        <div class="chat-input-container">
          <div class="quick-actions">
            <button class="quick-btn" onclick="App.sendQuickMessage('I feel anxious today')">😰 I feel anxious</button>
            <button class="quick-btn" onclick="App.sendQuickMessage('I need to process my thoughts')">💭 Process thoughts</button>
          </div>
          
          <div class="input-wrapper">
            <input type="text" id="chat-input" placeholder="Share what's on your mind..." onkeypress="if(event.key==='Enter')App.sendMessage()">
            <button class="send-btn" onclick="App.sendMessage()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    \`;

    this.scrollToBottom();
  },

  renderMessage(msg) {
    const isUser = msg.role === 'user';
    return \`
      <div class="message \${isUser ? 'user' : 'ai'}">
        <div class="message-content">\${msg.content}</div>
        <div class="message-time">\${msg.time}</div>
      </div>
    \`;
  },

  scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  },

  async sendQuickMessage(text) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = text;
      await this.sendMessage();
    }
  },

  async sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim() || this.isLoading) return;

    const text = input.value.trim();
    input.value = '';

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    this.messages.push(userMsg);
    this.renderMindView();

    // Re-render after adding message
    this.$nextTick(() => {
      const container = document.getElementById('chat-messages');
      if (container) {
        const userMsgEl = container.querySelector('.message.user:last-child');
        if (userMsgEl) {
          container.scrollTop = container.scrollHeight;
        }
      }
    });

    await this.getAIResponse(text);
  },

  async getAIResponse(userText) {
    this.isLoading = true;
    this.updateLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg = {
        role: 'ai',
        content: data.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      this.messages.push(aiMsg);
    } catch (error) {
      const errorMsg = {
        role: 'ai',
        content: 'I apologize, but I\\'m having trouble connecting. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.messages.push(errorMsg);
    } finally {
      this.isLoading = false;
      this.updateLoading(false);
      this.renderMindView();
    }
  },

  updateLoading(loading) {
    const btn = document.querySelector('.send-btn');
    if (btn) {
      btn.disabled = loading;
      btn.innerHTML = loading 
        ? '<div class="loading-spinner"></div>' 
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    }
  },

  renderMoodView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = \`
      <div class="mood-container">
        <h2>💚 Mood Tracker</h2>
        <div class="mood-score">
          <div class="score-circle" style="--score: \${this.moodScore}">
            <span class="score-value">\${this.moodScore}%</span>
            <span class="score-label">Wellness</span>
          </div>
        </div>
        <div class="mood-history">
          <h3>This Week</h3>
          <div class="mood-chart">
            \${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => \`
              <div class="chart-bar" style="height: \${50 + Math.random() * 50}%">
                <span class="bar-label">\${day}</span>
              </div>
            \`).join('')}
          </div>
        </div>
        <div class="streak-badge">
          🔥 \${this.streak} Day Streak!
        </div>
      </div>
    \`;
  },

  renderJournalView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = \`
      <div class="journal-container">
        <h2>📓 Journal</h2>
        <div class="journal-entries">
          \${this.messages.slice(0, 10).map((msg, i) => msg.role === 'user' ? \`
            <div class="journal-entry">
              <div class="entry-date">\${msg.time}</div>
              <div class="entry-preview">\${msg.content.substring(0, 100)}...</div>
            </div>
          \` : '').join('') || '<p class="empty-state">Start a conversation to create journal entries</p>'}
        </div>
      </div>
    \`;
  },

  renderRewardsView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = \`
      <div class="rewards-container">
        <h2>🎁 Rewards</h2>
        <div class="token-balance">
          <span class="token-icon">Ψ</span>
          <span class="token-amount">\${this.tokens.toLocaleString()}</span>
          <span class="token-label">NOETICA Tokens</span>
        </div>
        <div class="rewards-list">
          <div class="reward-item">
            <span class="reward-icon">📱</span>
            <div class="reward-info">
              <h4>Daily Check-in</h4>
              <p>+10 Ψ</p>
            </div>
            <button class="claim-btn" onclick="App.claimReward('checkin')">Claim</button>
          </div>
          <div class="reward-item">
            <span class="reward-icon">🧠</span>
            <div class="reward-info">
              <h4>Mindful Session</h4>
              <p>+25 Ψ</p>
            </div>
            <button class="claim-btn" onclick="App.claimReward('mindful')">Claim</button>
          </div>
          <div class="reward-item">
            <span class="reward-icon">📓</span>
            <div class="reward-info">
              <h4>Journal Entry</h4>
              <p>+15 Ψ</p>
            </div>
            <button class="claim-btn" onclick="App.claimReward('journal')">Claim</button>
          </div>
        </div>
      </div>
    \`;
  },

  claimReward(type) {
    const rewards = { checkin: 10, mindful: 25, journal: 15 };
    this.tokens += rewards[type] || 0;
    this.renderRewardsView();
  },

  $nextTick(fn) {
    setTimeout(fn, 0);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
