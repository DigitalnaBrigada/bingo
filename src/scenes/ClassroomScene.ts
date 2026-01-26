import Phaser from 'phaser';
import {generateMathProblems} from "../utils/mathProblemsGenerator";

export default class ClassroomScene extends Phaser.Scene {
    private keypadButton?: Phaser.GameObjects.Rectangle;
    private latexElement?: HTMLDivElement;
    private modalElement?: HTMLDivElement;
    private pincode: string = '';

    private mathProblems = generateMathProblems();

    private currentProblemIndex: number = 0;
    private hintIndex: number = 0;

    private stickyNotes: Phaser.GameObjects.Rectangle[] = [];
    private stickyNoteMessages: HTMLDivElement[] = [];

    private timeRemaining: number = 300;
    private timerText?: Phaser.GameObjects.Text;
    private timerEvent?: Phaser.Time.TimerEvent;

    constructor() {
        super({key: 'ClassroomScene'});
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        if (!this.latexElement) {
            this.createLatexDisplay(width, height);
        } else {
            this.updateLatexPosition(width, height);
        }

        if (!this.modalElement) {
            this.createModal();
        }

        this.createBackground(width, height);
        this.createMonitor(width, height);
        this.createDoor(width, height);
        this.createTimer(width, height);
        this.startTimer();

        this.scale.on('resize', this.handleResize, this);
    }

    private createBackground(width: number, height: number) {
        const floorHeight = height * 0.2;
        const floorGradient = this.add.rectangle(
            width / 2,
            height - floorHeight / 2,
            width,
            floorHeight,
            0x607d8b
        );

        const wallHeight = height * 0.8;
        const wall = this.add.rectangle(
            width / 2,
            wallHeight / 2,
            width,
            wallHeight,
            0xc5ccd1
        );

        const light1 = this.add.rectangle(width * 0.28, height * 0.05, width * 0.15, height * 0.01, 0xffffff, 0.4);
        light1.setBlendMode(Phaser.BlendModes.ADD);

        const light2 = this.add.rectangle(width * 0.72, height * 0.05, width * 0.15, height * 0.01, 0xffffff, 0.4);
        light2.setBlendMode(Phaser.BlendModes.ADD);
    }

    private createMonitor(width: number, height: number) {
        const monitorX = width * 0.25;
        const monitorY = height * 0.25;
        const monitorWidth = width * 0.35;
        const monitorHeight = height * 0.35;

        const topWidth = width * 0.04;
        const bottomWidth = width * 0.02;
        const standHeight = height * 0.03;

        const trapezoidPoints = [
            -bottomWidth / 2, standHeight / 2,   // bottom left
            bottomWidth / 2, standHeight / 2,   // bottom right
            topWidth / 2, -standHeight / 2,   // top right
            -topWidth / 2, -standHeight / 2    // top left
        ];

        const leftStand = this.add.polygon(
            monitorX - width * 0.04,
            monitorY + monitorHeight / 2 + height * 0.02,
            trapezoidPoints,
            0x263238
        );

        const rightStand = this.add.polygon(
            monitorX + 2 * width * 0.04,
            monitorY + monitorHeight / 2 + height * 0.02,
            trapezoidPoints,
            0x263238
        );

        const bezel = this.add.rectangle(
            monitorX,
            monitorY,
            monitorWidth,
            monitorHeight,
            0x37474f
        );

        const screen = this.add.rectangle(
            monitorX,
            monitorY,
            monitorWidth * 0.92,
            monitorHeight * 0.92,
            0x1a1f24
        );

        const glare = this.add.triangle(
            monitorX - monitorWidth * 0.3,
            monitorY - monitorHeight * 0.3,
            0, 0,
            monitorWidth * 0.4, 0,
            0, monitorHeight * 0.4,
            0xffffff,
            0.05
        );

        const topBarText = this.add.text(
            monitorX - monitorWidth * 0.42,
            monitorY - monitorHeight * 0.4,
            'MathLab',
            {
                fontSize: `${width * 0.01}px`,
                color: '#60a5fa'
            }
        );

        const connectedDot = this.add.circle(
            monitorX + monitorWidth * 0.25,
            monitorY - monitorHeight * 0.4,
            width * 0.004,
            0x22c55e
        );

        const connectedText = this.add.text(
            monitorX + monitorWidth * 0.27,
            monitorY - monitorHeight * 0.42,
            'Connected',
            {
                fontSize: `${width * 0.01}px`,
                color: '#60a5fa'
            }
        );

        const bottomText = this.add.text(
            monitorX - monitorWidth * 0.42,
            monitorY + monitorHeight * 0.38,
            'Lab Station 03',
            {
                fontSize: `${width * 0.008}px`,
                color: '#9ca3af'
            }
        );

        const powerLED = this.add.circle(
            monitorX + monitorWidth * 0.48,
            monitorY + monitorHeight * 0.47,
            width * 0.003,
            0x22c55e
        );
        powerLED.setBlendMode(Phaser.BlendModes.ADD);

    }

