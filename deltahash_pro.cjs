const axios = require('axios');
const WebSocket = require('ws');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

const colors = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", white: "\x1b[37m",
  bold: "\x1b[1m", magenta: "\x1b[35m", blue: "\x1b[34m",
  gray: "\x1b[90m",
};

const logger = {
  info: (msg) => console.log(`${colors.cyan}●${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚡${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  loading: (msg) => console.log(`${colors.blue}▶${colors.reset} ${msg}`),
  mining: (msg) => console.log(`${colors.magenta}⛏${colors.reset} ${msg}`),
  banner: () => {
    console.log(`\n${colors.cyan}${colors.bold}`);
    console.log(`    ██╗    ██╗██╗███╗   ██╗███████╗███╗   ██╗██╗██████╗ `);
    console.log(`    ██║    ██║██║████╗  ██║██╔════╝████╗  ██║██║██╔══██╗`);
    console.log(`    ██║ █╗ ██║██║██╔██╗ ██║███████╗██╔██╗ ██║██║██████╔╝`);
    console.log(`    ██║███╗██║██║██║╚██╗██║╚════██║██║╚██╗██║██║██╔═══╝ `);
    console.log(`    ╚███╔███╔╝██║██║ ╚████║███████║██║ ╚████║██║██║     `);
    console.log(`     ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     `);
    console.log(`${colors.reset}`);
    console.log(`${colors.white}    WINSNIP Mining Bot ${colors.yellow}v1.0.0${colors.reset}`);
    console.log(`${colors.gray}    Multi-Account • Proxy Support • Auto Mining${colors.reset}\n`);
  },
  separator: () => console.log(`${colors.gray}${'━'.repeat(65)}${colors.reset}`),
  thinSeparator: () => console.log(`${colors.gray}${'─'.repeat(65)}${colors.reset}`),
  box: (title, content) => {
    const width = 63;
    console.log(`\n${colors.cyan}╭${'─'.repeat(width)}╮${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bold}${title}${colors.reset}${' '.repeat(width - title.length - 1)}${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├${'─'.repeat(width)}┤${colors.reset}`);
    content.forEach(line => {
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
      const padding = width - cleanLine.length - 1;
      console.log(`${colors.cyan}│${colors.reset} ${line}${' '.repeat(padding)}${colors.cyan}│${colors.reset}`);
    });
    console.log(`${colors.cyan}╰${'─'.repeat(width)}╯${colors.reset}\n`);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DeltaHashMiner {
  constructor(accountConfig, accountIndex) {
    this.accountConfig = accountConfig;
    this.token = accountConfig.token;
    this.accountIndex = accountIndex;
    this.accountName = accountConfig.name || `Account ${accountIndex}`;
    this.baseURL = 'https://portal.deltahash.ai/api';
    this.wsURL = 'wss://portal.deltahash.ai/ws';
    this.ws = null;
    this.isConnected = false;
    this.isMining = false;
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.userData = null;
    this.miningStatus = null;
    this.proxyAgent = null;
    this.stats = {
      totalHeartbeats: 0,
      totalEarned: 0,
      sessionStartTime: Date.now(),
      lastHeartbeat: null,
      errors: 0,
      reconnects: 0
    };
    this.USER_AGENTS = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    ];
    this.userAgent = this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
    
    this.setupProxy();
  }

  setupProxy() {
    if (this.accountConfig.proxy && this.accountConfig.proxy.enabled) {
      const proxy = this.accountConfig.proxy;
      let proxyUrl;
      
      if (proxy.username && proxy.password) {
        proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      } else {
        proxyUrl = `http://${proxy.host}:${proxy.port}`;
      }
      
      this.proxyAgent = new HttpsProxyAgent(proxyUrl);
      this.log('info', `Proxy enabled: ${colors.cyan}${proxy.host}:${proxy.port}${colors.reset}`);
    } else {
      this.log('info', `Proxy: ${colors.gray}disabled${colors.reset}`);
    }
  }

  getHeaders() {
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'referer': 'https://portal.deltahash.ai/mining'
    };
    
    if (this.token) {
      headers['cookie'] = `connect.sid=${this.token}`;
    }
    
    if (this.userAgent) {
      headers['user-agent'] = this.userAgent;
    }
    
    return headers;
  }

  getAxiosConfig() {
    const config = {
      headers: this.getHeaders(),
      timeout: 15000
    };
    
    if (this.proxyAgent) {
      config.httpsAgent = this.proxyAgent;
      config.proxy = false; 
    }
    
    return config;
  }

  log(type, message) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const prefix = `${colors.gray}[${timestamp}]${colors.reset} ${colors.blue}${this.accountName}${colors.reset}`;
    switch(type) {
      case 'success': 
        console.log(`${prefix} ${colors.green}✔${colors.reset} ${message}`); 
        break;
      case 'error': 
        console.log(`${prefix} ${colors.red}✖${colors.reset} ${message}`); 
        break;
      case 'warn': 
        console.log(`${prefix} ${colors.yellow}⚡${colors.reset} ${message}`); 
        break;
      case 'mining': 
        console.log(`${prefix} ${colors.magenta}⛏${colors.reset} ${message}`); 
        break;
      default: 
        console.log(`${prefix} ${colors.cyan}●${colors.reset} ${message}`);
    }
  }

  async getUserInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/me`, this.getAxiosConfig());

      if (response.data && response.data.user) {
        this.userData = response.data.user;
        
        logger.box(`📊 ${this.accountName} - Account Information`, [
          `${colors.white}Username       ${colors.gray}:${colors.reset} ${colors.cyan}${this.userData.username}${colors.reset}`,
          `${colors.white}Balance        ${colors.gray}:${colors.reset} ${colors.green}${this.userData.balance.toFixed(6)}${colors.reset} ${colors.yellow}SETH${colors.reset}`,
          `${colors.white}Referral Code  ${colors.gray}:${colors.reset} ${colors.magenta}${this.userData.referralCode}${colors.reset}`,
          `${colors.white}Referrals      ${colors.gray}:${colors.reset} ${colors.cyan}${this.userData.referralCount}${colors.reset} users`,
          `${colors.white}Referral Earned${colors.gray}:${colors.reset} ${colors.yellow}${this.userData.totalReferralEarned.toFixed(6)}${colors.reset} SETH`,
          `${colors.white}Mining Streak  ${colors.gray}:${colors.reset} ${colors.green}${this.userData.miningStreakDays}${colors.reset} days`,
          `${colors.white}Epochs Joined  ${colors.gray}:${colors.reset} ${colors.blue}${this.userData.totalEpochsParticipated}${colors.reset}`,
        ]);
        
        return true;
      }
      return false;
    } catch (error) {
      this.stats.errors++;
      this.log('error', `Failed to get user info: ${error.message}`);
      return false;
    }
  }

  async getMiningStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/mining/status`, this.getAxiosConfig());

      if (response.data) {
        this.miningStatus = response.data;
        return response.data;
      }
      return null;
    } catch (error) {
      this.log('error', `Failed to get mining status: ${error.message}`);
      return null;
    }
  }

  async getBoostersInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/boosters`, this.getAxiosConfig());
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async activateBooster(boosterId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/boosters/activate`,
        { boosterId },
        this.getAxiosConfig()
      );

      if (response.data && response.data.success) {
        this.log('success', `Booster activated! Multiplier: ${colors.green}${response.data.multiplier}x${colors.reset}`);
        return true;
      }
      return false;
    } catch (error) {
      this.log('error', `Failed to activate booster: ${error.message}`);
      return false;
    }
  }

  async claimDailyBonus() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/claim-daily`,
        {},
        this.getAxiosConfig()
      );

      if (response.data && response.data.success) {
        this.log('success', `Daily bonus claimed! +${colors.yellow}${response.data.amount}${colors.reset} SETH`);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async connectMining() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/connect`,
        {},
        this.getAxiosConfig()
      );

      if (response.data && response.data.success) {
        this.isConnected = true;
        this.isMining = true;
        this.log('success', `Mining connected! Epoch: ${colors.yellow}${response.data.epochNumber}${colors.reset}`);
        return true;
      }
      return false;
    } catch (error) {
      this.stats.errors++;
      this.log('error', `Failed to connect mining: ${error.message}`);
      return false;
    }
  }

  async disconnectMining() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/disconnect`,
        null,
        this.getAxiosConfig()
      );

      if (response.data && response.data.success) {
        this.isConnected = false;
        this.isMining = false;
        this.log('info', 'Mining disconnected');
        return true;
      }
      return false;
    } catch (error) {
      this.log('error', `Failed to disconnect mining: ${error.message}`);
      return false;
    }
  }

  async sendHeartbeat() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/heartbeat`,
        {},
        this.getAxiosConfig()
      );

      if (response.data && response.data.success) {
        this.stats.totalHeartbeats++;
        this.stats.lastHeartbeat = new Date();
        this.stats.totalEarned += response.data.tokensEarned || 0;
        
        const earned = response.data.tokensEarned.toFixed(6);
        const balance = response.data.newBalance.toFixed(6);
        
        console.log(
          `${colors.gray}[${new Date().toLocaleTimeString('en-US', { hour12: false })}]${colors.reset} ` +
          `${colors.blue}${this.accountName}${colors.reset} ` +
          `${colors.green}💎${colors.reset} ` +
          `${colors.white}Beat ${colors.cyan}#${this.stats.totalHeartbeats}${colors.reset} ` +
          `${colors.gray}→${colors.reset} ` +
          `${colors.yellow}+${earned}${colors.reset} ` +
          `${colors.gray}•${colors.reset} ` +
          `${colors.green}${balance}${colors.reset} SETH ` +
          `${colors.gray}(Epoch ${response.data.epochNumber})${colors.reset}`
        );
        return true;
      }
      return false;
    } catch (error) {
      this.stats.errors++;
      this.log('error', `Heartbeat failed: ${error.message}`);
      return false;
    }
  }

  startHeartbeat(interval = 30000) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isMining) {
        await this.sendHeartbeat();
      }
    }, interval);

    this.log('info', `Heartbeat monitor started (${colors.cyan}${interval/1000}s interval${colors.reset})`);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      this.log('info', 'Heartbeat monitor stopped');
    }
  }

  connectWebSocket() {
    try {
      const wsOptions = {
        headers: {
          'cookie': `connect.sid=${this.token}`,
          'user-agent': this.userAgent
        }
      };
      
      if (this.proxyAgent) {
        wsOptions.agent = this.proxyAgent;
      }
      
      this.ws = new WebSocket(this.wsURL, wsOptions);

      this.ws.on('open', () => {
        this.log('success', 'WebSocket connected');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'mining_update') {
            const activeMiners = message.data.activeMiners;
            const dthAmount = (activeMiners * 0.32 * 1.6).toFixed(2);
            
            console.log(
              `${colors.gray}[${new Date().toLocaleTimeString('en-US', { hour12: false })}]${colors.reset} ` +
              `${colors.blue}${this.accountName}${colors.reset} ` +
              `${colors.magenta}⚡${colors.reset} ` +
              `${colors.white}Network${colors.reset} ` +
              `${colors.gray}→${colors.reset} ` +
              `${colors.cyan}${activeMiners}${colors.reset} miners ` +
              `${colors.gray}•${colors.reset} ` +
              `${colors.green}~${dthAmount}${colors.reset} DTH ` +
              `${colors.gray}(Epoch ${message.data.epochNumber})${colors.reset}`
            );
          } else if (message.type === 'epoch_end') {
            this.log('warn', `Epoch ${message.data.epochNumber} ended! Reconnecting...`);
          }
        } catch (e) {
        }
      });

      this.ws.on('error', (error) => {
        this.stats.errors++;
        this.log('error', `WebSocket error: ${error.message}`);
      });

      this.ws.on('close', () => {
        this.log('warn', 'WebSocket disconnected');
        this.handleReconnect();
      });

    } catch (error) {
      this.stats.errors++;
      this.log('error', `Failed to connect WebSocket: ${error.message}`);
      this.handleReconnect();
    }
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('error', `Max reconnect attempts reached. Restarting mining...`);
      this.stats.reconnects++;
      this.reconnectAttempts = 0;
      await this.stopMining();
      await delay(5000);
      await this.startMining();
      return;
    }

    this.reconnectAttempts++;
    const waitTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.log('warn', `Reconnecting in ${waitTime/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await delay(waitTime);
    this.connectWebSocket();
  }

  async startMining(settings = {}) {
    this.log('info', `${colors.cyan}Starting mining process...${colors.reset}`);

    const userInfoSuccess = await this.getUserInfo();
    if (!userInfoSuccess) {
      this.log('error', 'Failed to retrieve user info. Retrying in 10s...');
      await delay(settings.retryDelay || 10000);
      return this.startMining(settings);
    }

    await delay(1000);

    await this.claimDailyBonus();
    await delay(500);

    const status = await this.getMiningStatus();
    if (status) {
      this.log('info', 
        `Mining config ${colors.gray}→${colors.reset} ` +
        `Speed: ${colors.yellow}${status.miningSpeed}${colors.reset} ` +
        `${colors.gray}•${colors.reset} ` +
        `Multiplier: ${colors.green}${status.multiplier}x${colors.reset}`
      );
    }

    const boosters = await this.getBoostersInfo();
    if (boosters && boosters.available && boosters.available.length > 0) {
      this.log('info', `${colors.cyan}${boosters.available.length}${colors.reset} booster(s) available`);
      
      if (settings.autoActivateBooster && boosters.available[0]) {
        await delay(500);
        await this.activateBooster(boosters.available[0].id);
      }
    }

    await delay(1000);

    const connectSuccess = await this.connectMining();
    if (!connectSuccess) {
      this.log('error', 'Failed to connect mining. Retrying in 10s...');
      await delay(settings.retryDelay || 10000);
      return this.startMining(settings);
    }

    await delay(1000);

    this.startHeartbeat(settings.heartbeatInterval || 30000);
    this.connectWebSocket();

    this.log('success', `${colors.green}Mining started successfully!${colors.reset}`);
  }

  async stopMining() {
    this.log('info', 'Stopping mining...');
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    await this.disconnectMining();
    
    this.log('info', 'Mining stopped');
  }

  getStats() {
    const uptime = Math.floor((Date.now() - this.stats.sessionStartTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    return {
      accountName: this.accountName,
      username: this.userData?.username || 'N/A',
      balance: this.userData?.balance || 0,
      totalHeartbeats: this.stats.totalHeartbeats,
      totalEarned: this.stats.totalEarned,
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      errors: this.stats.errors,
      reconnects: this.stats.reconnects,
      lastHeartbeat: this.stats.lastHeartbeat ? this.stats.lastHeartbeat.toLocaleTimeString() : 'N/A',
      proxyEnabled: this.proxyAgent ? true : false,
      miningSpeed: this.miningStatus?.miningSpeed || 0,
      multiplier: this.miningStatus?.multiplier || 1
    };
  }
}

class Dashboard {
  constructor(miners) {
    this.miners = miners;
    this.updateInterval = null;
  }

  start(interval = 60000) {
    this.updateInterval = setInterval(() => {
      this.display();
    }, interval);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  display() {
    console.clear();
    logger.banner();
    
    const allStats = this.miners.map(m => m.getStats());
    const timestamp = new Date().toLocaleString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
    
    logger.box(`📊 Dashboard - ${allStats.length} Account(s) Active`, [
      `${colors.white}Last Update${colors.gray}: ${colors.cyan}${timestamp}${colors.reset}`
    ]);
    
    allStats.forEach((stats) => {
      logger.thinSeparator();
      console.log(`\n  ${colors.bold}${colors.blue}▸ ${stats.accountName}${colors.reset} ${colors.gray}(@${stats.username})${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Balance        ${colors.gray}:${colors.reset} ${colors.green}${stats.balance.toFixed(6)}${colors.reset} ${colors.yellow}SETH${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Session Earned ${colors.gray}:${colors.reset} ${colors.yellow}+${stats.totalEarned.toFixed(6)}${colors.reset} SETH`);
      console.log(`  ${colors.gray}├─${colors.reset} Heartbeats     ${colors.gray}:${colors.reset} ${colors.cyan}${stats.totalHeartbeats}${colors.reset} beats`);
      console.log(`  ${colors.gray}├─${colors.reset} Mining Speed   ${colors.gray}:${colors.reset} ${colors.yellow}${stats.miningSpeed}${colors.reset} ${colors.gray}•${colors.reset} Boost ${colors.green}${stats.multiplier}x${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Uptime         ${colors.gray}:${colors.reset} ${colors.magenta}${stats.uptime}${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Last Heartbeat ${colors.gray}:${colors.reset} ${colors.white}${stats.lastHeartbeat}${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Proxy          ${colors.gray}:${colors.reset} ${stats.proxyEnabled ? colors.green + '✔ Enabled' : colors.gray + '○ Disabled'}${colors.reset}`);
      console.log(`  ${colors.gray}├─${colors.reset} Errors         ${colors.gray}:${colors.reset} ${stats.errors > 0 ? colors.red : colors.green}${stats.errors}${colors.reset}`);
      console.log(`  ${colors.gray}└─${colors.reset} Reconnects     ${colors.gray}:${colors.reset} ${stats.reconnects > 0 ? colors.yellow : colors.green}${stats.reconnects}${colors.reset}\n`);
    });
    
    logger.separator();
    
    const totalBalance = allStats.reduce((sum, s) => sum + s.balance, 0);
    const totalEarned = allStats.reduce((sum, s) => sum + s.totalEarned, 0);
    const totalHeartbeats = allStats.reduce((sum, s) => sum + s.totalHeartbeats, 0);
    
    console.log(`\n  ${colors.bold}${colors.white}💰 Total Summary${colors.reset}`);
    console.log(`  ${colors.gray}├─${colors.reset} Total Balance   ${colors.gray}:${colors.reset} ${colors.green}${totalBalance.toFixed(6)}${colors.reset} ${colors.yellow}SETH${colors.reset}`);
    console.log(`  ${colors.gray}├─${colors.reset} Total Earned    ${colors.gray}:${colors.reset} ${colors.yellow}+${totalEarned.toFixed(6)}${colors.reset} SETH`);
    console.log(`  ${colors.gray}└─${colors.reset} Total Heartbeats${colors.gray}:${colors.reset} ${colors.cyan}${totalHeartbeats}${colors.reset} beats\n`);
    
    logger.separator();
    console.log(`\n  ${colors.gray}Press ${colors.white}Ctrl+C${colors.gray} to stop all miners${colors.reset}\n`);
  }
}

async function main() {
  logger.banner();
  logger.separator();

  let config;
  try {
    const configData = fs.readFileSync('accounts_config.json', 'utf8');
    config = JSON.parse(configData);
  } catch (error) {
    logger.error('Failed to load accounts_config.json!');
    logger.info('Please create accounts_config.json with format:');
    logger.info(JSON.stringify({
      accounts: [
        {
          name: "Account 1",
          token: "s%3A...",
          proxy: { enabled: false, host: "", port: 0, username: "", password: "" }
        },
        {
          name: "Account 2",
          token: "s%3A...",
          proxy: { enabled: true, host: "proxy.com", port: 8080, username: "", password: "" }
        }
      ],
      settings: {
        heartbeatInterval: 30000,
        dashboardUpdateInterval: 60000,
        retryDelay: 10000,
        startDelay: 3000
      }
    }, null, 2));
    process.exit(1);
  }

  if (!config.accounts || config.accounts.length === 0) {
    logger.error('No accounts found in config!');
    process.exit(1);
  }

  const accounts = config.accounts;
  
  accounts.forEach((account) => {
    const proxyStatus = account.proxy?.enabled ? 
      `${colors.green}✔ Proxy${colors.reset}` : 
      `${colors.gray}○ No proxy${colors.reset}`;
    logger.success(`${colors.yellow}${account.name}${colors.reset} ${colors.gray}│${colors.reset} ${proxyStatus}`);
  });

  logger.separator();
  logger.success(`${colors.yellow}${accounts.length}${colors.reset} account(s) loaded and ready`);
  logger.separator();

  const miners = accounts.map((account, index) => 
    new DeltaHashMiner(account, index + 1)
  );

  const settings = config.settings || {
    heartbeatInterval: 30000,
    retryDelay: 10000,
    startDelay: 3000,
    dashboardUpdateInterval: 60000
  };

  for (const miner of miners) {
    await miner.startMining(settings);
    await delay(settings.startDelay);
  }

  logger.separator();
  logger.success(`${colors.green}All accounts mining successfully!${colors.reset}`);
  logger.info(`Dashboard updates every ${colors.cyan}${settings.dashboardUpdateInterval/1000}s${colors.reset}`);
  logger.separator();

  const dashboard = new Dashboard(miners);
  setTimeout(() => {
    dashboard.display();
    dashboard.start(settings.dashboardUpdateInterval);
  }, 10000);

  process.on('SIGINT', async () => {
    console.log('\n');
    logger.separator();
    logger.warn('Shutting down gracefully...');
    
    dashboard.stop();
    
    for (const miner of miners) {
      await miner.stopMining();
    }
    
    logger.separator();
    logger.success('All miners stopped. Goodbye! 👋');
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
