import Phaser from 'phaser';

export default class PhysicsPulleyScene extends Phaser.Scene {
    constructor() {
        super('PhysicsPulleyScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background & header
        this.add.rectangle(0, 0, width, height, 0xf6f6f6).setOrigin(0);
        this.add.rectangle(0, 0, width, 120, 0x4a90e2).setOrigin(0);
        this.add.text(width / 2, 60, 'Sistem Škripec — Diagram', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // State
        this.numWheels = 2;
        this.extraWeights = [];
        this.uiLocked = false;
        this.uiElements = [];

        // Sizes
        this.wheelRadius = 36; // used consistently for drawing & rope tangents

        // Layers
        this.diagramGraphics = this.add.graphics();
        this.ropeGraphics = this.add.graphics();
        this.overlayGraphics = this.add.graphics(); // for arrow & accents

        // Layout anchor
        this.centerX = width / 2;
        this.topY = 180;

        // Build initial diagram and UI
        this.buildDiagram(this.centerX, this.topY);
        this.createUI(width, height);

        // Force label and arrow
        this.forceText = this.add.text(this.centerX, height - 110, '', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#222',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.uiElements.push(this.forceText);
        this.updateForceLabel();
        this.updateForceArrow();
    }

    // -------------------------
    // UI creation (buttons/back)
    // -------------------------
    createUI(width, height) {
        const centerX = this.centerX;

        // Buttons
        this.addButton(centerX - 220, height - 50, '- Kolo', () => {
            if (this.numWheels > 1) {
                this.numWheels--;
                this.rebuildDiagram();
            }
        });

        this.addButton(centerX + 220, height - 50, '+ Kolo', () => {
            if (this.numWheels < 6) {
                this.numWheels++;
                this.rebuildDiagram();
            }
        });

        this.addButton(centerX - 380, height - 50, '+ Teža', () => {
            this.addExtraWeight();
        });

        this.addButton(centerX + 380, height - 50, '- Teža', () => {
            this.removeExtraWeight();
        });

        this.addButton(centerX, height - 50, 'Test', () => {
            this.enterTestMode();
        });

        // Back
        const back = this.add.text(70, 50, 'Nazaj', {
            fontSize: '22px',
            backgroundColor: '#fff',
            padding: 8,
            color: '#000'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('LabScene'));

        this.uiElements.push(back);
    }

    // -------------------------
    // Build / rebuild diagram
    // -------------------------
    buildDiagram(centerX, topY) {
        // clear all layers
        this.diagramGraphics.clear();
        this.ropeGraphics.clear();
        this.overlayGraphics.clear();

        // compute wheel positions
        this.wheels = [];
        const spacing = 140;
        const totalWidth = spacing * (this.numWheels - 1);
        const startX = centerX - totalWidth / 2;
        for (let i = 0; i < this.numWheels; i++) {
            const x = startX + i * spacing;
            const y = topY;
            this.wheels.push({ x, y });
            this.drawNiceWheel(x, y, this.wheelRadius);
        }

        // main weight under middle wheel
        const midIndex = Math.floor((this.numWheels - 1) / 2);
        const midWheel = this.wheels[midIndex];
        this.mainWeight = { x: midWheel.x, y: topY + 170 };
        this.drawWeight(this.mainWeight.x, this.mainWeight.y);

        this.extraWeights.forEach((w, i) => {
            w.x = this.mainWeight.x;
            w.y = this.mainWeight.y + 100 + i * 60; // stack below main weight
            this.drawWeight(w.x, w.y, 0.7); // pass scale factor to drawWeight
        });

        // draw rope wrapping around wheels (top semicircles + connecting lines + down to weights)
        this.drawRopeAroundWheels();
    }

    rebuildDiagram() {
        this.buildDiagram(this.centerX, this.topY);
        this.updateForceLabel();
        this.updateForceArrow();
    }

    // -------------------------
    // Enhanced wheel visuals
    // -------------------------
    drawNiceWheel(x, y, r) {
        const g = this.diagramGraphics;

        // outer rim
        g.lineStyle(4, 0x222222);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, y, r);
        g.strokeCircle(x, y, r);

        // rim inner ring
        g.fillStyle(0xf2f2f2, 1);
        g.fillCircle(x, y, Math.round(r * 0.72));
        g.strokeCircle(x, y, Math.round(r * 0.72));

        // hub
        g.fillStyle(0x333333, 1);
        g.fillCircle(x, y, Math.round(r * 0.24));

        // spokes
        g.lineStyle(3, 0x7a7a7a);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            const x1 = x + Math.cos(a) * (r * 0.72);
            const y1 = y + Math.sin(a) * (r * 0.72);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x1, y1);
            g.strokePath();
        }

        // small center ring
        g.lineStyle(2, 0x111111);
        g.strokeCircle(x, y, Math.round(r * 0.12));
    }

    // -------------------------
    // weight visual
    // -------------------------
    drawWeight(x, y, scale = 1) {
        const g = this.diagramGraphics;
        const w = 60 * scale;
        const h = 90 * scale;
        const hookH = 12 * scale;
        const hookW = 24 * scale;
        const labelW = 36 * scale;
        const labelH = 16 * scale;

        // body with rounded corners
        g.fillStyle(0x4b4b4b, 1);
        g.fillRoundedRect(x - w/2, y - h/2, w, h, 8 * scale);
        g.lineStyle(3 * scale, 0x222222);
        g.strokeRoundedRect(x - w/2, y - h/2, w, h, 8 * scale);

        // connector bar and hook
        g.fillStyle(0x222222, 1);
        g.fillRect(x - hookW/2, y - h/2 - hookH, hookW, hookH);
        g.lineStyle(2 * scale, 0x111111);
        g.strokeRect(x - hookW/2, y - h/2 - hookH, hookW, hookH);

        // weight label small
        g.fillStyle(0xffffff, 1);
        g.fillRect(x - labelW/2, y + h/2 - 10 * scale, labelW, labelH);
        g.lineStyle(1, 0xcccccc);
        g.strokeRect(x - labelW/2, y + h/2 - 10 * scale, labelW, labelH);
    }


    // -------------------------
    // Rope that wraps around top of each wheel
    // Idea: draw connecting line at tangent height (wheel top), and arcs (top semicircle) for each wheel
    // then after last wheel, draw line down to main weight and to extra weights
    // -------------------------
    drawRopeAroundWheels() {
        const g = this.ropeGraphics;
        g.clear();
        g.lineStyle(6, 0x2f2f2f, 1);
        g.lineCap = 'round';

        if (!this.wheels || this.wheels.length === 0) return;

        const r = this.wheelRadius + 6; // rope wraps slightly outside wheel
        const points = [];

        // compute tangent points alternating above/below wheels
        for (let i = 0; i < this.wheels.length; i++) {
            const w = this.wheels[i];
            const above = i % 2 === 0; // even-indexed wheels: rope above, odd: rope below
            const y = above ? w.y - r : w.y + r;
            points.push({ x: w.x, y });
        }

        // start rope a bit left of first wheel
        g.beginPath();
        const leftX = this.wheels[0].x - 120;
        g.moveTo(leftX, points[0].y);

        // connect through all tangent points smoothly
        for (let i = 0; i < points.length; i++) {
            g.lineTo(points[i].x, points[i].y);
        }

        // down to main weight top
        g.lineTo(this.mainWeight.x, this.mainWeight.y - 55);

        // down to extra weights
        this.extraWeights.forEach((w) => {
            g.lineTo(w.x, w.y - 55);
        });

        g.strokePath();

        // optional: highlight rope
        g.lineStyle(2, 0xffffff, 0.25);
        g.beginPath();
        g.moveTo(leftX, points[0].y);
        for (let p of points) g.lineTo(p.x, p.y);
        g.lineTo(this.mainWeight.x, this.mainWeight.y - 55);
        this.extraWeights.forEach((w) => g.lineTo(w.x, w.y - 55));
        g.strokePath();
    }

    // -------------------------
    // Force calculations & arrow (pointing DOWN)
    // -------------------------
    updateForceLabel() {
        const totalWeight = (1 + this.extraWeights.length) * 100;
        const ropeSegments = this.numWheels * 2;
        this.force = Number((totalWeight / ropeSegments).toFixed(1));
        this.forceText.setText(
            `Kolesca: ${this.numWheels} | Breme: ${1 + this.extraWeights.length} | Sila: ${this.force} N`
        );
    }

    updateForceArrow() {
        this.overlayGraphics.clear();
        // arrow on rope above main weight, pointing down
        const x = this.mainWeight.x;
        // place arrow a bit above the top of main weight
        const startY = this.mainWeight.y - 150;
        const endY = this.mainWeight.y - 50;

        // line
        this.overlayGraphics.lineStyle(6, 0xe74c3c, 1);
        this.overlayGraphics.beginPath();
        this.overlayGraphics.moveTo(x, startY);
        this.overlayGraphics.lineTo(x, endY);
        this.overlayGraphics.strokePath();

        // arrowhead (pointing down)
        this.overlayGraphics.fillStyle(0xe74c3c, 1);
        const ah = 12;
        this.overlayGraphics.fillTriangle(
            x - ah, endY - 8,
            x + ah, endY - 8,
            x, endY + 10
        );

        // label on right side of arrow
        if (this.forceArrowText) {
            this.forceArrowText.destroy();
        }
        this.forceArrowText = this.add.text(x + 28, (startY + endY) / 2 - 8, `${this.force} N`, {
            fontSize: '20px',
            color: '#e74c3c',
            fontStyle: 'bold',
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0, 0.5);
    }

    // -------------------------
    // extra weight handlers
    // -------------------------
    addExtraWeight() {
        this.extraWeights.push({ x: 0, y: 0 });
        this.rebuildDiagram();
    }

    removeExtraWeight() {
        if (this.extraWeights.length === 0) return;
        this.extraWeights.pop();
        this.rebuildDiagram();
    }

    // -------------------------
    // Buttons helper
    // -------------------------
    addButton(x, y, label, callback) {
        const bg = this.add.rectangle(x, y, 150, 44, 0x4a90e2, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0x1f4f7b);

        const txt = this.add.text(x, y, label, {
            fontSize: '18px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(0x6ab0ff));
        bg.on('pointerout', () => bg.setFillStyle(0x4a90e2));
        bg.on('pointerdown', () => {
            if (!this.uiLocked) callback();
        });

        this.uiElements.push(bg, txt);
    }

    // -------------------------
    // TEST MODE (unchanged logic, only DOM usage)
    // -------------------------
    enterTestMode() {
        this.uiLocked = true;
        this.uiElements.forEach(el => el.setVisible(false));

        const { width, height } = this.cameras.main;

        const pulleys = Phaser.Math.Between(1, 6);
        const weights = Phaser.Math.Between(1, 4);
        const weightForce = Phaser.Math.Between(50, 200);

        const totalWeight = weights * weightForce;
        const ropeSegments = pulleys * 2;
        const requiredForce = Number((totalWeight / ropeSegments).toFixed(1));

        this.testScenario = {
            pulleys,
            weights,
            weightForce,
            totalWeight,
            ropeSegments,
            requiredForce
        };

        // panel
        this.panel = this.add.rectangle(width / 2, height / 2, 520, 340, 0xffffff, 1)
            .setStrokeStyle(4, 0x000000);
        this.add.rectangle(width / 2, height / 2 - 160, 520, 64, 0x4a90e2);

        const txt =
            `Dani podatki:\n\n` +
            `• Število kolesc: ${pulleys}\n` +
            `• Število bremen: ${weights}\n` +
            `• Sila enega bremena: ${weightForce} N\n\n` +
            `Izračunaj potrebno silo`;

        this.panelText = this.add.text(width / 2, height / 2 - 100, txt, {
            fontSize: '20px',
            align: 'center',
            color: '#000'
        }).setOrigin(0.5);

        // Input (requires dom:createContainer in game config)
        this.testInput = this.add.dom(width / 2, height / 2)
            .createFromHTML(`
            <input type="number" style="font-size:18px; padding:8px; width:220px;" placeholder="Vnesi silo">
        `);

        // submit & hint
        this.submitBtn = this.add.dom(width / 2, height / 2 + 90)
            .createFromHTML(`<button style="font-size:18px; padding:8px 18px; background:#4a90e2; color:#fff; border:none;">Potrdi</button>`);
        this.hintBtn = this.add.dom(width / 2, height / 2 + 140)
            .createFromHTML(`<button style="font-size:16px; padding:6px 14px; background:#999; color:#fff; border:none;">Namig</button>`);

        this.hintBtn.addListener('click');
        this.hintBtn.on('click', () => {
            const originalText = this.panelText.text; // save current panel text
            this.panelText.setText(`Pravilni rezultat je: ${requiredForce} N`);

            // revert back after 1 second (1000 ms)
            this.time.delayedCall(1000, () => {
                this.panelText.setText(originalText);
            });
        });

        this.submitBtn.addListener('click');
        this.submitBtn.on('click', () => this.evaluateTest());
    }

    evaluateTest() {
        const value = Number(this.testInput.node.querySelector('input').value);
        if (isNaN(value)) {
            this.panelText.setText("Vnesi številko!");
            return;
        }

        const correct = this.testScenario.requiredForce;
        if (Math.abs(value - correct) < 0.01) {
            this.showTestResult(true, correct);
        } else {
            this.showTestResult(false, correct);
        }
    }

    showTestResult(isCorrect, correctValue) {
        this.panelText.setText(
            isCorrect
                ? `Pravilno! Potrebna sila: ${correctValue} N`
                : `Napačno. Pravilno: ${correctValue} N`
        );

        this.submitBtn.node.disabled = true;

        this.time.delayedCall(1400, () => {
            if (isCorrect) {
                this.scene.start('AstronomyScene');
            } else {
                this.exitTestMode();
            }
        });
    }

    exitTestMode() {
        if (this.panel) this.panel.destroy();
        if (this.panelText) this.panelText.destroy();
        if (this.testInput) this.testInput.destroy();
        if (this.submitBtn) this.submitBtn.destroy();
        if (this.hintBtn) this.hintBtn.destroy();

        this.uiLocked = false;
        this.uiElements.forEach(el => el.setVisible(true));
    }
}
