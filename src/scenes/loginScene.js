import Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.mode = 'login'; // 'login' | 'register'
    }

    create() {
        const { width, height } = this.scale;

        // --- 1️⃣ Ozadje laboratorija (enako kot v LabScene) ---
        // svetla stena
        this.add.rectangle(0, 0, width, height - 150, 0xe8e8e8).setOrigin(0);
        // tla
        this.add.rectangle(0, height - 150, width, 150, 0xd4c4a8).setOrigin(0);

        const panelWidth = 500;
        const panelHeight = 340;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2 - 30;

        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.92);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        panel.lineStyle(3, 0xcccccc, 1);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);

        this.titleText = this.add.text(width / 2, panelY + 40, 'PRIJAVA', {
            fontSize: '34px',
            fontStyle: 'bold',
            color: '#222'
        }).setOrigin(0.5);

        // input polji
        const inputWidth = 350;
        const inputHeight = 45;

        this.usernameInput = document.createElement('input');
        this.usernameInput.placeholder = 'Uporabniško ime';

        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.placeholder = 'Geslo';

        this.firstNameInput = document.createElement('input');
        this.firstNameInput.placeholder = 'Ime';

        this.lastNameInput = document.createElement('input');
        this.lastNameInput.placeholder = 'Priimek';

        [this.usernameInput, this.passwordInput, this.firstNameInput, this.lastNameInput].forEach((el, i) => {
            el.style.position = 'absolute';
            el.style.width = `${inputWidth}px`;
            el.style.height = `${inputHeight}px`;
            el.style.left = `${width / 2 - inputWidth / 2}px`;
            el.style.top = `${panelY + 110 + i * 60}px`;
            el.style.borderRadius = '8px';
            el.style.border = '1px solid #ccc';
            el.style.textAlign = 'center';
            el.style.fontSize = '18px';
            el.style.outline = 'none';
            el.style.backgroundColor = '#f9f9f9';
        });

        document.body.appendChild(this.usernameInput);
        document.body.appendChild(this.passwordInput);

        const btnY = panelY + 270;
        this.actionBtnBg = this.add.graphics();
        this.drawActionButton(0x3399ff, width / 2, btnY);

        this.actionBtnText = this.add.text(width / 2, btnY, '▶ Prijavi se', {
            fontSize: '24px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.submit());

        this.toggleText = this.add.text(width / 2, btnY + 55,
            'Nimaš računa? Registracija',
            { fontSize: '16px', color: '#0066ff' }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.toggleMode());

        this.add.text(40, 30, '↩ Nazaj v meni', {
            fontSize: '20px',
            color: '#0066ff'
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.cleanup();
                this.scene.start('MenuScene');
            });

        this.events.once('shutdown', () => this.cleanup());
    }

    async submit() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            alert('Vnesi uporabniško ime in geslo!');
            return;
        }

        try {
            if (this.mode === 'login') {
                const res = await window.api.loginPlayer({ username, password });

                if (!res.success) {
                    alert('Napačno uporabniško ime ali geslo.');
                    return;
                }

                this.finishLogin(res.data);
            } else {
                const firstName = this.firstNameInput.value.trim();
                const lastName = this.lastNameInput.value.trim();

                if (!firstName || !lastName) {
                    alert('Vnesi ime in priimek!');
                    return;
                }

                const avatarIndex = Math.floor(Math.random() * 14) + 1;

                const res = await window.api.registerPlayer({
                    username,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    profilePic: `avatar${avatarIndex}`
                });

                if (!res.success) {
                    alert(res.error || 'Registracija ni uspela');
                    return;
                }

                this.finishLogin(res.data);
            }
        } catch (e) {
            console.error(e);
            alert('Napaka pri komunikaciji s strežnikom.');
        }
    }

    finishLogin(user) {
        this.cleanup();
        this.scene.start('LabScene');
    }

    toggleMode() {
        this.mode = this.mode === 'login' ? 'register' : 'login';

        this.titleText.setText(
            this.mode === 'login' ? 'PRIJAVA' : 'REGISTRACIJA'
        );

        this.actionBtnText.setText(
            this.mode === 'login' ? '▶ Prijavi se' : '✔ Registriraj se'
        );

        this.toggleText.setText(
            this.mode === 'login'
                ? 'Nimaš računa? Registracija'
                : 'Že imaš račun? Prijava'
        );

        if (this.mode === 'register') {
            document.body.appendChild(this.firstNameInput);
            document.body.appendChild(this.lastNameInput);
        } else {
            this.firstNameInput.remove();
            this.lastNameInput.remove();
        }
    }

    drawActionButton(color, x, y) {
        this.actionBtnBg.clear();
        this.actionBtnBg.fillStyle(color, 1);
        this.actionBtnBg.fillRoundedRect(x - 90, y - 22, 180, 45, 10);
    }

    cleanup() {
        this.usernameInput?.remove();
        this.passwordInput?.remove();
        this.firstNameInput?.remove();
        this.lastNameInput?.remove();
    }
}
