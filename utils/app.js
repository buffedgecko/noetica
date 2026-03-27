// NOETICA - Private Neural Companion - NO MODULES

const App = {
  currentView: 'mind',
  messages: [],
  isLoading: false,
  user: null,

  init() {
    document.getElementById('begin-btn').addEventListener('click', () => this.begin());
  },

  begin() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    this.renderNavigation();
    this.renderMindView();
    this.updateWalletDisplay();
  },

  updateWalletDisplay() {
    const walletAddr = document.getElementById('wallet-address');
    if (walletAddr && this.user && this.user.wallet) {
      walletAddr.textContent = this.user.wallet.slice(0, 6) + '...' + this.user.wallet.slice(-4);
    }
  },

  renderNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    nav.innerHTML = '<button class="active" onclick="App.switchView(\'mind\')">Mind</button><button onclick="App.switchView(\'mood\')">Mood</button><button onclick="App.switchView(\'journal\')">Journal</button><button onclick="App.switchView(\'rewards\')">Rewards</button>';
  },

  switchView(view) {
    this.currentView = view;
    this.renderNavigation();
    document.getElementById('main-view').innerHTML = '<p>Loading...</p>';
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
      this.addMessage('assistant', 'Sorry, I encountered an error.');
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
    const messagesHtml = this.messages.map(m => '<div class="message ' + m.role + '"><div class="message-content">' + m.content + '</div></div>').join('');
    const quickHtml = '<div class="quick-replies"><button onclick="App.sendMessage(\'I feel anxious today\')">I feel anxious today</button><button onclick="App.sendMessage(\'Help me process my thoughts\')">Help me process my thoughts</button></div>';
    const inputHtml = '<div class="input-area"><input type="text" id="message-input" placeholder="Share what\'s on your mind..."><button onclick="App.handleInput()">Send</button></div>';
    main.innerHTML = '<div class="mind-container"><div class="messages">' + (messagesHtml || '<p class="welcome">How are you feeling today?</p>') + '</div>' + quickHtml + inputHtml + '</div>';
  },

  handleInput() {
    const input = document.getElementById('message-input');
    if (input && input.value.trim()) {
      this.sendMessage(input.value.trim());
      input.value = '';
    }
  }
};

const AI = {
  async sendMessage(messages) {
    const key = localStorage.getItem('noetica_apikey');
    if (!key) return { content: '', error: 'No API key. Please add your Hermes API key.' };
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, apiKey: key })
      });
      const data = await response.json();
      if (!response.ok || data.error) return { content: '', error: data.error || 'Request failed' };
      return { content: data.content };
    } catch (e) {
      return { content: '', error: 'Network error. Please try again.' };
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
