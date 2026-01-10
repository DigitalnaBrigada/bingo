import Phaser from 'phaser';

export default class BingoSettingsScene extends Phaser.Scene {
    constructor() {
        super('BingoSettingsScene');

        this.players = [];
        this.selectedGrade = null;
        this.selectedCategories = [];
        this.startButton = null;
    }

    async create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0xf9fafb).setOrigin(0);

        // Title
        this.add.text(width / 2, 60, 'Bingo kviz 🎯', {
            fontSize: '42px',
            color: '#111827',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(
            width / 2,
            110,
            'Pripravi igro in začni kvingo!',
            { fontSize: '18px', color: '#6b7280' }
        ).setOrigin(0.5);

        await this.createCategorySelection();
        this.createPlayersSection();
        this.createStartButton();
        this.createBackButton();
    }

    /* ------------------ CATEGORY SELECTION ------------------ */

    async createCategorySelection() {
        const { width } = this.scale;
        const categories = (await window.api.loadMenu()).categories;

        this.add.text(width / 2, 320, 'Izberi predmet (vsaj 1)', {
            fontSize: '20px',
            color: '#111827',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let x = width / 2 - 220;
        let y = 380;

        categories.forEach((cat, index) => {
            const card = this.add.rectangle(x, y, 260, 70, 0xffffff)
                .setStrokeStyle(2, 0xd1d5db)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, y, cat.name, {
                fontSize: '16px',
                color: '#111827'
            }).setOrigin(0.5);

            card.on('pointerdown', () => {
                const idx = this.selectedCategories.indexOf(cat.id);

                if (idx >= 0) {
                    this.selectedCategories.splice(idx, 1);
                    card.setStrokeStyle(2, 0xd1d5db);
                } else {
                    this.selectedCategories.push(cat.id);
                    card.setStrokeStyle(3, 0x22c55e);
                }

                this.updateStartButton();
            });

            x += 300;
            if (index % 2 === 1) {
                x = width / 2 - 220;
                y += 90;
            }
        });
    }

    /* ------------------ PLAYERS ------------------ */

    createPlayersSection() {
        const { width } = this.scale;

        this.playersText = this.add.text(
            width / 2 - 300,
            520,
            'Igralci:\n(noben)',
            { fontSize: '16px', color: '#374151' }
        );

        window.api.onPlayerAdded(player => {
            if (this.players.length >= 4) return;

            this.players.push(player);

            this.playersText.setText(
                'Igralci:\n' +
                this.players.map(p => `${p.first_name} ${p.last_name}`).join('\n')
            );

            this.updateStartButton();
        });

        const btn = this.add.rectangle(width / 2 - 300, 650, 220, 50, 0x2563eb)
            .setInteractive({ useHandCursor: true });

        this.add.text(width / 2 - 300, 650, 'Dodaj igralca', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            window.api.openAddPlayerWindow();
        });
    }

    /* ------------------ START GAME ------------------ */

    createStartButton() {
        const { width } = this.scale;

        this.startButton = this.add.rectangle(width / 2 + 250, 650, 260, 60, 0x9ca3af)
            .setInteractive({ useHandCursor: true });

        this.startText = this.add.text(width / 2 + 250, 650, 'Začni igro ▶️', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.startButton.on('pointerdown', () => {
            if (!this.canStart()) return;

            localStorage.setItem(
                'parameters',
                JSON.stringify({
                    grade: this.selectedGrade,
                    category: this.selectedCategories,
                    players: this.players
                })
            );

            this.scene.start('LabScene');
        });
    }

    updateStartButton() {
        if (this.canStart()) {
            this.startButton.setFillStyle(0x16a34a);
        } else {
            this.startButton.setFillStyle(0x9ca3af);
        }
    }

    canStart() {
        return (
            this.selectedGrade !== null &&
            this.selectedCategories.length > 0 &&
            this.players.length > 0
        );
    }

    /* ------------------ BACK BUTTON ------------------ */

    createBackButton() {
        const btn = this.add.text(40, 30, '← Nazaj', {
            fontSize: '18px',
            color: '#2563eb'
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('LabScene');
            });
    }
}
