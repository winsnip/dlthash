# Installation Guide - All Platforms

Panduan lengkap instalasi DeltaHash Bot by WINSNIP untuk Windows, Linux, dan Android (Termux).

**Version:** 1.0.0  
**Developer:** 👨‍💻 WINSNIP

---

## 📱 Android (Termux)

### 1. Install Termux

Download dari:
- F-Droid: https://f-droid.org/packages/com.termux/
- GitHub: https://github.com/termux/termux-app/releases

**JANGAN install dari Google Play Store** (versi lama dan tidak di-maintain)

### 2. Setup Termux

Buka Termux dan jalankan:

```bash
# Update packages
pkg update && pkg upgrade -y

# Install dependencies
pkg install -y git nodejs

# Clone atau download bot
# Jika punya git repo:
# git clone https://github.com/your-repo/deltahash-bot.git
# cd deltahash-bot

# Atau download manual dan extract
```

### 3. Install Bot Dependencies

```bash
# Jalankan installer
chmod +x install.sh
./install.sh
```

Atau manual:
```bash
npm install axios ws https-proxy-agent
```

### 4. Configure Bot

Edit config dengan nano atau vim:
```bash
nano accounts_config.json
```

Atau gunakan text editor Android dan copy ke Termux storage.

### 5. Run Bot

**Opsi 1: Normal (akan stop jika close Termux)**
```bash
node deltahash_pro.cjs
```

**Opsi 2: Dengan tmux (persistent, recommended)**
```bash
# Install tmux
pkg install tmux

# Run dengan script
chmod +x run.sh
./run.sh

# Detach dari tmux: Ctrl+B lalu tekan D
# Reattach: tmux attach -t deltahash
```

**Opsi 3: Background dengan nohup**
```bash
nohup node deltahash_pro.cjs > bot.log 2>&1 &

# Check log
tail -f bot.log

# Stop bot
pkill -f deltahash_pro.cjs
```

### 6. Keep Termux Running

**Acquire Wakelock:**
```bash
termux-wake-lock
```

**Release Wakelock:**
```bash
termux-wake-unlock
```

**Tips:**
- Enable "Acquire wakelock" di Termux notification
- Disable battery optimization untuk Termux
- Gunakan tmux untuk persistent session

---

## 🐧 Linux (Ubuntu/Debian/CentOS)

### 1. Install Node.js

**Ubuntu/Debian:**
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v
npm -v
```

**CentOS/RHEL:**
```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify
node -v
npm -v
```

### 2. Install Bot

```bash
# Clone atau download bot
# cd ke folder bot

# Run installer
chmod +x install.sh
./install.sh
```

### 3. Configure Bot

```bash
nano accounts_config.json
# Edit dengan token Anda
```

### 4. Run Bot

**Opsi 1: Normal**
```bash
node deltahash_pro.cjs
```

**Opsi 2: Dengan tmux (recommended)**
```bash
# Install tmux
sudo apt install tmux  # Ubuntu/Debian
sudo yum install tmux  # CentOS/RHEL

# Run
chmod +x run.sh
./run.sh
```

**Opsi 3: Sebagai systemd service (auto-start)**

Create service file:
```bash
sudo nano /etc/systemd/system/deltahash.service
```

Content:
```ini
[Unit]
Description=DeltaHash Mining Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/node deltahash_pro.cjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable deltahash
sudo systemctl start deltahash

# Check status
sudo systemctl status deltahash

# View logs
sudo journalctl -u deltahash -f
```

---

## 🪟 Windows

### 1. Install Node.js

Download dari: https://nodejs.org/

- Pilih versi LTS (Long Term Support)
- Download installer (.msi)
- Jalankan installer
- Centang "Add to PATH"
- Restart terminal/CMD setelah install

Verify:
```cmd
node -v
npm -v
```

### 2. Install Bot

```cmd
REM Double-click install.bat
REM Atau jalankan di CMD:
install.bat
```

### 3. Configure Bot

Edit `accounts_config.json` dengan Notepad atau text editor favorit.

### 4. Run Bot

**Opsi 1: Double-click**
- Buat file `start.bat`:
```bat
@echo off
node deltahash_pro.cjs
pause
```
- Double-click `start.bat`

**Opsi 2: CMD/PowerShell**
```cmd
node deltahash_pro.cjs
```

**Opsi 3: Background dengan PM2**
```cmd
npm install -g pm2
pm2 start deltahash_pro.cjs --name deltahash
pm2 save
pm2 startup

REM Commands
pm2 status
pm2 logs deltahash
pm2 restart deltahash
pm2 stop deltahash
```

**Opsi 4: Windows Service dengan NSSM**

Download NSSM: https://nssm.cc/download

```cmd
REM Install service
nssm install DeltaHashBot "C:\Program Files\nodejs\node.exe" "C:\path\to\deltahash_pro.cjs"

REM Start service
nssm start DeltaHashBot

REM Stop service
nssm stop DeltaHashBot

REM Remove service
nssm remove DeltaHashBot confirm
```

---

## 📦 Dependencies

Bot membutuhkan:
- **Node.js** v16 atau lebih baru (recommended: v20 LTS)
- **npm** (included dengan Node.js)

NPM packages:
- `axios` - HTTP client
- `ws` - WebSocket client
- `https-proxy-agent` - Proxy support

Install otomatis dengan:
```bash
npm install axios ws https-proxy-agent
```

---

## 🔧 Troubleshooting

### Termux: "Cannot find module"
```bash
npm install
```

### Linux: Permission denied
```bash
chmod +x install.sh run.sh
```

### Windows: "node is not recognized"
- Restart terminal setelah install Node.js
- Atau tambahkan Node.js ke PATH manual

### All platforms: Bot stops unexpectedly
- Check log untuk error
- Verify token masih valid
- Check internet connection
- Gunakan tmux/PM2 untuk auto-restart

### Termux: Bot stops when screen off
- Enable wakelock: `termux-wake-lock`
- Disable battery optimization
- Use tmux

---

## 💡 Tips

### Termux (Android)
- Gunakan tmux untuk persistent session
- Enable wakelock
- Disable battery optimization
- Gunakan external keyboard untuk easier editing

### Linux Server
- Gunakan systemd service untuk auto-start
- Setup logrotate untuk manage logs
- Monitor dengan htop/top

### Windows
- Gunakan PM2 atau NSSM untuk background service
- Setup Task Scheduler untuk auto-start
- Monitor dengan Task Manager

### All Platforms
- Backup `accounts_config.json` secara berkala
- Monitor bot logs
- Update token jika expired
- Check dashboard untuk verify mining

---

## 🚀 Quick Start Commands

**Termux:**
```bash
pkg update && pkg install -y nodejs tmux
./install.sh
./run.sh
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs tmux
./install.sh
./run.sh
```

**Windows:**
```cmd
install.bat
node deltahash_pro.cjs
```

---

Happy Mining! 🎉
