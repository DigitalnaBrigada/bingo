import Phaser from 'phaser';

export default class LabScene extends Phaser.Scene {
    modalElement;

    constructor() {
        super('LabScene');
    }

    preload() {
        this.load.image('avatar1', 'src/avatars/avatar1.png');
        this.load.image('avatar2', 'src/avatars/avatar2.png');
        this.load.image('avatar3', 'src/avatars/avatar3.png');
        this.load.image('avatar4', 'src/avatars/avatar4.png');
        this.load.image('avatar5', 'src/avatars/avatar5.png');
        this.load.image('avatar6', 'src/avatars/avatar6.png');
        this.load.image('avatar7', 'src/avatars/avatar7.png');
        this.load.image('avatar8', 'src/avatars/avatar8.png');
        this.load.image('avatar9', 'src/avatars/avatar9.png');
        this.load.image('avatar10', 'src/avatars/avatar10.png');
        this.load.image('avatar11', 'src/avatars/avatar11.png');
        this.load.image('potion', 'src/assets/potion.png');
        this.load.image('telescope', 'src/assets/telescope.png');
    }

    create() {
        const {width, height} = this.cameras.main;

        // ozadje laboratorija
        this.add.rectangle(0, 0, width, height, 0xf0f0f0).setOrigin(0);

        // stena
        this.add.rectangle(0, 0, width, height - 150, 0xe8e8e8).setOrigin(0);

        // tla
        this.add.rectangle(0, height - 150, width, 150, 0xd4c4a8).setOrigin(0);

        // miza
        const tableX = width / 2;
        const tableY = height / 2 + 50;
        const tableWidth = 500;
        const tableHeight = 250;

        // miza (del, ki se klikne)
        const tableTop = this.add.rectangle(tableX, tableY, tableWidth, 30, 0x8b4513).setOrigin(0.5);

        // delovna površina mize
        const tableSurface = this.add.rectangle(tableX, tableY + 15, tableWidth - 30, tableHeight - 30, 0xa0826d).setOrigin(0.5, 0);

        //teleskop
        const telescope = this.add.image(width - 140, height - 250, 'telescope')
            .setScale(0.35)
            .setInteractive({useHandCursor: true});

        telescope.on('pointerdown', () => {
            if (this.modalElement && this.modalElement.style.display === 'flex') {
                return;
            }
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('PhysicsSelectionScene');
            });
        });

        // mreža

        // monitor
        const monitorX = tableX - 100;
        const monitorY = tableY - 100;
        const monitor = this.add.container(monitorX, monitorY);

        // rob
        const monitorBody = this.add.rectangle(0, -8, 260, 150, 0x0c0c0c)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x333333);

        // zaslon
        const screen = this.add.rectangle(0, -6, 230, 120, 0x001f18).setOrigin(0.5);

        // glitchy tekst
        const screenText = this.add.text(-100, -28, 'Error executing code!\n> _', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#00ff88',
            lineSpacing: 8
        }).setOrigin(0, 0);
        const messages = [
            'Error executing code!',
            'Err0r ex3cut1ng cod€!',
            'Errr0!r eX3cut1ng c0d€',
            'Err░rr█▓▒Жeut1ng c☢d¢',
            '☢ ☣ ⚠ ☢ ☣ ⚠ ☢ ☣ ⚠'
        ];
        let msgIndex = 0;
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                msgIndex = (msgIndex + 1) % messages.length;
                const text = messages[msgIndex];
                screenText._base = text + '\n> _';
                screenText._current = screenText._base;
                screenText.setText(screenText._current + (screenText._cursorVisible ? '|' : ' '));
            }
        });

        if (localStorage.getItem('lightOn') !== 'true') {
            const darkBg = this.add.rectangle(0, 0, width, height, 0x000000, 0.95).setOrigin(0).setDepth(1000);
            const dialog = this.add.container(750, 350).setDepth(1001);
            const bg = this.add.rectangle(0, 0, 800, 600, 0xFFFFFF, 0.9).setOrigin(0.5);
            bg.setStrokeStyle(2, 0x666666);
            const dialogText = this.add.text(-370, -250,
                "Ste raziskovalec v ameriški (ne preveč uspešni) tajni bazi Območje 51," +
                " ki so jo pravkar napadli nezemljani z oddaljenega planeta Rupsodia v galaksiji FERI-324." +
                "\n\nVaša naloga je premagati različne izzive in rešiti uganke vseh 4 predmetov " +
                "(matematika, računalništvo, fizika in kemija), da bi dobili dostop do izhoda iz Območja 51. " +
                "Na srečo imate dostop do naprednih tehnologij in orodij, ki vam bodo pomagala na vaši poti," +
                " vendar se morate najprej osredotočiti na nalogo, ki je pred vami!\n\n" +
                "Med napadom so nezemljani onemogočili glavno in rezervno elektriko, vaša naloga je najprej priključiti" +
                " električni tokokrog, da obnovite luč v svoji pisarni.\nSrečno!",
                {
                    fontFamily: 'Monospace',
                    fontSize: '22px',
                    color: '#0000A6',
                    wordWrap: {width: 750}
                }
            );

            // gumb za zapret
            const closeBtn = this.add.text(0, 200, 'Ok let\'s go!', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {x: 30, y: 16}
            }).setOrigin(0.5).setInteractive({useHandCursor: true});
            closeBtn.on('pointerdown', () => {
                dialog.destroy();
                this.screenDialog = null;
                this.scene.start('WorkspaceScene');
            });

            dialog.add([bg, dialogText, closeBtn]);
            this.screenDialog = dialog;
        }

        // stojalo
        const stand = this.add.rectangle(0, 74, 24, 34, 0x222222).setOrigin(0.5);
        const base = this.add.rectangle(0, 92, 110, 12, 0x1b1b1b).setOrigin(0.5);

        // skupaj
        monitor.add([monitorBody, screen, screenText, stand, base]);
        monitor.setDepth(20);

        // interaktivni zaslon
        screen.setInteractive({useHandCursor: true});
        screen.on('pointerdown', () => {
            if (this.modalElement && this.modalElement.style.display === 'flex') {
                return;
            }
            this.scene.start('DesktopScene');
        });

        // mreža
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x8b7355, 0.3);
        const gridSize = 30;
        const gridStartX = tableX - (tableWidth - 30) / 2;
        const gridStartY = tableY + 15;
        const gridEndX = tableX + (tableWidth - 30) / 2;
        const gridEndY = tableY + 15 + (tableHeight - 30);

        for (let x = gridStartX; x <= gridEndX; x += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x, gridStartY);
            gridGraphics.lineTo(x, gridEndY);
            gridGraphics.strokePath();
        }
        for (let y = gridStartY; y <= gridEndY; y += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(gridStartX, y);
            gridGraphics.lineTo(gridEndX, y);
            gridGraphics.strokePath();
        }

        // nogice mize
        const legWidth = 20;
        const legHeight = 150;
        this.add.rectangle(tableX - tableWidth / 2 + 40, tableY + tableHeight / 2 + 20, legWidth, legHeight, 0x654321);
        this.add.rectangle(tableX + tableWidth / 2 - 40, tableY + tableHeight / 2 + 20, legWidth, legHeight, 0x654321);

        // interaktivnost mize
        const interactiveZone = this.add.zone(tableX, tableY + tableHeight / 2, tableWidth, tableHeight)
            .setInteractive({useHandCursor: true});

        const instruction = this.add.text(tableX, tableY - 240, 'Press around to start the game!', {
            fontSize: '24px',
            color: '#333',
            fontStyle: 'bold',
            backgroundColor: '#ffffff',
            padding: {x: 20, y: 10}
        }).setOrigin(0.5);

        // animacija besedila
        this.tweens.add({
            targets: instruction,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        interactiveZone.on('pointerdown', () => {
            // samo miza je, pomiri se
        });

        interactiveZone.on('pointerover', () => {
            tableSurface.setFillStyle(0xb09070);
        });

        interactiveZone.on('pointerout', () => {
            tableSurface.setFillStyle(0xa0826d);
        });

        interactiveZone.on('pointerout', () => {
            tableSurface.setFillStyle(0xa0826d);
        });

        const username = localStorage.getItem('username');
        const pfp = localStorage.getItem('profilePic');

        // avvatar
        const avatarX = 230;
        const avatarY = 55;
        const avatarRadius = 30;
        const borderThickness = 4;

        // zunanji siv krog (rob)
        const borderCircle = this.add.circle(avatarX, avatarY, avatarRadius + borderThickness, 0xcccccc);

        // notranji bel krog (ozadje za avatar)
        const innerCircle = this.add.circle(avatarX, avatarY, avatarRadius, 0xffffff);

        // slika avatarja
        const avatarImage = this.add.image(avatarX, avatarY, pfp)
            .setDisplaySize(avatarRadius * 2, avatarRadius * 2);

        // maska, da je slika samo znotraj notranjega kroga
        const mask = innerCircle.createGeometryMask();
        avatarImage.setMask(mask);

        // pozdravno besedilo
        this.add.text(avatarX + 60, avatarY - 10, `Dobrodošel v laboratoriju, uporabnik ${username}!`, {
            fontSize: '22px',
            color: '#222',
            fontStyle: 'bold'
        });


        const logoutButton = this.add.text(40, 30, '↩ Odjavi se', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#0066ff',
            padding: {x: 20, y: 10}
        })
            .setOrigin(0, 0)
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => logoutButton.setStyle({color: '#0044cc'}))
            .on('pointerout', () => logoutButton.setStyle({color: '#0066ff'}))
            .on('pointerdown', () => {
                if (this.modalElement && this.modalElement.style.display === 'flex') {
                    return;
                }
                localStorage.removeItem('username');
                this.scene.start('MenuScene');
            });

        const buttonWidth = 180;
        const buttonHeight = 45;
        const cornerRadius = 10;
        const rightMargin = 60;
        const topMargin = 40;

        // za scoreboard
        const scoreButtonBg = this.add.graphics();
        scoreButtonBg.fillStyle(0x3399ff, 1);
        scoreButtonBg.fillRoundedRect(width - buttonWidth - rightMargin, topMargin, buttonWidth, buttonHeight, cornerRadius);

        const scoreButton = this.add.text(width - buttonWidth / 2 - rightMargin, topMargin + buttonHeight / 2, 'Lestvica', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => {
                scoreButtonBg.clear();
                scoreButtonBg.fillStyle(0x0f5cad, 1);
                scoreButtonBg.fillRoundedRect(width - buttonWidth - rightMargin, topMargin, buttonWidth, buttonHeight, cornerRadius);
            })
            .on('pointerout', () => {
                scoreButtonBg.clear();
                scoreButtonBg.fillStyle(0x3399ff, 1);
                scoreButtonBg.fillRoundedRect(width - buttonWidth - rightMargin, topMargin, buttonWidth, buttonHeight, cornerRadius);
            })
            .on('pointerdown', () => {
                if (this.modalElement && this.modalElement.style.display === 'flex') {
                    return;
                }
                this.scene.start('ScoreboardScene', {cameFromMenu: true});
            });

        // Odstranjeni gumbi Naloga 1 in Naloga 5

        // Dodaj napoj na mizo – center mize, tik nad delovno površino
        const potion = this.add.image(tableX + 200, tableY - 30, 'potion')
            .setOrigin(0.5)
            .setScale(0.35)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                if (this.modalElement && this.modalElement.style.display === 'flex') {
                    return;
                }
                this.scene.start('ChemistryScene1');
            });
        // senca pod napojem za občutek globine
        const shadow = this.add.ellipse(tableX, tableY + 70, 140, 26, 0x000000, 0.12);
        shadow.setDepth(potion.depth - 1);
        // hover efekt
        potion.on('pointerover', () => {
            this.tweens.add({targets: [potion, shadow], scale: 0.38, duration: 180});
        });
        potion.on('pointerout', () => {
            this.tweens.add({targets: [potion, shadow], scale: 0.35, duration: 180});
        });

        // this.input.keyboard.on('keydown-ESC', () => {
        //     this.scene.start('MenuScene');
        // });

        //console.log(`${localStorage.getItem('username')}`);
        console.log(JSON.parse(localStorage.getItem('users')));
        this.createAbacus(this.scale.width, this.scale.height);
        this.createDoor(this.scale.width, this.scale.height);

        if (!this.modalElement) {
            this.createModal();
        }
    }

    createAbacus(width, height) {
        const abacusX = width * 0.75;
        const abacusY = height * 0.91;
        const abacusWidth = width * 0.125;
        const abacusHeight = height * 0.15;
        const frameThickness = width * 0.003;

        const rainbowColors = [
            0xff0000, 0xff7f00, 0xffff00, 0x00ff00,
            0x0000ff, 0x4b0082, 0x9400d3
        ];

        const numRows = 7;
        const beadsPerRow = 10;
        const beadRadius = width * 0.003;
        const beadDiameter = beadRadius * 2;
        const rowSpacing = abacusHeight * 0.85 / (numRows - 0.5);

        const abacusContainer = this.add.container(abacusX, abacusY);

        for (let row = 0; row < numRows; row++) {
            const rodY = -abacusHeight * 0.4 + row * rowSpacing; // relative to container
            const rod = this.add.rectangle(0, rodY, abacusWidth, frameThickness, 0x696969);
            abacusContainer.add(rod);
        }

        for (let row = 0; row < numRows; row++) {
            const rodY = -abacusHeight * 0.4 + row * rowSpacing;
            const availableWidth = abacusWidth * 0.9;
            const startX = -availableWidth / 2;

            let currentX = startX;
            for (let i = 0; i < beadsPerRow; i++) {
                const randomSpacing = beadDiameter * (1.2 + Math.random());
                currentX += randomSpacing;

                if (currentX + beadRadius > startX + availableWidth) break;

                const bead = this.add.circle(currentX, rodY, beadRadius, rainbowColors[row]);
                bead.setStrokeStyle(width * 0.0008, 0x333333);
                abacusContainer.add(bead);
            }
        }

        const topBar = this.add.rectangle(0, -abacusHeight / 2, abacusWidth, frameThickness * 2, 0x8b4513);
        const bottomBar = this.add.rectangle(0, abacusHeight / 2, abacusWidth, frameThickness * 2, 0x8b4513);
        const leftBar = this.add.rectangle(-abacusWidth / 2, 0, frameThickness * 2, abacusHeight, 0x8b4513);
        const rightBar = this.add.rectangle(abacusWidth / 2, 0, frameThickness * 2, abacusHeight, 0x8b4513);

        abacusContainer.add([topBar, bottomBar, leftBar, rightBar]);

        const zone = this.add.zone(0, 0, abacusWidth + frameThickness * 4, abacusHeight + frameThickness * 4)
            .setOrigin(0.5)
            .setInteractive({useHandCursor: true});

        abacusContainer.add(zone);

        zone.on('pointerdown', () => {
            if (this.modalElement && this.modalElement.style.display === 'flex') {
                return;
            }
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('ClassroomScene');
            });
        });

        abacusContainer.setAngle(5);
    }

    createDoor(width, height) {
        const doorX = width * 0.1;
        const doorY = height * 0.6;
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

    createKeypad(x, y, width, height) {
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
            if (this.modalElement && this.modalElement.style.display === 'flex') {
                return;
            }
            this.showModal();
        });

        this.keypadButton.on('pointerover', () => {
            this.keypadButton?.setFillStyle(0x455a64);
        });

        this.keypadButton.on('pointerout', () => {
            this.keypadButton?.setFillStyle(0x37474f);
        });
    }

    createModal() {
        this.modalElement = document.createElement('div');
        this.modalElement.style.position = 'fixed';
        this.modalElement.style.inset = '0';
        this.modalElement.style.zIndex = '50';
        this.modalElement.style.display = 'none';

        this.modalElement.style.alignItems = 'center';
        this.modalElement.style.justifyContent = 'flex-start';

        this.modalElement.innerHTML = `
      <div class="modal-backdrop" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);"></div>

      <div class="modal-content" 
        style="
          position: relative; 
          background: #111827; 
          border-radius: 1rem; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); 
          width: 600px; 
          border: 4px solid #374151;
          margin-left: 20%;
        ">
        
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #374151;">
          <h2 style="font-size: 1.5rem; color: white; margin: 0;">Vnesi Pin</h2>
          <button id="close-modal" style="color: #9ca3af; background: none; border: none; cursor: pointer; font-size: 1.5rem;">×</button>
        </div>

        <div style="padding: 1.5rem;">

          <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
              ${Array(8).fill(0).map(() => `
                <div class="emoji-slot" 
                     style="width: 48px; height: 48px; display:flex; align-items:center; justify-content:center; 
                     font-size: 2rem; color:white;">
                </div>
              `).join('')}
          </div>

          <div style="background: #1f2937; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            
            <div id="pincode-display" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
              ${Array(8).fill(0).map((_, i) => `
                <div class="pin-dot" data-index="${i}" 
                     style="width: 48px; height: 48px; border-radius: 0.5rem; border: 2px solid #4b5563; 
                     background: #374151; display: flex; align-items: center; justify-content: center; 
                     font-size: 1.5rem; color: #6b7280;">
                </div>
              `).join('')}
            </div>

            <div id="message" style="text-align: center; margin-top: 0.5rem; display: none;"></div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
              <button class="num-btn" data-num="${num}" 
                style="background: #374151; color: white; font-size: 1.5rem; padding: 1rem; 
                border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">
                ${num}
              </button>
            `).join('')}
            
            <button id="clear-btn" 
              style="background: #dc2626; color: white; padding: 1rem; border-radius: 0.5rem; 
              border: none; cursor: pointer; transition: background 0.2s;">
              Počisti
            </button>

            <button class="num-btn" data-num="0" 
              style="background: #374151; color: white; font-size: 1.5rem; padding: 1rem; 
              border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">
              0
            </button>

            <button id="backspace-btn" 
              style="background: #ca8a04; color: white; padding: 1rem; border-radius: 0.5rem; 
              border: none; cursor: pointer; transition: background 0.2s;">
              ←
            </button>
          </div>

          <button id="submit-btn" 
            style="width: 100%; background: #16a34a; color: white; padding: 1rem; 
            border-radius: 0.5rem; border: none; cursor: pointer; transition: background 0.2s;">
            Pošlji
          </button>

        </div>
      </div>
    `;

        document.body.appendChild(this.modalElement);

        const emojis = ["∑", "∑", "🌍", "🌍", "🧪", "🧪", "💻", "💻"];
        document.querySelectorAll('.emoji-slot').forEach((slot, i) => {
            slot.textContent = emojis[i];
        });

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
                if (num && this.pincode.length < 8) {
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
                    btn.style.background = '#4b5563';
                } else if (btn.id === 'clear-btn') {
                    btn.style.background = '#b91c1c';
                } else if (btn.id === 'backspace-btn') {
                    btn.style.background = '#a16207';
                } else if (btn.id === 'submit-btn') {
                    btn.style.background = '#15803d';
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (btn.classList.contains('num-btn')) {
                    btn.style.background = '#374151';
                } else if (btn.id === 'clear-btn') {
                    btn.style.background = '#dc2626';
                } else if (btn.id === 'backspace-btn') {
                    btn.style.background = '#ca8a04';
                } else if (btn.id === 'submit-btn') {
                    btn.style.background = '#16a34a';
                }
            });
        });
    }

    showModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'flex';
            this.pincode = '';
            this.updatePincodeDisplay();
            this.hideMessage();
        }
    }

    hideModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
        }
    }

    updatePincodeDisplay() {
        const dots = this.modalElement?.querySelectorAll('.pin-dot');
        dots?.forEach((dot, index) => {
            if (index < this.pincode.length) {
                (dot).style.background = '#3b82f6';
                (dot).style.borderColor = '#60a5fa';
                (dot).style.color = '#ffffff';
                (dot).textContent = '•';
            } else {
                (dot).style.background = '#374151';
                (dot).style.borderColor = '#4b5563';
                (dot).style.color = '#6b7280';
                (dot).textContent = '';
            }
        });
    }

    handleSubmit() {
        this.hideModal();
        this.scene.start('BingoScene');
        return;

        if (this.pincode.length === 0) return;
        if (this.pincode === '27421816') {
            this.hideModal();
            this.scene.start('BingoScene');
        } else {
            this.showMessage('Incorrect Password', '#ef4444');
            setTimeout(() => {
                this.hideMessage();
            }, 2000);
        }
    }

    showMessage(text, color) {
        const messageEl = this.modalElement?.querySelector('#message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.style.color = color;
            messageEl.style.display = 'block';
        }
    }

    hideMessage() {
        const messageEl = this.modalElement?.querySelector('#message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

}
