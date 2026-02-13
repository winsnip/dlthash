#!/bin/bash

echo "=================================="
echo "DeltaHash Bot Installer"
echo "=================================="
echo ""

if [[ "$OSTYPE" == "linux-android"* ]]; then
    PLATFORM="termux"
    echo "Platform: Termux (Android)"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
    echo "Platform: Linux"
else
    PLATFORM="unknown"
    echo "Platform: $OSTYPE"
fi

echo ""

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js already installed: $NODE_VERSION"
else
    echo "✗ Node.js not found. Installing..."
    
    if [ "$PLATFORM" == "termux" ]; then
        pkg update -y
        pkg install -y nodejs
    elif [ "$PLATFORM" == "linux" ]; then
        if command -v apt &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
        else
            echo "✗ Unsupported package manager. Please install Node.js manually."
            exit 1
        fi
    fi
    
    echo "✓ Node.js installed successfully"
fi

echo ""

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✓ npm already installed: $NPM_VERSION"
else
    echo "✗ npm not found"
    exit 1
fi

echo ""
echo "Installing dependencies..."
npm install axios ws https-proxy-agent

echo ""
echo "=================================="
echo "Installation completed!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit accounts_config.json with your tokens"
echo "2. Run: node deltahash_pro.cjs"
echo ""
echo "For Termux users:"
echo "- Keep app running in background"
echo "- Use 'tmux' for persistent sessions"
echo "- Install: pkg install tmux"
echo ""
