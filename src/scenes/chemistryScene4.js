import Phaser from 'phaser';

export default class ChemistryScene4 extends Phaser.Scene {
  constructor() {
    super('ChemistryScene4');
  }

  init(data) {
    this.remainingSeconds = Number.isFinite(data?.remainingSeconds) ? data.remainingSeconds : 300;
  }

  preload() {
    this.load.image('reaktor', 'src/assets/reaktor.png');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0xf4f6fa).setOrigin(0);

    // Timer top-left (carry over)
    const timerText = this.add.text(30, 30, formatTime(this.remainingSeconds), {
      fontFamily: 'Arial', fontSize: '22px', color: '#111', fontStyle: 'bold'
    }).setOrigin(0, 0);
    const timeoutDialog = () => {
      // Stop visuals and disable inputs, show failure dialog
      fumeEmitter.emitting = false;
      dripTimer.paused = true;
      if (inputEl) inputEl.remove();
      if (btnZone) btnZone.disableInteractive();
      const panelW2 = Math.min(680, width - 160);
      const panelH2 = 180;
      const panelX2 = width / 2 - panelW2 / 2;
      const panelY2 = height / 2 - panelH2 / 2;
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

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
        timerText.setText(formatTime(this.remainingSeconds));
        if (this.remainingSeconds <= 0) {
          timerText.setText(formatTime(0));
          timeoutDialog();
        }
      }
    }});

    // Intro dialog
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
      'Tlak v reaktorju se uspešno zniža. Del nevarnega NO₂ je pretvorjen v N₂O₄, zato se pritisk stabilizira in nevarnost eksplozije izgine.',
      'A sistem poroča o novi težavi: zaradi preostanka NO₂, ki reagira z vlago, se začne v notranjosti reaktorja tvoriti kislina. Da preprečiš poškodbe reaktorja, moraš raztopino nevtralizirati z NaOH.'
    ].join('\n\n');
    const introText = this.add.text(panelX + 16, panelY + 16, intro, {
      fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW - 32 }
    });

    // Next button
    const nextW = 160, nextH = 40;
    const nextX = width / 2 - nextW / 2;
    const nextY = panelY + panelH - nextH - 16;
    const nextRect = this.add.rectangle(nextX + nextW / 2, nextY + nextH / 2, nextW, nextH, 0x3399ff)
      .setInteractive({ useHandCursor: true });
    const nextLbl = this.add.text(nextX + nextW / 2, nextY + nextH / 2, 'Naprej ▶', { fontFamily: 'Arial', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    nextRect.on('pointerover', () => nextRect.setFillStyle(0x2563eb));
    nextRect.on('pointerout', () => nextRect.setFillStyle(0x3399ff));

    // Reactor at top
    const reactorX = width / 2;
    const reactorY = 160; // move lower for more breathing room
    const reactor = this.add.image(reactorX, reactorY, 'reaktor').setDisplaySize(250, 250);
    reactor.setVisible(false);

    // Screen panel below the reactor
    const screenW = Math.min(780, width - 160);
    const screenH = 200;
    const screenX = width / 2 - screenW / 2;
    const screenY = reactorY + 190; // keep a comfortable gap below reactor
    const screen = this.add.graphics();
    screen.fillStyle(0x1f2937, 0.96);
    screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
    screen.lineStyle(2, 0x0f172a, 1);
    screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
    screen.setVisible(false);

    const qText = [
      'V reaktorju se kopiči kislina zaradi reakcije NO₂ z vlago.',
      'Nastala raztopina ima koncentracijo 0,05 M in volumen 100 mL.',
      'Koliko mL 0,10 M NaOH potrebuješ za popolno nevtralizacijo?'
    ].join('\n');
    const screenText = this.add.text(screenX + 16, screenY + 16, qText, {
      fontFamily: 'Arial', fontSize: '18px', color: '#e5e7eb', wordWrap: { width: screenW - 32 }
    }).setVisible(false);

    // Reactor already defined above

    // Visuals: corrosive reddish fumes and dripping acid along screen edge
    // Create a small particle texture for fumes
    const g = this.add.graphics();
    g.fillStyle(0xff6666, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture('acidFume', 12, 12);
    g.destroy();

    // Fume emitter above reactor, subtle reddish smoke
    const fumeEmitter = this.add.particles(reactorX, reactorY - 130, 'acidFume', {
      angle: { min: 260, max: 280 },
      speed: { min: 15, max: 40 },
      scale: { start: 0.7, end: 1.4 },
      alpha: { start: 0.5, end: 0.1 },
      tint: 0xcc3333,
      lifespan: 2200,
      frequency: 120,
      emitting: false
    });

    // Dripping acid from reactor bottom lip (low FPS animation)
    const dripGroup = this.add.group();
    const reactorBottomY = reactorY + 150; // half of display height (300)
    const makeDrip = () => {
      // Spawn near reactor's bottom center with slight horizontal variance
      const x = reactorX + Phaser.Math.Between(-20, 20);
      const yStart = reactorBottomY - 4; // just under the reactor image
      const h = Phaser.Math.Between(12, 22);
      const drip = this.add.rectangle(x, yStart, 4, h, 0xcc3333).setOrigin(0.5, 0);
      drip.setAlpha(0.85);
      dripGroup.add(drip);
      // Fall downwards toward bottom of screen, slight sway
      const fallDuration = Phaser.Math.Between(900, 1400);
      const sway = Phaser.Math.Between(-12, 12);
      this.tweens.add({
        targets: drip,
        y: height - 20,
        x: x + sway,
        duration: fallDuration,
        ease: 'Quad.easeIn',
        onComplete: () => drip.destroy()
      });
    };

    // 2–3 FPS drip timer (approx every 350–500 ms); start only when screen and reactor visible
    const dripTimer = this.time.addEvent({ delay: 400, loop: true, callback: () => { if (screen.visible && reactor.visible) makeDrip(); } });

    // pH indicator in the corner (use Graphics for rounded rect)
    const phBg = this.add.graphics();
    const phWidth = 110;
    const phHeight = 26;
    const phBgX = width / 2 - phWidth / 2; // center top
    const phBgY = screenY - 26; // stays tied to screen
    phBg.fillStyle(0xffffff, 1);
    phBg.fillRoundedRect(phBgX, phBgY, phWidth, phHeight, 8);
    phBg.lineStyle(2, 0xcccccc, 1);
    phBg.strokeRoundedRect(phBgX, phBgY, phWidth, phHeight, 8);
    phBg.setVisible(false);
    const phText = this.add.text(phBgX + 8, phBgY + 2, 'pH 2 → 7', { fontFamily: 'Arial', fontSize: '16px', color: '#b00020' }).setOrigin(0, 0);
    phText.setVisible(false);

    let inputEl = null;
    let btnZone = null;
    let btnBg = null;
    let feedback = null;

    const showQuestion = () => {
      panel.destroy();
      introText.destroy();
      nextRect.destroy();
      nextLbl.destroy();

      screen.setVisible(true);
      screenText.setVisible(true);
      reactor.setVisible(true);
      // start corrosive visuals
      fumeEmitter.emitting = true;
      // show pH indicator only when question screen is shown
      phBg.setVisible(true);
      phText.setVisible(true);

      const inputW = 220;
      const inputH = 44;
      const inputX = width / 2 - inputW / 2;
      // Place the input BELOW the screen, since screen is under reactor
      const inputY = screenY + screenH + 20;
      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.placeholder = 'mL NaOH';
      inputEl.style.position = 'absolute';
      inputEl.style.width = `${inputW}px`;
      inputEl.style.height = `${inputH}px`;
      inputEl.style.left = `${inputX}px`;
      inputEl.style.top = `${inputY}px`;
      inputEl.style.zIndex = '10';
      inputEl.style.borderRadius = '10px';
      inputEl.style.padding = '8px 12px';
      inputEl.style.border = '1px solid #ccd';
      inputEl.style.fontSize = '18px';
      inputEl.style.textAlign = 'center';
      inputEl.style.backgroundColor = '#fff';
      document.body.appendChild(inputEl);

      const btnW = 160, btnH = 44;
      const btnX = width / 2 - btnW / 2;
      // Keep submit button below the input
      const btnY = inputY + 70; 
      btnBg = this.add.graphics();
      btnBg.fillStyle(0x3b82f6, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
      const btnText = this.add.text(btnX + btnW / 2, btnY + btnH / 2, 'Potrdi', {
        fontFamily: 'Arial', fontSize: '18px', color: '#ffffff'
      }).setOrigin(0.5);
      btnZone = this.add.zone(btnX, btnY, btnW, btnH).setOrigin(0).setInteractive({ useHandCursor: true });
      btnZone.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0x2563eb, 1); btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10); });
      btnZone.on('pointerout', () => { btnBg.clear(); btnBg.fillStyle(0x3b82f6, 1); btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10); });

      feedback = this.add.text(width / 2, btnY + 70, '', { fontFamily: 'Arial', fontSize: '18px', color: '#222' }).setOrigin(0.5);

      const validate = () => {
        const raw = inputEl.value.trim().toLowerCase().replace(',', '.').replace('ml', '').trim();
        const val = parseFloat(raw);
        if (Math.abs(val - 50) < 0.001) {
          feedback.setColor('#1b5e20');
          feedback.setText('✔ Pravilen odgovor: 50 mL. Raztopina je nevtralizirana.');
          this.incrementScore(10);
          // Stop visuals and neutralize colors
          fumeEmitter.emitting = false;
          phText.setColor('#0f5cad');
          phText.setText('pH 7');
          screen.clear();
          screen.fillStyle(0x1f2937, 0.96);
          screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
          screen.lineStyle(2, 0x0f172a, 1);
          screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
          // Pause drips
          dripTimer.paused = true;
          if (inputEl) inputEl.remove();
          // Redirect to Scene 5 after 1s of calm, carrying timer
          this.time.delayedCall(1000, () => {
            this.scene.start('ChemistryScene5', { remainingSeconds: this.remainingSeconds });
          });
        } else {
          feedback.setColor('#8b0000');
          feedback.setText('Ni pravilno. Poskusi znova. (-30s)');
          this.remainingSeconds = Math.max(0, this.remainingSeconds - 30);
          timerText.setText(formatTime(this.remainingSeconds));
        }
      };

      btnZone.on('pointerdown', validate);
      this.input.keyboard.on('keydown-ENTER', validate);
      inputEl.focus();
    };

    nextRect.on('pointerdown', showQuestion);
    nextLbl.setInteractive({ useHandCursor: true }).on('pointerdown', showQuestion);

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      if (inputEl) inputEl.remove();
      fumeEmitter.emitting = false;
      dripTimer.remove(false);
    });

    // Back button
    const backBtn = this.add.text(width - 40, 30, '↩ Nazaj', { fontFamily: 'Arial', fontSize: '18px', color: '#0066ff' }).setOrigin(1, 0);
    backBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (inputEl) inputEl.remove();
      this.scene.start('LabScene');
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
    } catch (_) {}
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}