    private createDoor(width: number, height: number) {
        const doorX = width * 0.8;
        const doorY = height * 0.55;
        const doorWidth = width * 0.18;
        const doorHeight = height * 0.5;
        const keypadX = doorX + doorWidth * 0.77;
        const keypadY = doorY - height * 0.05;

        const door = this.add.rectangle(
            doorX,
            doorY,
            doorWidth,
            doorHeight,
            0x607d8b
        );

        const frame = this.add.rectangle(
            doorX,
            doorY,
            doorWidth,
            doorHeight
        );
        frame.setStrokeStyle(width * 0.004, 0x37474f);

        for (let i = 0; i < 13; i++) {
            const rivetL = this.add.circle(
                doorX - doorWidth * 0.45,
                doorY - doorHeight * 0.45 + (i * doorHeight * 0.075),
                width * 0.004,
                0x546e7a
            );
            rivetL.setStrokeStyle(width * 0.001, 0x37474f);
        }

        for (let i = 0; i < 13; i++) {
            const rivetR = this.add.circle(
                doorX + doorWidth * 0.45,
                doorY - doorHeight * 0.45 + (i * doorHeight * 0.075),
                width * 0.004,
                0x546e7a
            );
            rivetR.setStrokeStyle(width * 0.001, 0x37474f);
        }


        const label = this.add.rectangle(
            doorX,
            doorY - doorHeight * 0.35,
            doorWidth * 0.66,
            height * 0.025,
            0xfacc15
        );

        const labelText = this.add.text(
            doorX,
            doorY - doorHeight * 0.35,
            'AUTHORIZED PERSONNEL ONLY',
            {
                fontSize: `${width * 0.007}px`,
                color: '#000000'
            }
        ).setOrigin(0.5);

        const windowRect = this.add.rectangle(
            doorX,
            doorY - doorHeight * 0.2,
            doorWidth * 0.65,
            height * 0.1,
            0x1a237e,
            0.4
        );
        windowRect.setStrokeStyle(width * 0.003, 0x37474f);

        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x263238, 0.3);

        for (let i = 0; i < 8; i++) {
            const y = doorY - doorHeight * 0.25 + (i * height * 0.0125);
            graphics.lineBetween(
                doorX - doorWidth * 0.325,
                y,
                doorX + doorWidth * 0.325,
                y
            );
        }

        for (let i = 0; i < 12; i++) {
            const x = doorX - doorWidth * 0.325 + (i * doorWidth * 0.054);
            graphics.lineBetween(
                x,
                doorY - doorHeight * 0.25,
                x,
                doorY - doorHeight * 0.15
            );
        }

