#!/bin/bash

echo "=================================="
echo "DeltaHash Bot Runner"
echo "=================================="
echo ""

if command -v tmux &> /dev/null; then
    echo "tmux detected. Starting bot in tmux session..."
    echo ""
    echo "Commands:"
    echo "- Detach: Ctrl+B then D"
    echo "- Reattach: tmux attach -t deltahash"
    echo "- Kill session: tmux kill-session -t deltahash"
    echo ""
    
    if tmux has-session -t deltahash 2>/dev/null; then
        echo "Session 'deltahash' already exists."
        echo "Attaching to existing session..."
        tmux attach -t deltahash
    else
        echo "Creating new tmux session 'deltahash'..."
        tmux new-session -s deltahash "node deltahash_pro.cjs"
    fi
else
    echo "tmux not found. Running bot normally..."
    echo "Note: Bot will stop when you close terminal."
    echo ""
    echo "To install tmux:"
    echo "- Termux: pkg install tmux"
    echo "- Ubuntu/Debian: sudo apt install tmux"
    echo "- CentOS/RHEL: sudo yum install tmux"
    echo ""
    node deltahash_pro.cjs
fi
