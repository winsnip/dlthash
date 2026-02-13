# DeltaHash Mining Bot by WINSNIP

Bot mining DeltaHash dengan 1 file JSON untuk semua account + proxy support.

**Version:** 1.0.0  
**Developer:** 👨‍💻 WINSNIP

**Platform Support:**
- ✅ Windows (7/8/10/11)
- ✅ Linux (Ubuntu, Debian, CentOS, dll)
- ✅ Android (Termux)
- ✅ macOS
- ✅ VPS/Cloud Server

**Quick Links:**
- 🚀 [Quick Start Guide](QUICKSTART.md) - Mulai dalam 5 menit!
- 📦 [Installation Guide](INSTALL.md) - Panduan lengkap semua platform
- 📝 [Config Example](accounts_config.example.json) - Template konfigurasi

## ✨ Fitur

- ✅ Semua account dalam 1 file JSON
- ✅ Proxy support per account
- ✅ Multi-account unlimited
- ✅ Dashboard real-time
- ✅ Auto heartbeat & reconnect
- ✅ Auto-activate booster (jika tersedia)
- ✅ Auto-claim daily bonus
- ✅ Configurable settings
- ✅ Mining speed & multiplier tracking

## 📦 Installation

### Quick Install (All Platforms)

**Windows:**
```cmd
install.bat
```

**Linux/Termux:**
```bash
chmod +x install.sh
./install.sh
```

**Manual:**
```bash
npm install axios ws https-proxy-agent
```

### Detailed Installation

Lihat [INSTALL.md](INSTALL.md) untuk panduan lengkap:
- Windows installation
- Linux installation (Ubuntu, Debian, CentOS)
- Android/Termux installation
- VPS setup
- Auto-start configuration
- Tmux usage

## ⚙️ Configuration

Edit file `accounts_config.json`:

```json
{
  "accounts": [
    {
      "name": "Account 1",
      "token": "s%3A...your_token_here...",
      "proxy": {
        "enabled": false,
        "host": "",
        "port": 0,
        "username": "",
        "password": ""
      }
    },
    {
      "name": "Account 2",
      "token": "s%3A...your_token_here...",
      "proxy": {
        "enabled": true,
        "host": "proxy.example.com",
        "port": 8080,
        "username": "proxyuser",
        "password": "proxypass"
      }
    },
    {
      "name": "Account 3",
      "token": "s%3A...your_token_here...",
      "proxy": {
        "enabled": true,
        "host": "proxy2.example.com",
        "port": 3128,
        "username": "",
        "password": ""
      }
    }
  ],
  "settings": {
    "heartbeatInterval": 30000,
    "dashboardUpdateInterval": 60000,
    "retryDelay": 10000,
    "startDelay": 3000
  }
}
```

### Penjelasan Config:

**accounts**: Array berisi semua account
- `name`: Nama account (bebas)
- `token`: Token dari cookie `connect.sid`
- `proxy.enabled`: `true` untuk pakai proxy, `false` untuk tidak
- `proxy.host`: IP atau domain proxy
- `proxy.port`: Port proxy
- `proxy.username`: Username proxy (kosongkan jika tidak perlu auth)
- `proxy.password`: Password proxy (kosongkan jika tidak perlu auth)

**settings**: Pengaturan bot
- `heartbeatInterval`: Interval heartbeat dalam ms (default: 30000 = 30 detik)
- `dashboardUpdateInterval`: Interval update dashboard (default: 60000 = 60 detik)
- `retryDelay`: Delay retry saat error (default: 10000 = 10 detik)
- `startDelay`: Delay antar account saat start (default: 3000 = 3 detik)
- `autoActivateBooster`: Auto-activate booster jika tersedia (default: true)
- `autoClaimDaily`: Auto-claim daily bonus (default: true)

## 📝 Cara Dapat Token

1. Login ke https://portal.deltahash.ai/mining
2. Tekan F12 (DevTools)
3. Tab **Application** → **Cookies** → https://portal.deltahash.ai
4. Copy value dari cookie `connect.sid`
5. Paste ke `accounts_config.json`

## 🚀 Booster & Multiplier

Bot otomatis akan:
1. **Auto-claim daily bonus** saat start mining
2. **Check available boosters** dari DeltaHash
3. **Auto-activate booster** pertama yang tersedia (jika `autoActivateBooster: true`)
4. **Track multiplier** dan tampilkan di dashboard

### Cara Kerja Booster:

Booster meningkatkan mining multiplier, contoh:
- Base multiplier: 1.0x
- Dengan booster: 1.5x, 2.0x, atau lebih tinggi
- Earnings per heartbeat akan lebih besar

### Manual Activate Booster:

Jika ingin manual (set `autoActivateBooster: false`), bisa:
1. Login ke website DeltaHash
2. Klik booster yang tersedia
3. Bot akan otomatis detect multiplier baru

### Cara Dapat Booster:

- Daily login bonus
- Referral rewards
- Mining streak rewards
- Special events