        const hinge1 = this.add.rectangle(doorX - doorWidth * 0.5, doorY - doorHeight * 0.3, width * 0.005, height * 0.02, 0x616161);
        const hinge2 = this.add.rectangle(doorX - doorWidth * 0.5, doorY, width * 0.005, height * 0.02, 0x616161);
        const hinge3 = this.add.rectangle(doorX - doorWidth * 0.5, doorY + doorHeight * 0.3, width * 0.005, height * 0.02, 0x616161);

        const conduitStartX = doorX + doorWidth * 0.5;
        const conduitEndX = keypadX - width * 0.04;
        const conduitY = keypadY;

        const conduit = this.add.rectangle(
            (conduitStartX + conduitEndX) / 2,
            conduitY,
            conduitEndX - conduitStartX,
            height * 0.008,
            0x757575
        );

        const wireGraphics = this.add.graphics();
        wireGraphics.lineStyle(2, 0xd32f2f);
        wireGraphics.lineBetween(conduitStartX, conduitY - height * 0.005, conduitEndX, conduitY - height * 0.005);

        wireGraphics.lineStyle(2, 0x0288d1);
        wireGraphics.lineBetween(conduitStartX, conduitY, conduitEndX, conduitY);

        wireGraphics.lineStyle(2, 0x388e3c);
        wireGraphics.lineBetween(conduitStartX, conduitY + height * 0.005, conduitEndX, conduitY + height * 0.005);

