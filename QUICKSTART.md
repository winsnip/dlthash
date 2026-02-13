# Quick Start Guide

Panduan cepat untuk mulai mining dalam 5 menit!

**DeltaHash Mining Bot by WINSNIP v1.0.0**

---

## 🪟 Windows

### 1. Install Node.js
- Download: https://nodejs.org/
- Install versi LTS
- Restart terminal

### 2. Install Bot
```cmd
install.bat
```

### 3. Setup Token
Edit `accounts_config.json`:
```json
{
  "accounts": [
    {
      "name": "Account 1",
      "token": "s%3A...your_token...",
      "proxy": { "enabled": false, ... }
    }
  ],
  ...
}
```

### 4. Run Bot
Double-click `start.bat` atau:
```cmd
node deltahash_pro.cjs
```

---

## 🐧 Linux

### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Bot
```bash
chmod +x install.sh
./install.sh
```

### 3. Setup Token
```bash
nano accounts_config.json
# Edit dan save (Ctrl+X, Y, Enter)
```

### 4. Run Bot
```bash
# Normal
node deltahash_pro.cjs

# Dengan tmux (recommended)
sudo apt install tmux
chmod +x run.sh
./run.sh
```

---

## 📱 Android (Termux)

### 1. Install Termux
Download dari F-Droid: https://f-droid.org/packages/com.termux/

### 2. Setup Termux
```bash
pkg update && pkg upgrade -y
pkg install -y nodejs git tmux
```

### 3. Install Bot
```bash
# Download bot files ke Termux
# Lalu:
chmod +x install.sh
./install.sh
```

### 4. Setup Token
```bash
nano accounts_config.json
# Edit dan save
```

### 5. Run Bot
```bash
# Enable wakelock
termux-wake-lock

# Run dengan tmux
chmod +x run.sh
./run.sh

# Detach: Ctrl+B lalu D
# Reattach: tmux attach -t deltahash
```

---

## 🔑 Cara Dapat Token

1. Buka https://portal.deltahash.ai/mining di browser
2. Login dengan akun X (Twitter)
3. Tekan F12 untuk buka DevTools
4. Tab **Application** → **Cookies** → https://portal.deltahash.ai
5. Copy value dari cookie `connect.sid`
6. Paste ke `accounts_config.json`

Format token:
```
s%3AMBaQ6Cvt4-TG6lQnjooQe04Xqf7ttP7C.v3kuQUTurJ%2B4Adj1woF3yFfFJXreivwHaEVhuvdh1tg
```

---

## ✅ Verify Bot Running

Setelah start, Anda akan lihat:
```
    ██████╗ ███████╗██╗  ████████╗ █████╗ 
    ██╔══██╗██╔════╝██║  ╚══██╔══╝██╔══██╗
    ██║  ██║█████╗  ██║     ██║   ███████║
    ██║  ██║██╔══╝  ██║     ██║   ██╔══██║
    ██████╔╝███████╗███████╗██║   ██║  ██║
    ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝  ╚═╝

✔ Account 1 - Mining connected! Epoch: 408
✔ All accounts mining successfully!
```

Dashboard akan update setiap 60 detik dengan stats:
- Balance
- Session earned
- Heartbeats
- Mining speed & multiplier
- Uptime

---

## 🛑 Stop Bot

**Windows:** Tekan `Ctrl+C`

**Linux:** Tekan `Ctrl+C`

**Termux dengan tmux:**
1. Attach: `tmux attach -t deltahash`
2. Stop: `Ctrl+C`
3. Kill session: `tmux kill-session -t deltahash`

---

## 🆘 Troubleshooting

### "Token expired" atau "Failed to get user info"
→ Get token baru dari browser

### "Failed to connect mining"
→ Mining period belum dimulai, bot akan auto-retry

### Bot stops when close terminal (Termux)
→ Use tmux: `./run.sh`
→ Enable wakelock: `termux-wake-lock`

### "node: command not found"
→ Install Node.js terlebih dahulu

---

## 📚 More Info

- Full installation guide: [INSTALL.md](INSTALL.md)
- Complete documentation: [README.md](README.md)
- Config examples: [accounts_config.example.json](accounts_config.example.json)

---

Happy Mining! 🚀