Bot akan otomatis claim dan activate jika tersedia!

## 🚀 Usage

### Windows
```cmd
node deltahash_pro.cjs
```

Atau double-click `start.bat` (buat file ini):
```bat
@echo off
node deltahash_pro.cjs
pause
```

### Linux
```bash
node deltahash_pro.cjs
```

Atau dengan tmux (persistent):
```bash
chmod +x run.sh
./run.sh
```

### Termux (Android)
```bash
# Normal
node deltahash_pro.cjs

# Dengan tmux (recommended)
pkg install tmux
./run.sh

# Background
nohup node deltahash_pro.cjs > bot.log 2>&1 &
```

### Keep Running 24/7

**Termux:**
- Enable wakelock: `termux-wake-lock`
- Use tmux: `./run.sh`
- Disable battery optimization

**Linux:**
- Use tmux: `./run.sh`
- Or systemd service (see INSTALL.md)

**Windows:**
- Use PM2: `pm2 start deltahash_pro.cjs`
- Or NSSM for Windows Service

Bot akan:
1. Load semua account dari `accounts_config.json`
2. Setup proxy untuk setiap account (jika enabled)
3. Start mining untuk semua account
4. Show dashboard dengan auto-update

## 📊 Dashboard

Dashboard menampilkan:
- Username & balance per account
- Total heartbeats & earnings
- Uptime tracker
- Proxy status (enabled/disabled)
- Error & reconnect counter
- Total summary semua account

Update otomatis setiap 60 detik (bisa diubah di settings).

## 🔧 Proxy Support

**Jenis proxy yang didukung:**
- HTTP Proxy
- HTTPS Proxy
- SOCKS5 Proxy
- Proxy dengan authentication
- Proxy tanpa authentication

**Contoh proxy gratis:**
- https://www.proxy-list.download/
- https://free-proxy-list.net/
- https://www.sslproxies.org/

**Contoh proxy premium:**
- Bright Data
- Smartproxy
- Oxylabs
- IPRoyal

## ➕ Tambah Account

Tinggal tambahkan object baru di array `accounts`:

```json
{
  "accounts": [
    { ... account 1 ... },
    { ... account 2 ... },
    {
      "name": "Account 3",
      "token": "s%3A...new_token...",
      "proxy": {
        "enabled": false,
        "host": "",
        "port": 0,
        "username": "",
        "password": ""
      }
    }
  ],
  ...
}
```

Restart bot untuk apply changes.

## 🛑 Stop Bot

Tekan `Ctrl + C` untuk graceful shutdown.

## 💡 Tips

1. **Proxy berbeda per account**: Hindari rate limit dengan proxy berbeda
2. **Rotating proxy**: Gunakan rotating proxy untuk IP yang selalu berubah
3. **Monitor dashboard**: Check stats berkala
4. **Backup config**: Simpan backup `accounts_config.json`
5. **Token refresh**: Get token baru jika expired

## 🐛 Troubleshooting

**Error: "Failed to get user info"**
- Token expired → Get token baru
- Proxy error → Check proxy config
- Network issue → Check internet

**Error: "Failed to connect mining"**
- Mining period belum dimulai
- Bot akan auto-retry setiap 10 detik

**Proxy not working**
- Check host, port, username, password
- Test proxy dengan curl atau browser
- Pastikan proxy support HTTPS

**Account tidak mining**
- Check log untuk error detail
- Verify token masih valid
- Check proxy jika enabled

## 📈 Example Setup

**5 account, 3 pakai proxy:**

```json
{
  "accounts": [
    {
      "name": "Main Account",
      "token": "s%3A...",
      "proxy": { "enabled": false, ... }
    },
    {
      "name": "Alt 1",
      "token": "s%3A...",
      "proxy": { 
        "enabled": true, 
        "host": "proxy1.com", 
        "port": 8080,
        "username": "",
        "password": ""
      }
    },
    {
      "name": "Alt 2",
      "token": "s%3A...",
      "proxy": { 
        "enabled": true, 
        "host": "proxy2.com", 
        "port": 3128,
        "username": "user",
        "password": "pass"
      }
    },
    {
      "name": "Alt 3",
      "token": "s%3A...",
      "proxy": { "enabled": false, ... }
    },
    {
      "name": "Alt 4",
      "token": "s%3A...",
      "proxy": { 
        "enabled": true, 
        "host": "proxy3.com", 
        "port": 1080,
        "username": "",
        "password": ""
      }
    }
  ],
  "settings": {
    "heartbeatInterval": 30000,
    "dashboardUpdateInterval": 60000,
    "retryDelay": 10000,
    "startDelay": 3000
  }
}
```

## 🔒 Security

- Jangan share `accounts_config.json` (berisi token!)
- Gunakan proxy terpercaya
- Token bisa expired, get token baru jika error
- Semua proses lokal, tidak ada data ke server lain

## 🎉 Enjoy!

Bot ini dibuat untuk memudahkan mining DeltaHash dengan multiple accounts dan proxy support. Happy mining! 🚀
