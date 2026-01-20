import Phaser from 'phaser';

export default class BingoScene extends Phaser.Scene {
    constructor() {
        super('BingoScene');

        this.gameData = [];
        this.boards = [];
        this.players = [];
        this.playerNames = [];
        this.playerIds = [];

        this.currentPlayer = 0;
        this.questionIndex = -1;
        this.limitIndex = 0;
        this.gameOver = false;

        this.timeRemaining = 15;
        this.timerEvent = null;
    }

    startRainbowAnimation(btn) {
        const colors = [0xff0000, 0xffff00, 0x90ee90, 0xadd8e6, 0xddddfd];
        let index = 0;

        if (btn.rainbowEvent) btn.rainbowEvent.remove();

        btn.rainbowEvent = this.time.addEvent({
            delay: 150,
            loop: true,
            callback: () => {
                btn.container.setFillStyle(colors[index]);
                index = (index + 1) % colors.length;
            }
        });
    }

    async create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0xf1f5f9).setOrigin(0);

        this.turnText = this.add.text(width / 2, 28, '', {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#2563eb',
            padding: { x: 18, y: 8 }
        }).setOrigin(0.5);

        this.timerText = this.add.text(width - 90, 28, '⏱️ 15s', {
            fontSize: '16px',
            color: '#111827',
            backgroundColor: '#e5e7eb',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        this.progressBg = this.add.rectangle(width / 2, 68, width - 140, 12, 0xe5e7eb).setOrigin(0.5);

        this.progressBar = this.add.rectangle(
            this.progressBg.x - this.progressBg.width / 2,
            68,
            this.progressBg.width,
            12,
            0x2563eb
        ).setOrigin(0, 0.5);

        this.questionBox = this.add.rectangle(width / 2, 150, width - 180, 90, 0xe9d5ff)
            .setStrokeStyle(2, 0xd8b4fe);

        this.questionText = this.add.text(width / 2, 150, '', {
            fontSize: '20px',
            color: '#111827',
            wordWrap: { width: width - 220 },
            align: 'center'
        }).setOrigin(0.5);

        this.answerButtons = [];
        const btnPositions = [
            [width / 2 - 260, 260],
            [width / 2 + 260, 260],
            [width / 2 - 260, 340],
            [width / 2 + 260, 340]
        ];

        btnPositions.forEach((pos, idx) => {
            const btn = this.createAnswerButton(pos[0], pos[1], idx);
            this.answerButtons.push(btn);
        });

        const backButton = this.add.text(12, 10, '↩ Back', {
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
                this.scene.start('LabScene');
            });
        });

        // Ejlien
        this.alien = this.add.container(
            this.questionBox.x,
            this.questionBox.y+150
        );
        this.alien.setVisible(false);

        // Head
        const head = this.add.circle(0, 0, 36, 0x22c55e)
            .setStrokeStyle(3, 0x166534);

        // Eyes
        const eyeLeft = this.add.circle(-18, -16, 6, 0x000000);
        const eyeRight = this.add.circle(18, -16, 6, 0x000000);

        // Antennas
        const antennaLeft = this.add.rectangle(-20, -30, 4, 18, 0x166534);
        const antennaRight = this.add.rectangle(20, -30, 4, 18, 0x166534);
        const antennaTipLeft = this.add.circle(-20, -40, 4, 0x22c55e);
        const antennaTipRight = this.add.circle(20, -40, 4, 0x22c55e);

        // Add to container
        this.alien.add([
            antennaLeft,
            antennaRight,
            antennaTipLeft,
            antennaTipRight,
            head,
            eyeLeft,
            eyeRight
]);


        await this.loadGame();
    }

    async loadGame() {
        this.playerNames = [localStorage.getItem('username'), 'Alien'];
        this.playerIds = [1, 2];

        const game = await window.api.startGame(1, [1, 2], this.playerIds);
        this.gameData = Phaser.Utils.Array.Shuffle(game.questions || []);
        this.boards = game.players.map(p => p.board);
        this.limitIndex = this.gameData.length - 1;

        this.renderBoards();
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.gameOver) return;

        this.questionIndex++;
        if (this.questionIndex > this.limitIndex) this.questionIndex = 0;

        const q = this.gameData[this.questionIndex];
        this.currentPlayer = this.questionIndex % this.playerNames.length;
        this.alien.setVisible(this.currentPlayer === 1);

        this.turnText.setText(`${this.playerNames[this.currentPlayer]}'s turn`);
        this.turnText.setBackgroundColor(
            this.currentPlayer === 0 ? '#3b82f6' : '#10b981'
        );
        this.questionText.setText(q.text);

        if (this.currentPlayer === 1) {
            this.questionBox.setFillStyle(0x10b981).setStrokeStyle(2, 0x059669);
        } else {
            this.questionBox.setFillStyle(0xe9d5ff).setStrokeStyle(2, 0xd8b4fe);
        }


        this.answerButtons.forEach((btn, i) => {
            btn.text.setText(q.options[i]);
            btn.container.setAlpha(1);
            btn.container.setFillStyle(0xffffff);
            btn.enabled = true;
            if (btn.rainbowEvent) btn.rainbowEvent.remove();
        });

        const isHumanTurn = this.currentPlayer === 0;

        this.answerButtons.forEach(btn => {
            btn.enabled = isHumanTurn;
            btn.container.disableInteractive();

            if (isHumanTurn) {
                btn.container.setInteractive({ useHandCursor: true });
                btn.container.setAlpha(1);
            } else {
                btn.container.setAlpha(0.5);
            }
        });

        if (this.currentPlayer === 1) {
            this.time.delayedCall(1000, () => {
                this.alienAnswer();
            });
        }

        this.startTimer();
        this.highlightTurn();
    }

    alienAnswer() {
        const chanceCorrect = 0.4;
        let index;
        if (Math.random() < chanceCorrect) {
            index = this.gameData[this.questionIndex].correctIndex;
            console.log("Correct: ", index);
        } else {
            index = Math.floor(Math.random() * 4);
            console.log('Rng:', index);
        }
        // Overall cca. 55%
        this.answerButtons[index]?.container.emit('pointerdown');
    }


    createAnswerButton(x, y, index) {
        const container = this.add.rectangle(x, y, 340, 64, 0xffffff)
            .setStrokeStyle(2, 0xd1d5db)
            .setInteractive({ useHandCursor: true });

        const text = this.add.text(x, y, '', {
            fontSize: '17px',
            color: '#111827',
            wordWrap: { width: 300 },
            align: 'center'
        }).setOrigin(0.5);

        const btn = { container, text, enabled: true };

        container.on('pointerdown', async () => {
            if (this.gameOver){ return; }
            if(!btn.enabled && this.currentPlayer===0){
                return;
            } 
            btn.enabled = false;
            try {
                const result = await window.api.answer(
                    this.currentPlayer,
                    this.gameData[this.questionIndex].id,
                    index
                );

                if (result.correct) this.startRainbowAnimation(btn);
                else btn.container.setFillStyle(0xef4444);

                if (Array.isArray(result?.board)) {
                    this.boards[this.currentPlayer] = result.board;
                    this.updateBoard(this.currentPlayer);
                }

                if (result?.bingo) {
                    this.endGame(this.currentPlayer);
                    return;
                }
            } catch (e) {}

            this.time.delayedCall(900, () => this.nextQuestion());
        });

        return btn;
    }

    startTimer() {
        if (this.timerEvent) this.timerEvent.remove();

        this.timeRemaining = 15;
        this.updateTimerUI();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.gameOver) return;
                this.timeRemaining--;
                this.updateTimerUI();
                if (this.timeRemaining <= 0) {
                    this.timerEvent.remove();
                    this.nextQuestion();
                }
            }
        });
    }

    updateTimerUI() {
        this.timerText.setText(`⏱️ ${this.timeRemaining}s`);
        this.progressBar.width = this.progressBg.width * (this.timeRemaining / 15);

        if (this.timeRemaining <= 5) this.progressBar.setFillStyle(0xf43f5e);
        else if (this.timeRemaining <= 10) this.progressBar.setFillStyle(0xf59e0b);
        else this.progressBar.setFillStyle(0x2563eb);
    }

    renderBoards() {
        const startY = 620;
        const spacingX = 420;

        this.boardContainers = [];

        this.playerNames.forEach((name, idx) => {
            const x = this.scale.width / 2 - spacingX / 2 + idx * spacingX;
            const y = startY;

            const panel = this.add.rectangle(x, y, 340, 380, 0xffffff)
                .setStrokeStyle(3, 0xd1d5db);

            const title = this.add.text(x, y - 205, name, {
                fontSize: '20px',
                color: '#111827',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const cells = [];
            let n = 1;

            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const cx = x - 120 + c * 60;
                    const cy = y - 140 + r * 60;

                    const selected = this.boards[idx]?.[r]?.[c];
                    const isCenter = r === 2 && c === 2;

                    const cell = this.add.rectangle(
                        cx, cy, 52, 52,
                        selected ? 0x2563eb : (isCenter ? 0xfef3c7 : 0xffffff)
                    ).setStrokeStyle(2, 0xd1d5db);

                    const label = this.add.text(
                        cx, cy,
                        isCenter ? '★' : String(n),
                        { fontSize: isCenter ? '22px' : '16px', color: '#111827' }
                    ).setOrigin(0.5);

                    cells.push({ cell, label });
                    n++;
                }
            }

            this.boardContainers.push({ panel, title, cells });
        });
    }

    updateBoard(playerIdx) {
        const board = this.boards[playerIdx];
        const ui = this.boardContainers[playerIdx];
        let i = 0;

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const selected = board[r][c];
                ui.cells[i].cell.setFillStyle(
                    selected ? (r === 2 && c === 2 ? 0xfacc15 : 0x2563eb) : 0xffffff
                );
                i++;
            }
        }
    }

    highlightTurn() {
        this.boardContainers.forEach((b, idx) => {
            b.panel.setStrokeStyle(
                idx === this.currentPlayer ? 5 : 3,
                idx === this.currentPlayer ? 0x2563eb : 0xd1d5db
            );
        });
    }

    endGame(winnerIdx) {
        this.gameOver = true;
        if (this.timerEvent) this.timerEvent.remove();

        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0);

        this.add.rectangle(width / 2, height / 2, 420, 240, 0xffffff)
            .setStrokeStyle(2, 0xd1d5db);

        this.add.text(width / 2, height / 2 - 40,
            `${this.playerNames[winnerIdx]} je zmagal! 🏆`,
            { fontSize: '22px', color: '#111827' }
        ).setOrigin(0.5);

        const btn = this.add.rectangle(width / 2, height / 2 + 60, 220, 54, 0x2563eb)
            .setInteractive({ useHandCursor: true });

        this.add.text(width / 2, height / 2 + 60, 'Nova igra', {
            fontSize: '17px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerdown', () => this.scene.start('EscapeScene'));
    }
}
