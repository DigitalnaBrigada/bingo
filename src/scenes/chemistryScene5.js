import Phaser from 'phaser';

export default class ChemistryScene5 extends Phaser.Scene {
    constructor() {
        super('ChemistryScene5');
    }

    init(data) {
        this.remainingSeconds = Number.isFinite(data?.remainingSeconds) ? data.remainingSeconds : 300;
    }

    preload() { }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0xf4f6fa).setOrigin(0);

        // Timer top-left
        const timerText = this.add.text(30, 30, formatTime(this.remainingSeconds), {
            fontFamily: 'Arial', fontSize: '22px', color: '#111', fontStyle: 'bold'
        }).setOrigin(0, 0);
        const timeoutDialog = () => {
            // Disable choices and show failure dialog
            const panelW2 = Math.min(680, width - 160);
            const panelH2 = 180;
            const panelX2 = width / 2 - panelW2 / 2;
            const panelY2 = height / 2 - panelH2 / 2;
            // Hide active UI to avoid distraction
            screen.setVisible(false); screenText.setVisible(false); wall.setVisible(false);
            [btnHcl5, btnHcl10, btnHcl37, btnNaOH].forEach(b => b && b.zone && b.zone.disableInteractive());
            const dlg = this.add.graphics();
            dlg.fillStyle(0xffffff, 0.96);
            dlg.fillRoundedRect(panelX2, panelY2, panelW2, panelH2, 18);
            dlg.lineStyle(2, 0xcccccc, 1);
            dlg.strokeRoundedRect(panelX2, panelY2, panelW2, panelH2, 18);
            const msg = 'Naloge ti žal ni uspelo opraviti v pravem času, poskusi ponovno.';
            const txt = this.add.text(panelX2 + 16, panelY2 + 16, msg, { fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW2 - 32 } });
            const btnW2 = 220, btnH2 = 40;
            const btnX2 = panelX2 + panelW2 / 2 - btnW2 / 2;
            const btnY2 = panelY2 + panelH2 - btnH2 - 16;
            const btnBg2 = this.add.graphics();
            btnBg2.fillStyle(0x3b82f6, 1);
            btnBg2.fillRoundedRect(btnX2, btnY2, btnW2, btnH2, 10);
            const btnTxt2 = this.add.text(btnX2 + btnW2 / 2, btnY2 + btnH2 / 2, 'Vrni se na začetek', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
            const btnZone2 = this.add.zone(btnX2, btnY2, btnW2, btnH2).setOrigin(0).setInteractive({ useHandCursor: true });
            btnZone2.on('pointerover', () => { btnBg2.clear(); btnBg2.fillStyle(0x2563eb, 1); btnBg2.fillRoundedRect(btnX2, btnY2, btnW2, btnH2, 10); });
            btnZone2.on('pointerout', () => { btnBg2.clear(); btnBg2.fillStyle(0x3b82f6, 1); btnBg2.fillRoundedRect(btnX2, btnY2, btnW2, btnH2, 10); });
            btnZone2.on('pointerdown', () => {
                dlg.destroy(); txt.destroy(); btnBg2.destroy(); btnTxt2.destroy(); btnZone2.destroy();
                this.scene.start('MenuScene');
            });
        };

        this.time.addEvent({
            delay: 1000, loop: true, callback: () => {
                if (this.remainingSeconds > 0) {
                    this.remainingSeconds -= 1;
                    timerText.setText(formatTime(this.remainingSeconds));
                    if (this.remainingSeconds <= 0) {
                        timerText.setText(formatTime(0));
                        timeoutDialog();
                    }
                }
            }
        });

        // Intro panel
        const panelW = Math.min(860, width - 160);
        const panelH = 280;
        const panelX = width / 2 - panelW / 2;
        const panelY = height / 2 - panelH / 2;
        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.96);
        panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
        panel.lineStyle(2, 0xcccccc, 1);
        panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);

        const intro = [
            'Na steni laboratorija opaziš sledove reakcije. Uspelo ti je nevtralizirati kislino, a da se prebiješ naprej, moraš izbrati pravo tekočino, ki raztopi zaščitno plast.',
            'Če izbereš ustrezno kemikalijo (npr. razredčeno HCl), se bo stena raztopila in odprla izhod. Napačne izbire povzročijo le šibko reakcijo brez učinka.'
        ].join('\n\n');

        const introText = this.add.text(panelX + 16, panelY + 16, intro, {
            fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW - 32 }
        });

        const nextW = 180, nextH = 40;
        const nextX = width / 2 - nextW / 2;
        const nextY = panelY + panelH - nextH - 16;
        const nextRect = this.add.rectangle(nextX + nextW / 2, nextY + nextH / 2, nextW, nextH, 0x3399ff)
            .setInteractive({ useHandCursor: true });
        const nextLbl = this.add.text(nextX + nextW / 2, nextY + nextH / 2, 'Začni poskus ▶', { fontFamily: 'Arial', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
        nextRect.on('pointerover', () => nextRect.setFillStyle(0x2563eb));
        nextRect.on('pointerout', () => nextRect.setFillStyle(0x3399ff));

        // Screen and wall area
        const screenW = Math.min(820, width - 160);
        const screenH = 230;
        const screenX = width / 2 - screenW / 2;
        const screenY = 120;
        const screen = this.add.graphics();
        screen.fillStyle(0x1f2937, 0.96);
        screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
        screen.lineStyle(2, 0x0f172a, 1);
        screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
        screen.setVisible(false);

        const qText = 'Da raztopiš varnostno steno iz CaCO₃, moraš uporabiti HCl. Katero koncentracijo in način dodajanja izbereš, da reakcija poteka varno (zmerno sproščanje CO₂) in hkrati dovolj hitro, da odpreš prehod?';
        const screenText = this.add.text(screenX + 16, screenY + 16, qText, {
            fontFamily: 'Arial', fontSize: '18px', color: '#e5e7eb', wordWrap: { width: screenW - 32 }
        }).setVisible(false);

        // Generate three wall textures (A: normal, B: reacting, C: dissolved)
        const wallKeyA = 'wall_A';
        const wallKeyB = 'wall_B';
        const wallKeyC = 'wall_C';
        const wallW = Math.min(520, screenW - 80);
        const wallH = 140;
        const wallX = width / 2;
        const wallY = screenY + screenH + 100; // wall is below the screen

        generateWallTextures(this, wallKeyA, wallKeyB, wallKeyC, wallW, wallH);

        // Wall sprite
        const wall = this.add.image(wallX, wallY, wallKeyA);
        wall.setVisible(false);

        // Bubble particle texture and emitter
        const pg = this.add.graphics();
        pg.fillStyle(0xffffff, 1);
        pg.fillCircle(5, 5, 5);
        pg.generateTexture('bubble', 10, 10);
        pg.destroy();

        const bubbleEmitter = this.add.particles(wallX, wallY - wallH / 4, 'bubble', {
            angle: { min: 260, max: 280 },
            speed: { min: 12, max: 40 },
            scale: { start: 0.35, end: 0.05 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1800,
            gravityY: -10,
            frequency: 120,
            emitting: false
        });

        // Liquid drop texture for pouring effect
        const lg = this.add.graphics();
        lg.fillStyle(0xffffff, 1);
        lg.fillCircle(3, 3, 3);
        lg.generateTexture('drop', 6, 6);
        lg.destroy();

        // Siren overlay for warnings
        const alarmOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xcc0000, 0).setDepth(1000);

        // Choice buttons
        const btnYBase = wallY + wallH / 2 + 40;
        const makeButton = (label, x, cb) => {
            const bw = 220, bh = 44;
            const bg = this.add.graphics();
            bg.fillStyle(0x3b82f6, 1);
            bg.fillRoundedRect(x - bw / 2, btnYBase, bw, bh, 10);
            const t = this.add.text(x, btnYBase + bh / 2, label, { fontFamily: 'Arial', fontSize: '16px', color: '#fff', align: 'center' }).setOrigin(0.5);
            const zone = this.add.zone(x - bw / 2, btnYBase, bw, bh).setOrigin(0).setInteractive({ useHandCursor: true });
            zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x2563eb, 1); bg.fillRoundedRect(x - bw / 2, btnYBase, bw, bh, 10); });
            zone.on('pointerout', () => { bg.clear(); bg.fillStyle(0x3b82f6, 1); bg.fillRoundedRect(x - bw / 2, btnYBase, bw, bh, 10); });
            zone.on('pointerdown', cb);
            return { bg, t, zone };
        };

        let btnHcl5, btnHcl10, btnHcl37, btnNaOH;
        let beakerHcl5, beakerHcl10, beakerHcl37, beakerNaOH;

        const beakerW = 40, beakerH = 46;
        const makeBeaker = (x, label, color) => {
            const key = `beaker_${color.toString(16)}`;
            if (!this.textures.exists(key)) {
                const g = this.add.graphics();
                g.lineStyle(2, 0x0f172a, 1);
                g.fillStyle(0xeeeeee, 1);
                // simple beaker shape
                g.fillRoundedRect(0, 0, beakerW, beakerH, 6);
                g.strokeRoundedRect(0, 0, beakerW, beakerH, 6);
                // liquid level
                g.fillStyle(color, 0.9);
                g.fillRoundedRect(3, beakerH - 18, beakerW - 6, 15, 4);
                g.generateTexture(key, beakerW, beakerH);
                g.destroy();
            }
            const y = btnYBase - 40;
            const img = this.add.image(x, y, key).setOrigin(0.5).setAlpha(0.95);
            // No text under beakers; labels already on buttons
            return { img };
        };

        // Pour effect from a beaker position to wall (Phaser 3.60 API)
        const pourFrom = (srcX, srcY, color, duration = 900, frequency = 25, xOffset = 0, yOffset = 0, angleMin = 88, angleMax = 100) => {
            // Falling stream (offset to match tilted beaker mouth, slightly angled right)
            const stream = this.add.particles(srcX + xOffset, srcY + yOffset, 'drop', {
                angle: { min: angleMin, max: angleMax },
                speed: { min: 180, max: 260 },
                gravityY: 520,
                lifespan: 900,
                scale: { start: 0.9, end: 0.3 },
                tint: color,
                frequency,
                quantity: 1
            });
            // Splash emitter at impact line, repositions slightly over time
            const impactY = wallY - wallH / 2 + 6;
            const splashX = wallX + xOffset;
            const splash = this.add.particles(splashX, impactY, 'drop', {
                speed: { min: 40, max: 90 },
                angle: { min: 250, max: 290 },
                gravityY: 300,
                lifespan: 450,
                scale: { start: 0.6, end: 0.1 },
                tint: color,
                quantity: 4,
                frequency: 180
            });
            const splashJitter = this.time.addEvent({
                delay: 180, loop: true, callback: () => {
                    splash.setPosition(splashX + Phaser.Math.Between(-14, 14), impactY);
                }
            });
            // Stop after duration
            const stop = () => {
                stream.emitting = false;
                splash.emitting = false;
                splashJitter.remove(false);
            };
            this.time.delayedCall(duration, stop);
            return { stop };
        };

        const showUI = () => {
            panel.destroy(); introText.destroy(); nextRect.destroy(); nextLbl.destroy();
            screen.setVisible(true); screenText.setVisible(true); wall.setVisible(true);
            const x1 = width / 2 - 360;
            const x2 = width / 2 - 120;
            const x3 = width / 2 + 120;
            const x4 = width / 2 + 360;
            btnHcl5 = makeButton('5% HCl\nHitro, 60 mL', x1, () => runHcl5());
            btnHcl10 = makeButton('10% HCl\nPočasno, 30 mL', x2, () => runCorrect());
            btnHcl37 = makeButton('37% HCl\nPočasno, 10 mL', x3, () => runHcl37());
            btnNaOH = makeButton('NaOH\nKapljično, 40 mL', x4, () => runNaOH());
            // small beakers above buttons
            beakerHcl5 = makeBeaker(x1, '5% HCl', 0xfff1a6);
            beakerHcl10 = makeBeaker(x2, '10% HCl', 0xffd166);
            beakerHcl37 = makeBeaker(x3, '37% HCl', 0xff6b6b);
            beakerNaOH = makeBeaker(x4, 'NaOH', 0x4aa3ff);
        };

        nextRect.on('pointerdown', showUI);
        nextLbl.setInteractive({ useHandCursor: true }).on('pointerdown', showUI);

        // Logic handlers
        const allButtons = () => [btnHcl5, btnHcl10, btnHcl37, btnNaOH];
        const disableChoices = () => { allButtons().forEach(b => b && b.zone.disableInteractive()); };

        const runCorrect = () => {
            disableChoices();
            wall.setTexture(wallKeyA);
            bubbleEmitter.emitting = false;
            // Animate beaker: lift up, tilt right, then start pouring
            if (beakerHcl10?.img) {
                const b = beakerHcl10.img;
                // Step 1: lift
                this.tweens.add({
                    targets: b,
                    y: b.y - 95,
                    duration: 300,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        // Step 2: tilt right and slight move
                        this.tweens.add({
                            targets: b,
                            angle: 25,
                            x: b.x + 10,
                            duration: 300,
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                // start slow dripping pour
                                // Offset drops further to the right and slightly up to appear from the beaker mouth
                                // Also angle a bit to the right (min 92, max 106)
                                const pour = pourFrom(b.x, b.y + 10, 0xffd166, 1400, 65, 22, -10, 92, 106);
                                // After pour starts, trigger wall reaction and cracking
                                this.time.delayedCall(500, () => {
                                    wall.setTexture(wallKeyB);
                                    bubbleEmitter.emitting = true;
                                });
                                this.time.delayedCall(1400, () => {
                                    wall.setTexture(wallKeyC);
                                    // stop pouring once wall has dissolved/broken
                                    pour.stop();
                                    // crack effect: quick camera shake as wall breaks
                                    this.cameras.main.shake(250, 0.004);
                                    bubbleEmitter.emitting = false;
                                    // Show success dialog only after camera shake completes
                                    const showSuccessDialog = () => {
                                        const successDialog = [
                                            'Čestitke! Pravilno si izbral kemikalijo.',
                                            'Reakcija je raztopila zaščitno plast in v steni se je odprla dovolj velika luknja.',
                                            'Skozi odprtino lahko pobegneš iz kemijskega dela laboratorija.',
                                            'Tvoja števka za PIN je: 18.'
                                        ].join('\n\n');
                                        const panelW = Math.min(760, width - 160);
                                        const panelH = 260;
                                        const panelX = width / 2 - panelW / 2;
                                        const panelY = Math.min(wallY + wallH / 2 + 40, (height - panelH) / 2);
                                        // Hide UI beneath the dialog without dimming the background
                                        // Hide interactive elements while dialog is visible
                                        screen.setVisible(false);
                                        screenText.setVisible(false);
                                        wall.setVisible(false);
                                        [beakerHcl5?.img, beakerHcl10?.img, beakerHcl37?.img, beakerNaOH?.img].forEach(i => i && i.setVisible(false));
                                        [btnHcl5, btnHcl10, btnHcl37, btnNaOH].forEach(b => b && b.bg && b.t && (b.bg.setVisible(false), b.t.setVisible(false)));
                                        const dlg = this.add.graphics();
                                        dlg.fillStyle(0xffffff, 0.96);
                                        dlg.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
                                        dlg.lineStyle(2, 0xcccccc, 1);
                                        dlg.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
                                        const dlgText = this.add.text(panelX + 16, panelY + 16, successDialog, {
                                            fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW - 32 }
                                        });
                                        this.incrementScore(10);
                                        // Add a "Naprej" button inside the dialog to proceed
                                        const btnW = 160, btnH = 40;
                                        const btnX = panelX + panelW / 2 - btnW / 2;
                                        const btnY = panelY + panelH - btnH - 16;
                                        const nextBtnBg = this.add.graphics();
                                        nextBtnBg.fillStyle(0x3b82f6, 1);
                                        nextBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
                                        const nextBtnTxt = this.add.text(btnX + btnW / 2, btnY + btnH / 2, 'Naprej ▶', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                                        const nextBtnZone = this.add.zone(btnX, btnY, btnW, btnH).setOrigin(0).setInteractive({ useHandCursor: true });
                                        nextBtnZone.on('pointerover', () => { nextBtnBg.clear(); nextBtnBg.fillStyle(0x2563eb, 1); nextBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10); });
                                        nextBtnZone.on('pointerout', () => { nextBtnBg.clear(); nextBtnBg.fillStyle(0x3b82f6, 1); nextBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10); });
                                        nextBtnZone.on('pointerdown', () => {
                                            // Cleanup dialog elements
                                            dlg.destroy();
                                            dlgText.destroy();
                                            nextBtnBg.destroy();
                                            nextBtnTxt.destroy();
                                            nextBtnZone.destroy();
                                            // Redirect back to main lab screen
                                            this.scene.start('LabScene', { remainingSeconds: this.remainingSeconds });
                                        });
                                    };
                                    // Prefer camera shake completion; fallback with slight delay
                                    this.cameras.main.once('camerashakecomplete', () => {
                                        showSuccessDialog();
                                    });
                                    // Safety net: if event not fired (edge cases), show after 300ms
                                    this.time.delayedCall(300, () => {
                                        if (!this.scene.isSleeping()) {
                                            // Ensure dialog not already created by event
                                            // Simple guard: only show if screen still hidden from success flow
                                            if (screen.visible === false && wall.visible === false) {
                                                // Do nothing here; event will have shown it. If not, show now.
                                                // Re-check by seeing if any graphics exist at depth 999 is complex; proceed to show.
                                                showSuccessDialog();
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        };

        const runHcl5 = () => {
            disableChoices();
            // No animation on wrong choice; show red reason only
            const txt = this.add.text(wallX, btnYBase + 70, 'Preblaga ali prehitro dodana kislina – učinek ni zadosten.', { fontFamily: 'Arial', fontSize: '18px', color: '#8b0000' }).setOrigin(0.5);
            this.remainingSeconds = Math.max(0, this.remainingSeconds - 15);
            this.time.delayedCall(1500, () => { txt.destroy(); allButtons().forEach(b => b && b.zone.setInteractive()); });
        };

        const flashAlarm = (times = 3, intensity = 0.25, period = 220) => {
            let count = 0;
            const toggle = () => {
                const visible = alarmOverlay.alpha > 0;
                alarmOverlay.setAlpha(visible ? 0 : intensity);
                count += visible ? 1 : 0;
                if (count < times) this.time.delayedCall(period, toggle); else alarmOverlay.setAlpha(0);
            };
            toggle();
        };

        const runNaOH = () => {
            disableChoices();
            // No animation; only red warning text
            const txt = this.add.text(wallX, btnYBase + 70, 'Raztopina ne reagira z CaCO₃!', { fontFamily: 'Arial', fontSize: '18px', color: '#8b0000' }).setOrigin(0.5);
            this.remainingSeconds = Math.max(0, this.remainingSeconds - 20);
            this.time.delayedCall(1200, () => { txt.destroy(); allButtons().forEach(b => b && b.zone.setInteractive()); });
        };

        const runHcl37 = () => {
            disableChoices();
            // No animation; only red warning text
            const txt = this.add.text(wallX, btnYBase + 70, 'Preveč koncentrirana kislina – nevarnost! To ni pravilna izbira.', { fontFamily: 'Arial', fontSize: '18px', color: '#8b0000' }).setOrigin(0.5);
            this.remainingSeconds = Math.max(0, this.remainingSeconds - 30);
            this.time.delayedCall(1600, () => {
                txt.destroy();
                allButtons().forEach(b => b && b.zone.setInteractive());
            });
        };

        // Back button
        const backBtn = this.add.text(width - 40, 30, '↩ Nazaj', { fontFamily: 'Arial', fontSize: '18px', color: '#0066ff' }).setOrigin(1, 0);
        backBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.scene.start('LabScene');
        });

        // Cleanup
        this.events.once('shutdown', () => {
            bubbleEmitter.emitting = false;
        });
    }

    incrementScore(points) {
        try {
            const username = localStorage.getItem('username');
            if (!username) return;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username);
            if (user) {
                user.score = (user.score ?? 0) + points;
                localStorage.setItem('users', JSON.stringify(users));
            }
        } catch (_) { }
    }
}

function generateWallTextures(scene, keyA, keyB, keyC, w, h) {
    // A: clean wall
    const gA = scene.add.graphics();
    gA.fillStyle(0xe5e7eb, 1); // light grey wall
    gA.fillRoundedRect(0, 0, w, h, 8);
    gA.lineStyle(2, 0xbfc6d1, 1);
    gA.strokeRoundedRect(0, 0, w, h, 8);
    gA.generateTexture(keyA, w, h);
    gA.destroy();

    // B: stains + cracks + bubbles hints
    const gB = scene.add.graphics();
    gB.fillStyle(0xd1d5db, 1);
    gB.fillRoundedRect(0, 0, w, h, 8);
    gB.lineStyle(2, 0xaab2bf, 1);
    gB.strokeRoundedRect(0, 0, w, h, 8);
    // stains
    gB.fillStyle(0xbdbec2, 0.6);
    for (let i = 0; i < 6; i++) {
        const rx = 20 + Math.random() * (w - 40);
        const ry = 14 + Math.random() * (h - 28);
        const rw = 30 + Math.random() * 50;
        const rh = 12 + Math.random() * 24;
        gB.fillEllipse(rx, ry, rw, rh);
    }
    // cracks
    gB.lineStyle(2, 0x8b8f98, 0.9);
    for (let i = 0; i < 5; i++) {
        const sx = w * 0.5 + (Math.random() - 0.5) * 80;
        let x = sx, y = h * 0.5 + (Math.random() - 0.5) * 30;
        gB.beginPath();
        gB.moveTo(x, y);
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 24;
            y += (Math.random() - 0.2) * 18;
            gB.lineTo(x, y);
        }
        gB.strokePath();
    }
    // bubble hints
    gB.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 10; i++) {
        const bx = 10 + Math.random() * (w - 20);
        const by = 10 + Math.random() * (h * 0.35);
        gB.fillCircle(bx, by, 2 + Math.random() * 3);
    }
    gB.generateTexture(keyB, w, h);
    gB.destroy();

    // C: big hole + foam rim
    const gC = scene.add.graphics();
    gC.fillStyle(0xdadde3, 1);
    gC.fillRoundedRect(0, 0, w, h, 8);
    gC.lineStyle(2, 0xaab2bf, 1);
    gC.strokeRoundedRect(0, 0, w, h, 8);
    // hole
    const cx = w * 0.5, cy = h * 0.5, r = Math.min(w, h) * 0.28;
    gC.fillStyle(0x0f172a, 1);
    gC.fillCircle(cx, cy, r);
    // foam ring
    gC.fillStyle(0xffffff, 0.95);
    for (let a = 0; a < Math.PI * 2; a += 0.35) {
        const rr = r + 4 + Math.random() * 6;
        gC.fillCircle(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3 + Math.random() * 3);
    }
    // extra cracks
    gC.lineStyle(2, 0x8b8f98, 0.9);
    for (let i = 0; i < 6; i++) {
        gC.beginPath();
        gC.moveTo(cx + (Math.random() - 0.5) * 10, cy + (Math.random() - 0.5) * 10);
        for (let j = 0; j < 6; j++) {
            const ang = Math.random() * Math.PI * 2;
            const len = 8 + Math.random() * 16;
            const nx = cx + Math.cos(ang) * (r + len * j * 0.3);
            const ny = cy + Math.sin(ang) * (r + len * j * 0.3);
            gC.lineTo(nx, ny);
        }
        gC.strokePath();
    }
    gC.generateTexture(keyC, w, h);
    gC.destroy();
}

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}