        this.createKeypad(keypadX, keypadY, width, height);
    }

    private createKeypad(x: number, y: number, width: number, height: number) {
        const keypadWidth = width * 0.08;
        const keypadHeight = height * 0.18;

        this.keypadButton = this.add.rectangle(
            x,
            y,
            keypadWidth,
            keypadHeight,
            0x37474f
        );
        this.keypadButton.setStrokeStyle(width * 0.003, 0x263238);
        this.keypadButton.setInteractive({useHandCursor: true});

        const brandText = this.add.text(
            x,
            y - keypadHeight * 0.42,
            'SecureAccess 3000',
            {
                fontSize: `${width * 0.005}px`,
                color: '#d1d5db'
            }
        ).setOrigin(0.5);

        const buttonSize = width * 0.015;
        const gap = width * 0.005;
        const startY = y - keypadHeight * 0.15;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const num = row * 3 + col + 1;
                const btnX = x - buttonSize - gap + col * (buttonSize + gap);
                const btnY = startY + row * (buttonSize + gap);

                const btn = this.add.rectangle(btnX, btnY, buttonSize, buttonSize, 0x424242);
                btn.setStrokeStyle(width * 0.001, 0x212121);

                const btnText = this.add.text(btnX, btnY, num.toString(), {
                    fontSize: `${width * 0.008}px`,
                    color: '#ffffff'
                }).setOrigin(0.5);
            }
        }

        const led1 = this.add.circle(x - width * 0.005, y + keypadHeight * 0.45, width * 0.002, 0xdc2626);
        led1.setBlendMode(Phaser.BlendModes.ADD);

        const led2 = this.add.circle(x + width * 0.005, y + keypadHeight * 0.45, width * 0.002, 0x4b5563);

        this.keypadButton.on('pointerdown', () => {
            this.showModal();
        });

        this.keypadButton.on('pointerover', () => {
            this.keypadButton?.setFillStyle(0x455a64);
        });

        this.keypadButton.on('pointerout', () => {
            this.keypadButton?.setFillStyle(0x37474f);
        });
    }

    private createLatexDisplay(width: number, height: number) {
        this.latexElement = document.createElement('div');
        this.latexElement.style.position = 'absolute';
        this.latexElement.style.left = `${width * 0.25}px`;
        this.latexElement.style.top = `${height * 0.25}px`;
        this.latexElement.style.width = `${width * 0.32}px`;
        this.latexElement.style.height = `${height * 0.32}px`;
        this.latexElement.style.transform = 'translate(-50%, -50%)';
        this.latexElement.style.display = 'flex';
        this.latexElement.style.flexDirection = 'column';
        this.latexElement.style.alignItems = 'center';
        this.latexElement.style.justifyContent = 'center';
        this.latexElement.style.color = 'rgba(255, 255, 255, 0.9)';
        this.latexElement.style.fontSize = `${width * this.mathProblems[this.currentProblemIndex].size}px`;
        this.latexElement.style.pointerEvents = 'none';
        this.latexElement.innerHTML = `
            <div id="latex-content">
                \\[${this.mathProblems[this.currentProblemIndex].problem}\\]

                ${
            this.mathProblems[this.currentProblemIndex].question !== ''
                ? `\\[${this.mathProblems[this.currentProblemIndex].question}\\]`
                : ''
        }
            </div>
        `;

        document.body.appendChild(this.latexElement);

        if (!(window as any).MathJax) {
            (window as any).MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']]
                },
                startup: {
                    pageReady: () => {
                        return (window as any).MathJax.startup.defaultPageReady();
                    }
                }
            };

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
            script.async = true;
            document.head.appendChild(script);
        } else {
            setTimeout(() => {
                if ((window as any).MathJax?.typesetPromise) {
                    (window as any).MathJax.typesetPromise([this.latexElement]);
                }
            }, 100);
        }
    }

    private updateLatexPosition(width: number, height: number) {
        if (this.latexElement) {
            this.latexElement.style.left = `${width * 0.25}px`;
            this.latexElement.style.top = `${height * 0.25}px`;
            this.latexElement.style.width = `${width * 0.32}px`;
            this.latexElement.style.height = `${height * 0.32}px`;
            this.latexElement.style.fontSize = `${width * this.mathProblems[this.currentProblemIndex].size}px`;
        }
    }

    private createModal() {
        this.modalElement = document.createElement('div');
        this.modalElement.style.position = 'fixed';
        this.modalElement.style.inset = '0';
        this.modalElement.style.zIndex = '50';
        this.modalElement.style.display = 'none';
        this.modalElement.style.alignItems = 'center';
        this.modalElement.style.justifyContent = 'center';
        this.modalElement.innerHTML = `
      <div class="modal-backdrop" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);"></div>
      <div class="modal-content" style="position: relative; background: #111827; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); width: 400px; border: 4px solid #374151;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #374151;">
          <h2 style="font-size: 1.5rem; color: white; margin: 0;">Vnesi Pin</h2>
          <button id="close-modal" style="color: #9ca3af; background: none; border: none; cursor: pointer; font-size: 1.5rem;">×</button>
        </div>
        <div style="padding: 1.5rem;">
          <div style="background: #1f2937; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div id="pincode-display" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
              ${Array(6).fill(0).map((_, i) => `
                <div class="pin-dot" data-index="${i}" style="width: 48px; height: 48px; border-radius: 0.5rem; border: 2px solid #4b5563; background: #374151; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #6b7280;"></div>
              `).join('')}
            </div>
            <div id="message" style="text-align: center; margin-top: 0.5rem; display: none;"></div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
              <button class="num-btn" data-num="${num}" style="background: #374151; color: white; font-size: 1.5rem; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">${num}</button>
            `).join('')}
            <button id="clear-btn" style="background: #dc2626; color: white; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">Počisti</button>
            <button class="num-btn" data-num="0" style="background: #374151; color: white; font-size: 1.5rem; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">0</button>
            <button id="backspace-btn" style="background: #ca8a04; color: white; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">←</button>
          </div>
          <button id="submit-btn" style="width: 100%; background: #16a34a; color: white; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">Pošlji</button>
        </div>
      </div>
    `;

        document.body.appendChild(this.modalElement);

        const closeBtn = this.modalElement.querySelector('#close-modal');
        const backdrop = this.modalElement.querySelector('.modal-backdrop');
        const numBtns = this.modalElement.querySelectorAll('.num-btn');
        const clearBtn = this.modalElement.querySelector('#clear-btn');
        const backspaceBtn = this.modalElement.querySelector('#backspace-btn');
        const submitBtn = this.modalElement.querySelector('#submit-btn');

        closeBtn?.addEventListener('click', () => this.hideModal());
        backdrop?.addEventListener('click', () => this.hideModal());

        numBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.getAttribute('data-num');
                if (num && this.pincode.length < 6) {
                    this.pincode += num;
                    this.updatePincodeDisplay();
                }
            });
        });

        clearBtn?.addEventListener('click', () => {
            this.pincode = '';
            this.updatePincodeDisplay();
        });

        backspaceBtn?.addEventListener('click', () => {
            this.pincode = this.pincode.slice(0, -1);
            this.updatePincodeDisplay();
        });

        submitBtn?.addEventListener('click', () => {
            this.handleSubmit();
        });

        const allButtons = this.modalElement.querySelectorAll('button');
        allButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (btn.classList.contains('num-btn')) {
                    (btn as HTMLElement).style.background = '#4b5563';
                } else if (btn.id === 'clear-btn') {
                    (btn as HTMLElement).style.background = '#b91c1c';
                } else if (btn.id === 'backspace-btn') {
                    (btn as HTMLElement).style.background = '#a16207';
                } else if (btn.id === 'submit-btn') {
                    (btn as HTMLElement).style.background = '#15803d';
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (btn.classList.contains('num-btn')) {
                    (btn as HTMLElement).style.background = '#374151';
                } else if (btn.id === 'clear-btn') {
                    (btn as HTMLElement).style.background = '#dc2626';
                } else if (btn.id === 'backspace-btn') {
                    (btn as HTMLElement).style.background = '#ca8a04';
                } else if (btn.id === 'submit-btn') {
                    (btn as HTMLElement).style.background = '#16a34a';
                }
            });
        });
    }

    private showModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'flex';
            this.pincode = '';
            this.updatePincodeDisplay();
            this.hideMessage();
        }
    }

    private hideModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
        }
    }

    private updatePincodeDisplay() {
        const dots = this.modalElement?.querySelectorAll('.pin-dot');
        dots?.forEach((dot, index) => {
            if (index < this.pincode.length) {
                (dot as HTMLElement).style.background = '#3b82f6';
                (dot as HTMLElement).style.borderColor = '#60a5fa';
                (dot as HTMLElement).style.color = '#ffffff';
                (dot as HTMLElement).textContent = '•';
            } else {
                (dot as HTMLElement).style.background = '#374151';
                (dot as HTMLElement).style.borderColor = '#4b5563';
                (dot as HTMLElement).style.color = '#6b7280';
                (dot as HTMLElement).textContent = '';
            }
        });
    }

    private handleSubmit() {

        if (this.pincode.length === 0) return;

        if (this.pincode === this.mathProblems[this.currentProblemIndex].correctAnswer) {
            this.showMessage('Dostop uspešen! 🎉', '#22c55e');
            this.hideModal();
            this.latexElement.innerHTML = `e = _._`
            this.time.delayedCall(10000, () => {
                this.latexElement?.remove();
                this.scene.start('MenuScene');
            });
        } else {
            this.showMessage('Napačno geslo!', '#ef4444');
            const currentHints = this.mathProblems[this.currentProblemIndex].hints;
            if (this.hintIndex < currentHints.length) {
                this.createStickyNote(currentHints[this.hintIndex]);
                this.hintIndex++;
            }
            setTimeout(() => {
                this.hideMessage();
            }, 2000);
        }
    }

    private showMessage(text: string, color: string) {
        const messageEl = this.modalElement?.querySelector('#message') as HTMLElement;
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.style.color = color;
            messageEl.style.display = 'block';
        }
    }

    private hideMessage() {
        const messageEl = this.modalElement?.querySelector('#message') as HTMLElement;
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

    private createStickyNote(hint: string, x?: number, y?: number) {
        const width = this.scale.width;
        const height = this.scale.height;

        const stickyX = x ?? Phaser.Math.Between(width * 0.5, width * 0.7);
        const stickyY = y ?? Phaser.Math.Between(height * 0.4, height * 0.6);

        const stickyNote = this.add.rectangle(
            stickyX,
            stickyY,
            width * 0.1,
            height * 0.1,
            (this.hintIndex + 1) === this.mathProblems[this.currentProblemIndex].hints.length ? 0x22c55e : 0xfacc15,
        );
        stickyNote.setInteractive({useHandCursor: true});
        stickyNote.setAngle(Phaser.Math.Between(-5, 5));

        stickyNote.on('pointerdown', () => {
            if (this.modalElement && this.modalElement.style.display === 'flex') {
                return;
            }
            this.showHintModal(hint);
        });

        this.stickyNotes.push(stickyNote);
    }

    private showHintModal(hint: string) {
        let hintModal = document.getElementById('hint-modal') as HTMLDivElement;
        if (!hintModal) {
            hintModal = document.createElement('div');
            hintModal.id = 'hint-modal';
            hintModal.style.position = 'fixed';
            hintModal.style.inset = '0';
            hintModal.style.display = 'flex';
            hintModal.style.alignItems = 'center';
            hintModal.style.justifyContent = 'center';
            hintModal.style.background = 'rgba(0,0,0,0.5)';
            hintModal.style.zIndex = '100';
            hintModal.innerHTML = `
            <div style="background: #111827; border-radius: 1rem; padding: 2rem; width: 400px; position: relative; color: white; text-align:center;">
                <button id="hint-close-btn" style="position:absolute; top:10px; right:10px; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">×</button>
                <div id="hint-latex" style="margin-top:2rem; font-size:1.2rem;"></div>
            </div>
        `;
            document.body.appendChild(hintModal);

            const closeBtn = hintModal.querySelector('#hint-close-btn');
            closeBtn?.addEventListener('click', () => this.hideHintModal());
            hintModal.addEventListener('click', (e) => {
                if (e.target === hintModal) this.hideHintModal();
            });
        }

        const hintLatexEl = document.getElementById('hint-latex');
        hintLatexEl.innerHTML = `\\[${hint}\\]`;


        hintModal.style.display = 'flex';

        if ((window as any).MathJax?.typesetPromise) {
            (window as any).MathJax.typesetPromise([hintLatexEl]);
        }
    }

    private hideHintModal() {
        const hintModal = document.getElementById('hint-modal') as HTMLDivElement;
        if (hintModal) hintModal.style.display = 'none';
    }

    private createTimer(width: number, height: number) {
        const timerX = width * 0.8;
        const timerY = height * 0.25;
        const timerWidth = width * 0.18;
        const timerHeight = height * 0.1;

        const screen = this.add.rectangle(
            timerX,
            timerY,
            timerWidth * 0.95,
            timerHeight * 0.9,
            0x1a1f24
        );

        this.timerText = this.add.text(
            timerX,
            timerY - timerHeight * 0.025,
            `${this.formatTime(this.timeRemaining)}`,
            {
                fontFamily: 'Seven Segment',
                fontSize: `${width * 0.05}px`,
                fontStyle: 'bold',
                color: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);


    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    private updateTimer() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            if (this.timerText) {
                this.timerText.setText(`${this.formatTime(this.timeRemaining)}`);
            }
        } else {
            if (this.timerText) {
                this.timerText.setText('Time Up');
                this.hideModal();
                this.latexElement?.remove();
                this.time.delayedCall(1500, () => {
                    this.scene.start('MenuScene');
                });
            }
            if (this.timerEvent) {
                this.timerEvent.remove(false);
            }
        }
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    private handleResize() {
        this.scene.restart();
    }

    destroy() {
        if (this.latexElement) {
            this.latexElement.remove();
        }


        super.destroy();
    }
}