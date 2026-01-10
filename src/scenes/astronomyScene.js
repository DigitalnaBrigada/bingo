import Phaser from 'phaser';

export default class AstronomyScene extends Phaser.Scene {
    constructor() {
        super('AstronomyScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.rectangle(0, 0, width, height, 0x0a0a1a).setOrigin(0);

        this.add.text(width / 2, 60, 'Astronomija – Gravitacija in Orbite', {
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.assignmentText = this.add.text(width - 350, 140, '', {
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: 300 }
        });

        this.createBackButton();

        // 🔥 Create button BEFORE orbit visualizer
        this.createCompleteButton();

        this.createOrbitVisualizer(width / 2 - 200, height / 2);

        // TEST BUTTON
        this.testBtn = this.add.text(width - 180, height - 150, 'Test', {
            fontSize: '22px',
            backgroundColor: '#4a90e2',
            color: '#fff',
            padding: 8
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.enterTestMode());
    }

    update(time, delta) {
        // animate other planets
        this.otherPlanets.forEach(planet => {
            planet.theta += planet.speed * delta; // delta is ms since last frame
            if (planet.theta > Math.PI * 2) planet.theta -= Math.PI * 2;

            // parametric ellipse position
            const x = planet.cx + planet.a * Math.cos(planet.theta);
            const y = planet.cy + planet.b * Math.sin(planet.theta);

            planet.pg.x = x;
            planet.pg.y = y;
        });

        // update force vector and tangential velocity
        this.updateGravity();
    }

    // --------------------------------------------------------------
    // BACK BUTTON
    // --------------------------------------------------------------
    createBackButton() {
        const btn = this.add.rectangle(120, 60, 160, 50, 0x4a90e2, 0.9)
            .setInteractive({ useHandCursor: true });

        this.add.text(120, 60, 'Nazaj', {
            fontSize: '22px',
            color: '#fff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x3b73b6));
        btn.on('pointerout', () => btn.setFillStyle(0x4a90e2));
        btn.on('pointerdown', () => this.scene.start('LabScene'));
    }

    // --------------------------------------------------------------
    // ORBIT VISUALIZER (dynamic ellipse, goldilocks + planets)
    // --------------------------------------------------------------
    createOrbitVisualizer(x, y) {
        // STAR
        this.star = this.add.graphics();
        this.star.x = x;
        this.star.y = y;

        // ORBIT SETTINGS (user-changable later)
        this.dynamicEccentricity = 0.35; // fixed eccentricity for dynamic ellipse (option 1)
        this.orbitSamplePoints = 180; // how many points to draw ellipse

        // GOLDILOCKS ZONE (px) — you said you'll tweak later
        this.goldilocksInner = 140;
        this.goldilocksOuter = 220;

        // ORBIT PATH graphics + goldilocks
        this.orbitPath = this.add.graphics();
        this.goldilocksG = this.add.graphics();
        this.drawGoldilocks();

        // ADD OTHER PLANETS (static orbits)
        // We'll create simple preset ellipses for Mercury, Venus, Mars
        this.otherPlanets = [];
        this.createOtherPlanet('Mercury', 80, 0.2, 6, 0xffaa66, 0.002, Math.PI / 4);
        this.createOtherPlanet('Venus', 120, 0.03, 8, 0xffdd88, 0.0015, Math.PI / 2);
        this.createOtherPlanet('Mars', 280, 0.09, 10, 0xff8866, 0.001, Math.PI);

        // PLANET (Earth) - draggable
        this.planetRadius = 18;
        // place Earth initially on positive x (periapsis-like)
        const planetInitX = x + 180;
        const planetInitY = y;
        this.planet = this.add.graphics();
        this.drawPlanet(this.planet, planetInitX, planetInitY, this.planetRadius, 0x55aaff);

        // interactive hit area for dragging
        this.planetHit = this.add.circle(planetInitX, planetInitY, this.planetRadius + 8, 0x0000ff, 0.0001)
            .setInteractive({ draggable: true });

        // store reference so drag moves graphic
        this.planetHit.graphic = this.planet;

        // LINES + TEXT
        this.forceLine = this.add.graphics();
        this.velocityLine = this.add.graphics(); // will draw short tangential vector
        this.ellipsePointHelper = this.add.graphics(); // optional helper

        this.forceText = this.add.text(x, y + 150, '', {
            fontSize: '18px',
            color: '#fff'
        }).setOrigin(0.5);

        this.distanceText = this.add.text(x, y + 175, '', {
            fontSize: '16px',
            color: '#ddd'
        }).setOrigin(0.5);

        // compute initial dynamic ellipse based on current planet position
        this.recomputeDynamicEllipse(this.planetHit.x, this.planetHit.y);

        // draw orbit and other visuals
        this.drawEllipsePath();

        // input handlers
        this.input.on('dragstart', (_, obj) => { obj.isDragging = true; });
        this.input.on('drag', (pointer, obj, dragX, dragY) => {
            obj.x = dragX;
            obj.y = dragY;
            obj.graphic.x = dragX;
            obj.graphic.y = dragY;

            // recompute ellipse (dynamic) so star is focus and planet defines periapsis direction
            this.recomputeDynamicEllipse(dragX, dragY);
            this.drawEllipsePath();
            this.updateGravity();
            this.checkOrbitUnlock();
        });
        this.input.on('dragend', (_, obj) => { obj.isDragging = false; });

        // initial update
        this.updateGravity();
        this.checkOrbitUnlock();

        this.drawStar(this.star, 0, 0, 40, 0xffee55);
        this.children.bringToTop(this.star);
    }

    // helper to create other static planets (simple static ellipse path and a small circle placed on it)
    createOtherPlanet(name, aPx, eccentricity, radiusPx, color, speed = 0.002, startTheta = 0) {
        const e = eccentricity;
        const a = aPx;
        const b = a * Math.sqrt(1 - e * e);
        const c = a * e;

        const cx = this.star.x - c;
        const cy = this.star.y;

        // draw ellipse path
        const g = this.add.graphics();
        g.lineStyle(1, 0xffffff, 0.18);
        const segments = 120;
        g.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const ex = cx + a * Math.cos(t);
            const ey = cy + b * Math.sin(t);
            if (i === 0) g.moveTo(ex, ey);
            else g.lineTo(ex, ey);
        }
        g.strokePath();

        // planet graphic
        const pg = this.add.graphics();
        pg.fillStyle(color, 1);
        pg.fillCircle(0, 0, radiusPx);
        pg.lineStyle(2, 0x222222);
        pg.strokeCircle(0, 0, radiusPx);

        // set initial position along orbit using startTheta
        const x = cx + a * Math.cos(startTheta);
        const y = cy + b * Math.sin(startTheta);
        pg.x = x;
        pg.y = y;

        this.otherPlanets.push({ name, a, b, cx, cy, color, pg, theta: startTheta, speed });
    }

    drawGoldilocks() {
        this.goldilocksG.clear();
        // fill annulus
        this.goldilocksG.fillStyle(0x2ecc71, 0.08);
        // draw by drawing many small arcs for a filled ring
        const inner = this.goldilocksInner;
        const outer = this.goldilocksOuter;
        const cx = this.star.x;
        const cy = this.star.y;

        // draw outer filled circle then punch inner with composite operation not available;
        // so approximate ring by many triangles (simple approach)
        const seg = 120;
        this.goldilocksG.beginPath();
        for (let i = 0; i <= seg; i++) {
            const theta = (i / seg) * Math.PI * 2;
            const x = cx + outer * Math.cos(theta);
            const y = cy + outer * Math.sin(theta);
            if (i === 0) this.goldilocksG.moveTo(x, y);
            else this.goldilocksG.lineTo(x, y);
        }
        this.goldilocksG.closePath();
        this.goldilocksG.fillPath();

        // punch inner by drawing inner circle in background color (hack)
        this.goldilocksG.fillStyle(0x0a0a1a, 1);
        this.goldilocksG.beginPath();
        for (let i = 0; i <= seg; i++) {
            const theta = (i / seg) * Math.PI * 2;
            const x = cx + inner * Math.cos(theta);
            const y = cy + inner * Math.sin(theta);
            if (i === 0) this.goldilocksG.moveTo(x, y);
            else this.goldilocksG.lineTo(x, y);
        }
        this.goldilocksG.closePath();
        this.goldilocksG.fillPath();

        // draw ring borders
        this.goldilocksG.lineStyle(2, 0x2ecc71, 0.45);
        this.goldilocksG.strokeCircle(this.star.x, this.star.y, inner);
        this.goldilocksG.strokeCircle(this.star.x, this.star.y, outer);
    }

    drawStar(g, cx, cy, r, color) {
        g.clear();
        g.fillStyle(color, 1);
        g.fillCircle(cx, cy, r);
        g.lineStyle(3, 0xffdd33, 1);
        g.strokeCircle(cx, cy, r + 5);
    }

    drawPlanet(g, cx, cy, r, color) {
        g.clear();
        g.fillStyle(color, 1);
        g.fillCircle(0, 0, r);
        g.lineStyle(2, 0x111111);
        g.strokeCircle(0, 0, r + 3);
        g.x = cx;
        g.y = cy;
    }

    // Recompute dynamic ellipse parameters so the star is one focus and the planet's current
    // position is taken as the periapsis direction (we use approach option 1: fixed eccentricity).
    recomputeDynamicEllipse(px, py) {
        const sx = this.star.x;
        const sy = this.star.y;

        // vector from star to planet
        const vx = px - sx;
        const vy = py - sy;
        const r = Math.sqrt(vx * vx + vy * vy) || 1;

        // fixed eccentricity
        const e = this.dynamicEccentricity;

        // If we treat the current planet point as periapsis-like (theta=0), then:
        // a = r / (1 - e)
        const a = r / (1 - e);
        const c = a * e;
        const b = a * Math.sqrt(Math.max(0, 1 - e * e));

        // rotation (major axis) points along the direction from star to planet
        const rotation = Math.atan2(vy, vx); // radians

        // center of ellipse = star - c * unitVec(major axis)
        const ux = Math.cos(rotation);
        const uy = Math.sin(rotation);
        const cx = sx - c * ux;
        const cy = sy - c * uy;

        // store ellipse params
        this.dynamicEllipse = { a, b, c, cx, cy, rotation, e };
    }

    // Draw ellipse path (rotated) using current dynamicEllipse
    drawEllipsePath() {
        if (!this.dynamicEllipse) return;
        const { a, b, cx, cy, rotation } = this.dynamicEllipse;

        this.orbitPath.clear();
        this.orbitPath.lineStyle(2, 0xffffff, 0.18);

        const seg = this.orbitSamplePoints;
        // parametric (unrotated): (a cos t, b sin t)
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);

        this.orbitPath.beginPath();
        for (let i = 0; i <= seg; i++) {
            const t = (i / seg) * Math.PI * 2;
            const ex = a * Math.cos(t);
            const ey = b * Math.sin(t);
            // rotate and translate
            const rx = cx + ex * cosR - ey * sinR;
            const ry = cy + ex * sinR + ey * cosR;
            if (i === 0) this.orbitPath.moveTo(rx, ry);
            else this.orbitPath.lineTo(rx, ry);
        }
        this.orbitPath.strokePath();
    }

    updateGravity() {
        const sx = this.star.x;
        const sy = this.star.y;
        const px = this.planet.x;
        const py = this.planet.y;

        const dx = px - sx;
        const dy = py - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Use real gravitational formula scaled for visualization
        const G = 6.674e-11;
        const massStar = 1.989e30; // sun mass (kg)
        const massPlanet = 5.972e24; // earth mass (kg)
        // scale distance from pixels to meters roughly (arbitrary scale factor)
        // choose a scale such that typical pixel distances produce reasonable numbers
        const pxToMeters = 1e9; // THIS IS A VISUAL SCALE — tweak to taste
        const distM = Math.max(dist * pxToMeters, 1); // meters

        // Force in Newtons, then scale down for display if needed
        const Fraw = (G * massStar * massPlanet) / (distM * distM);
        // For on-screen numeric readability also compute a scaled-for-display value
        const displayScale = 1e-6; // convert to more readable units for the UI
        const Fdisplay = Fraw * displayScale;

        // draw force line (star <- planet)
        this.forceLine.clear();
        this.forceLine.lineStyle(3, 0x4a90e2);
        this.forceLine.beginPath();
        this.forceLine.moveTo(px, py);
        this.forceLine.lineTo(sx, sy);
        this.forceLine.strokePath();

        // text updates
        this.distanceText.setText(`r = ${dist.toFixed(1)} px`);
        this.forceText.setText(`F ≈ ${Fraw.toExponential(2)} N`);

        // velocity vector for circular orbit (shorter now)
        // orbital speed for circular orbit: v = sqrt(G M / r)
        const rMeters = distM;
        const vRaw = Math.sqrt((G * massStar) / rMeters); // m/s
        // convert to screen vector length: pick scale so arrow is visible but short
        const velocityDisplayScale = 0.00012; // tweakable
        const vLen = vRaw * velocityDisplayScale;

        // tangential direction (rotate radial by +90deg)
        const inv = Math.hypot(dx, dy) || 1;
        const tx = -dy / inv;
        const ty = dx / inv;

        this.velocityLine.clear();
        this.velocityLine.lineStyle(2, 0xffcc00);
        this.velocityLine.beginPath();
        this.velocityLine.moveTo(px, py);
        this.velocityLine.lineTo(px + tx * vLen, py + ty * vLen); // significantly shorter
        this.velocityLine.strokePath();
    }

    // Orbit unlock: check how close the planet is to the ellipse curve
    // We'll compute the nearest ellipse point at the same param angle and compare distance.
    checkOrbitUnlock() {
        if (!this.completeBtn) return false;
        if (!this.dynamicEllipse) return false;

        const { a, b, cx, cy, rotation } = this.dynamicEllipse;
        const px = this.planet.x;
        const py = this.planet.y;

        // transform planet into ellipse local coordinates (unrotated)
        const cosR = Math.cos(-rotation);
        const sinR = Math.sin(-rotation);
        const lx = cosR * (px - cx) - sinR * (py - cy);
        const ly = sinR * (px - cx) + cosR * (py - cy);

        // compute parameter t of the point with same angle: t = atan2(ly/b, lx/a)
        // then get ellipse point and measure distance
        const t = Math.atan2(ly / b, lx / a);
        const ex = a * Math.cos(t);
        const ey = b * Math.sin(t);

        // rotate back to world coords
        const cosRpos = Math.cos(rotation);
        const sinRpos = Math.sin(rotation);
        const worldEx = cx + ex * cosRpos - ey * sinRpos;
        const worldEy = cy + ex * sinRpos + ey * cosRpos;

        const dToEllipse = Phaser.Math.Distance.Between(px, py, worldEx, worldEy);

        // optional: draw a small helper point on the ellipse
        this.ellipsePointHelper.clear();
        this.ellipsePointHelper.fillStyle(0xffffff, 0.6);
        this.ellipsePointHelper.fillCircle(worldEx, worldEy, 3);

        const tolerance = 18; // pixels
        if (dToEllipse <= tolerance) {
            this.completeBtn.setFillStyle(0x2ecc71);
            this.completeBtnText.setText("Nadaljuj");
            this.completeBtn.unlocked = true;
        } else {
            this.completeBtn.setFillStyle(0x888888);
            this.completeBtnText.setText("Zaključi orbito");
            this.completeBtn.unlocked = false;
        }
    }

    // --------------------------------------------------------------
    // COMPLETE BUTTON
    // --------------------------------------------------------------
    createCompleteButton() {
        const { width, height } = this.cameras.main;

        this.completeBtn =
            this.add.rectangle(width - 180, height - 80, 260, 60, 0x888888)
                .setInteractive({ useHandCursor: true });

        this.completeBtnText =
            this.add.text(width - 180, height - 80, 'Zaključi orbito', {
                fontSize: '24px',
                color: '#fff'
            }).setOrigin(0.5);

        this.completeBtn.unlocked = false;

        this.completeBtn.on('pointerdown', () => {
            if (this.completeBtn.unlocked) {
                this.scene.start('RadioactiveDecayScene');
            }
        });
    }

    enterTestMode() {
        this.uiLocked = true;

        this.assignmentText.setVisible(false);
        this.completeBtn.setVisible(false);
        this.completeBtnText.setVisible(false);
        this.testBtn.setVisible(false);

        const { width, height } = this.cameras.main;

        // Random scenario
        const starMass = Phaser.Math.Between(1.0e30, 2.2e30);
        const orbitRadius = Phaser.Math.Between(120, 260);
        const G = 6.674e-11;
        const pxToMeters = 1e9;
        const rMeters = orbitRadius * pxToMeters;
        const correct = Math.sqrt(G * starMass / rMeters);

        this.testScenario = { starMass, orbitRadius, correct };

        this.panel = this.add.rectangle(width / 2, height / 2, 520, 530, 0xffffff)
            .setStrokeStyle(4, 0x000000);

        const txt =
            `Podani podatki:\n\n` +
            `• Masa zvezde = ${(starMass/1e30).toFixed(2)} × 10³⁰ kg\n` +
            `• Razdalja planeta = ${orbitRadius} px\n` +
            `• Pretvorba: 1 px = ${pxToMeters.toExponential(1)} m\n` +
            `• Skupna razdalja r = ${(rMeters).toExponential(2)} m\n` +
            `• Gravitacijska konstanta G = 6.674 × 10⁻¹¹ N·m²/kg²\n\n` +
            `Izračunaj krožno obodno hitrost.`;

        this.panelText = this.add.text(width / 2, height / 2 - 120, txt, {
            fontSize: '20px',
            align: 'center',
            color: '#000',
            wordWrap: { width: 460 }
        }).setOrigin(0.5);

        this.testInput = this.add.dom(width / 2, height / 2 + 20).createFromHTML(`
        <input type="number" style="font-size:18px; padding:8px; width:240px;" placeholder="Rezultat v m/s">
    `);

        this.submitBtn = this.add.dom(width / 2, height / 2 + 90).createFromHTML(`
        <button style="font-size:18px; padding:8px 18px; background:#4a90e2; color:#fff; border:none;">
            Potrdi
        </button>
    `);

        this.hintBtn = this.add.dom(width / 2, height / 2 + 140).createFromHTML(`
        <button style="font-size:16px; padding:6px 14px; background:#999; color:#fff; border:none;">
            Namig
        </button>
    `);

        this.submitBtn.addListener('click');
        this.submitBtn.on('click', () => this.evaluateTest());

        this.hintBtn.addListener('click');
        this.hintBtn.on('click', () => {
            const old = this.panelText.text;
            this.panelText.setText(`Pravilni rezultat je: ${correct.toFixed(2)} m/s`);
            this.time.delayedCall(1000, () => this.panelText.setText(old));
        });
    }

    evaluateTest() {
        const val = Number(this.testInput.node.querySelector('input').value);
        if (isNaN(val)) {
            this.panelText.setText("Vnesi številko!");
            return;
        }

        const c = this.testScenario.correct;
        if (Math.abs(val - c) < 0.01) {
            this.showResult(true, c);
        } else {
            this.showResult(false, c);
        }
    }

    showResult(ok, correct) {
        this.panelText.setText(
            ok
                ? `Pravilno! v = ${correct.toFixed(2)} m/s`
                : `Napačno. Pravilno: ${correct.toFixed(2)} m/s`
        );

        this.submitBtn.node.disabled = true;

        this.time.delayedCall(1400, () => {
            if (ok) this.scene.start('RadioactiveDecayScene');
            else this.exitTestMode();
        });
    }

    exitTestMode() {
        this.panel.destroy();
        this.panelText.destroy();
        this.testInput.destroy();
        this.submitBtn.destroy();
        this.hintBtn.destroy();

        this.uiLocked = false;

        this.assignmentText.setVisible(true);
        this.completeBtn.setVisible(true);
        this.completeBtnText.setVisible(true);
        this.testBtn.setVisible(true);
    }
}
