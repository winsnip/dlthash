const axios = require('axios');
const WebSocket = require('ws');
require('dotenv').config();

const colors = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", white: "\x1b[37m",
  bold: "\x1b[1m", magenta: "\x1b[35m",
};

const logger = {
  info: (msg) => console.log(`${colors.white}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[→] ${msg}${colors.reset}`),

  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`██     ██ ██ ███    ██ ███████ ███    ██ ██ ██████`);
    console.log(`██     ██ ██ ████   ██ ██      ████   ██ ██ ██   ██`);
    console.log(`██  █  ██ ██ ██ ██  ██ ███████ ██ ██  ██ ██ ██████`);
    console.log(`██ ███ ██ ██ ██  ██ ██      ██ ██  ██ ██ ██ ██`);
    console.log(` ███ ███  ██ ██   ████ ███████ ██   ████ ██ ██`);
    console.log(`${colors.reset}`);
    console.log(`${colors.yellow}Join our Telegram channel: https://t.me/winsnip${colors.reset}\n`);
  }
};

/* =========================
   DESKTOP USER AGENTS ONLY
========================= */

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
];

const getRandomUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DeltaHashMiner {
  constructor(cookieString, accountIndex) {
    this.cookie = cookieString.trim(); // FULL COOKIE
    this.accountIndex = accountIndex;
    this.baseURL = 'https://portal.deltahash.ai/api';
    this.wsURL = 'wss://portal.deltahash.ai/ws';
    this.ws = null;
    this.isConnected = false;
    this.isMining = false;
    this.userAgent = getRandomUserAgent();
    this.heartbeatInterval = null;
  }

  getHeaders() {
    return {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'origin': 'https://portal.deltahash.ai',
      'referer': 'https://portal.deltahash.ai/',
      'user-agent': this.userAgent,
      'cookie': this.cookie // 🔥 FIXED
    };
  }

  async getUserInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/me`, {
        headers: this.getHeaders()
      });

      if (response.data?.user) {
        const u = response.data.user;
        logger.success(`[Account ${this.accountIndex}] User Info Retrieved\n`);
        logger.loading(`Username        : ${u.username}`);
        logger.loading(`Balance         : ${u.balance.toFixed(6)}`);
        logger.loading(`Referral Code   : ${u.referralCode}`);
        logger.loading(`Referral Count  : ${u.referralCount}`);
        logger.loading(`Referral Earned : ${u.totalReferralEarned.toFixed(6)}`);
        logger.loading(`Mining Streak   : ${u.miningStreakDays}`);
        logger.loading(`Epochs Joined   : ${u.totalEpochsParticipated}\n`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`[Account ${this.accountIndex}] Failed to get user info`);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      return false;
    }
  }

  async getMiningStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/mining/status`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      logger.error(`[Account ${this.accountIndex}] Failed to get mining status`);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      return null;
    }
  }

  async connectMining() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/connect`,
        {},
        { headers: this.getHeaders() }
      );

      this.isConnected = true;
      this.isMining = true;

      logger.success(
        `[Account ${this.accountIndex}] Mining connected! Epoch: ${response.data.epochNumber}`
      );
      return true;

    } catch (error) {
      logger.error(`[Account ${this.accountIndex}] Failed to connect mining`);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      return false;
    }
  }

  async sendHeartbeat() {
    try {
      const response = await axios.post(
        `${this.baseURL}/mining/heartbeat`,
        {},
        { headers: this.getHeaders() }
      );

      if (response.data?.success) {
        const timestamp = new Date().toLocaleTimeString();
        logger.info(
          `[Account ${this.accountIndex}] ♥ Epoch ${response.data.epochNumber} | ` +
          `Earned ${response.data.tokensEarned.toFixed(6)} | ` +
          `Balance ${response.data.newBalance.toFixed(6)} | ${timestamp}`
        );
      }
    } catch (error) {
      logger.error(`[Account ${this.accountIndex}] Heartbeat failed`);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.heartbeatInterval = setInterval(() => {
      if (this.isMining) this.sendHeartbeat();
    }, 30000);

    logger.info(`[Account ${this.accountIndex}] Heartbeat started (30s)`);
  }

  connectWebSocket() {
    this.ws = new WebSocket(this.wsURL, {
      headers: {
        'cookie': this.cookie, // 🔥 FIXED
        'user-agent': this.userAgent
      }
    });

    this.ws.on('open', () => {
      logger.success(`[Account ${this.accountIndex}] WebSocket connected`);
    });

    this.ws.on('close', () => {
      logger.warn(`[Account ${this.accountIndex}] WebSocket closed`);
    });

    this.ws.on('error', (err) => {
      logger.error(`[Account ${this.accountIndex}] WS error: ${err.message}`);
    });
  }

  async startMining() {
    logger.loading(`[Account ${this.accountIndex}] Starting mining process...`);

    if (!(await this.getUserInfo())) {
      await delay(10000);
      return this.startMining();
    }

    await delay(1000);

    if (!(await this.connectMining())) {
      logger.error(`[Account ${this.accountIndex}] Retry in 10s...`);
      await delay(10000);
      return this.startMining();
    }

    this.startHeartbeat();
    this.connectWebSocket();

    logger.success(`[Account ${this.accountIndex}] Mining started successfully!`);
  }
}

async function main() {
  logger.banner();

  const cookies = [];
  let i = 1;

  while (process.env[`COOK_${i}`]) {
    cookies.push(process.env[`COOK_${i}`].trim()); // 🔥 FULL COOKIE
    i++;
  }

  if (!cookies.length) {
    logger.error('No cookies found!');
    process.exit(1);
  }

  logger.success(`Found ${cookies.length} account(s) to mine`);

  for (let i = 0; i < cookies.length; i++) {
    const miner = new DeltaHashMiner(cookies[i], i + 1);
    await miner.startMining();
    await delay(2000);
  }
}

main();
