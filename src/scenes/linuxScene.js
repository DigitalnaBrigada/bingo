import Phaser from 'phaser';

export default class LinuxScene extends Phaser.Scene {
  constructor() {
    super('LinuxScene');
  }

  preload() {
      this.load.image('database', 'src/components/database_1.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    // layout velikosti
    const leftW = Math.floor(width * 0.65);
    const leftH = height - 110;
    const leftX = 0;
    const leftY = 50;

    // bg
    this.add.rectangle(0, 0, width, height, 0x0b0b0b).setOrigin(0);
    const leftBg = this.add.rectangle(leftX, leftY, leftW, leftH, 0x020203).setOrigin(0);

    // naslovnca
    this.add.rectangle(0, 0, width, 42, 0x071216).setOrigin(0);
    this.add.text(600, 12, 'Arch terminal', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#7efc6a'
    }).setOrigin(0, 0);

    // prompt/input
    this.promptTextColor = '#7efc6a';
    this.inputTextColor = '#dbe7d2';
    this.lineHeight = 30;

    // terminal history list
    this.terminalHistory = [];
    this.terminalY = leftY + 12;

    // curr prompt
    this.currentPromptStr = '[erik@ArchLinux ~]$';
    this.currentInputPrompt = this.add.text(leftX + 12, this.terminalY + 28, this.currentPromptStr + ' ', {
      fontFamily: 'monospace',
      fontSize: 28,
      color: this.promptTextColor
    }).setOrigin(0, 0);

    this.currentInput = this.add.text(leftX + 12 + this.currentPromptStr.length * 16 + 6, this.terminalY + 28, '', {
      fontFamily: 'monospace',
      fontSize: 28,
      color: this.inputTextColor
    }).setOrigin(0, 0);

    this.terminalY += this.lineHeight;

    // to-do list
    const rightX = leftW;
    const rightW = width - leftW;
    const rightH = leftH;
    const rightY = leftY;

    this.add.rectangle(rightX, rightY, rightW, rightH, 0x0a0f12).setOrigin(0);
    this.add.text(rightX + 18, rightY + 12, 'To-Do', {
      fontFamily: 'monospace',
      fontSize: 24,
      color: '#8be9a8'
    }).setOrigin(0, 0);

    this.todos = [
     {
        text: 'Remove virus file from system\n("I think the exectuable is bricking my computer\")',
        done: false,
        matches: (raw) => raw.trim() === 'rm notavirus.exe'
      },
      {
        text: 'Rename txt file into partialKey.txt\n("I have upgraded my key so it is made of two pieces")',
        done: false,
        matches: (raw) => raw.trim() === 'mv fullKey.txt partialKey.txt'
      },
      {
        text: 'Reveal key 🐈',
        done: false,
        matches: (raw) => raw.trim() === 'cat partialKey.txt'
      }
    ];

    // Render za to-do list
    this.todoTexts = [];
    const todoStartY = rightY + 60;
    const todoX = rightX + 28;
    const todoSpacing = 64;
    for (let i = 0; i < this.todos.length; i++) {
      const t = this.todos[i];
      const txt = this.add.text(todoX, todoStartY + i * todoSpacing, `⬜ ${t.text}`, {
        fontFamily: 'monospace',
        fontSize: 20,
        color: '#c2f4d2'
      }).setOrigin(0, 0);
      this.todoTexts.push(txt);
    }

    // Spodnji gumbi
    const btnY = height - 36;
    const btnBaseX = leftW / 2;

    // Run (lahko z enter)
    const runBtn = this.add.text(btnBaseX - 120, btnY, 'Run', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      backgroundColor: '#1f6b3a',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    runBtn.on('pointerdown', () => this.executeCommand());
    runBtn.on('pointerover', () => runBtn.setStyle({ backgroundColor: '#2a7b49' }));
    runBtn.on('pointerout', () => runBtn.setStyle({ backgroundColor: '#1f6b3a' }));

    // Clear
    const clearBtn = this.add.text(btnBaseX, btnY, 'Clear', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      backgroundColor: '#7c2d12',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    clearBtn.on('pointerdown', () => this.clearTerminal());
    clearBtn.on('pointerover', () => clearBtn.setStyle({ backgroundColor: '#92400e' }));
    clearBtn.on('pointerout', () => clearBtn.setStyle({ backgroundColor: '#7c2d12' }));

    // Back
    const backButton = this.add.text(12, 4, '↩ Back', {
    fontFamily: 'Arial',
    fontSize: '20px',
    color: '#387affff',
    padding: { x: 20, y: 10 }
    })
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => backButton.setStyle({ color: '#0054fdff' }))
    .on('pointerout', () => backButton.setStyle({ color: '#387affff' }))
    .on('pointerdown', () => {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
        this.scene.start('DesktopScene');
        });
    });

    this.editorX = leftX;
    this.editorY = leftY;
    this.editorW = leftW;
    this.editorH = leftH;

    this.setupKeyboardInput();

    this.txtFile = 'fullKey.txt';
    this.virusFile = 'notavirus.exe';
  }

  setupKeyboardInput() {
    const keyboard = this.input.keyboard;

    keyboard.on('keydown', (event) => {
      const current = this.currentInput.text;

      if (event.keyCode === 8) {
        // backspace
        this.currentInput.setText(current.slice(0, -1));
        event.preventDefault();
      } else if (event.keyCode === 13) {
        // Enter = execute
        this.executeCommand();
        event.preventDefault();
      }
    });

    // normalizacija posebnih charov
    keyboard.on('keydown', (event) => {
      if (event.keyCode >= 48 && event.keyCode <= 90) {
        const ch = String.fromCharCode(event.keyCode);
        this.currentInput.setText(this.currentInput.text + (event.shiftKey ? ch : ch.toLowerCase()));
      } else if (event.keyCode === 32) {
        this.currentInput.setText(this.currentInput.text + ' ');
      } else if ([186,187,188,189,190,191,192,219,220,221,222].includes(event.keyCode)) {
        const map = {
          186: ';', 187: '=', 188: ',', 189: '_', 190: '.', 191: '/',
          192: '`', 219: '[', 220: '\\', 221: ']', 222: "'"
        };
        const ch = map[event.keyCode] || '';
        this.currentInput.setText(this.currentInput.text + ch);
      }
    });
  }

  executeCommand() {
    const raw = this.currentInput.text.trim();
    if (!raw) return;

    // input history
    const inp = this.add.text(this.editorX + 12, this.terminalY, `${this.currentPromptStr} ${raw}`, {
      fontFamily: 'monospace',
      fontSize: 28,
      color: this.promptTextColor
    }).setOrigin(0, 0);
    this.terminalHistory.push(inp);
    this.terminalY += this.lineHeight;

    this.checkTodo(raw);

    let outputLines = [];

    // predelava vnosa
    const cmd = raw.split(' ')[0];
    const args = raw.split(' ').slice(1);
    switch (cmd) {
    case 'ls':
        if(this.virusFile){
            outputLines = ['RESEARCH.md', this.virusFile, 'package.json', this.txtFile, 'scripts/'];
        } else {
            outputLines = ['RESEARCH.md', 'package.json', this.txtFile, 'scripts/'];
        }
        break;

    case 'pwd':
        outputLines = ['/home/erik'];
        break;

    case 'cat': {
        const target = args.join(' ');
        if (target === 'partialKey.txt') {
          if(this.virusFile){
            outputLines = [
              'NAME="V!rus c▩rrrӜ◇ti▓n d€tec+█▒"',
              'a = ▓☢'
            ];
          } else{
            outputLines = [
              'NAME="Erik\'s java dev environment variable a"',
              'a = 17'
            ];
          }
        } else if (target === 'fullKey.txt') {
            outputLines = ['Fill out the tasks in order!'];
        } else {
            outputLines = [`cat: ${target}: No such file or directory`];
        }
        break;
    }

    case 'sudo':
        outputLines = ['Permission denied: you are not root (mock)'];
        break;

    case 'help':
    case '--help':
        outputLines = [
        'Supported commands: cat, clear, help, ls, mv, pwd,'
        ];
        break;

    case 'clear':
        this.clearTerminal();
        return;

    case 'mv':
        const target = args.join(' ');
        if (target === ('fullKey.txt partialKey.txt')) {
        outputLines = [
            'Renamed file'
        ];
        this.txtFile = 'partialKey.txt';
        } else {
            outputLines = [`mv: ${target}: Incorrect usage`];
        }
        break;

    case 'rm':
        const rm_target = args.join(' ');
        if (rm_target === ('notavirus.exe')) {
        outputLines = [
            'Removed file'
        ];
        this.virusFile = null;
        } else {
            outputLines = [`rm: ${rm_target}: Incorrect usage`];
        }
        break;

    default:
        outputLines = [`bash: ${cmd}: command not found`];
        break;
    }

    // output linije
    for (const line of outputLines) {
      const out = this.add.text(this.editorX + 12, this.terminalY, line, {
        fontFamily: 'monospace',
        fontSize: 28,
        color: line.startsWith('bash:') ? '#ff6b6b' : '#c7f9d6'
      }).setOrigin(0, 0);
      this.terminalHistory.push(out);
      this.terminalY += this.lineHeight;
    }

    // premik prompta za vrstico
    this.currentInput.setText('');
    this.currentInputPrompt.setY(this.terminalY);
    this.currentInput.setY(this.terminalY);
  }

  checkTodo(raw) {
    let changed = false;
    for (let i = 0; i < this.todos.length; i++) {
      const t = this.todos[i];
      if (!t.done && t.matches(raw)) {
        t.done = true;
        changed = true;
        // update display
        const txt = this.todoTexts[i];
        txt.setText(`✓ ${t.text}`);
        txt.setStyle({ color: '#7efc6a', fontStyle: 'bold' });
        this.tweens.add({
          targets: txt,
          scale: 1.08,
          duration: 120,
          yoyo: true
        });
      }
    }

    if (changed) {
      // če vse konec na podnju checkmark
      if (this.todos.every(t => t.done)) {
        const rightX = this.editorW;
        const rightY = this.editorY;
        const msg = this.add.text(rightX + 24, rightY + this.editorH - 60, 'All tasks complete ✓', {
          fontFamily: 'monospace',
          fontSize: 20,
          color: '#7efc6a'
        }).setOrigin(0, 0);
        this.tweens.add({
          targets: msg,
          alpha: { from: 0, to: 1 },
          duration: 300
        });
      }
    }
  }


  clearTerminal() {
    this.terminalHistory.forEach(item => item.destroy());
    this.terminalHistory = [];
    this.terminalY = this.editorY + 12;
    this.currentInput.setText('');
    this.currentInputPrompt.setY(this.terminalY);
    this.currentInput.setY(this.terminalY);
  }
}