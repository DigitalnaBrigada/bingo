import Phaser from 'phaser';

export default class ChemistryScene3 extends Phaser.Scene {
  constructor() {
    super('ChemistryScene3');
  }

  init(data) {
    this.remainingSeconds = Number.isFinite(data?.remainingSeconds) ? data.remainingSeconds : 300;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0xf4f6fa).setOrigin(0);

    // Timer top-left
    const timerText = this.add.text(30, 30, formatTime(this.remainingSeconds), {
      fontFamily: 'Arial', fontSize: '22px', color: '#111', fontStyle: 'bold'
    }).setOrigin(0, 0);
    const timeoutDialog = () => {
      // Disable interactions and show failure dialog
      if (btnZone) btnZone.disableInteractive();
      this.input.keyboard.removeAllListeners();
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
        if (inputEl) inputEl.remove();
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

    // Intro dialog centered
    const panelW = Math.min(820, width - 160);
    const panelH = 260;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.96);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    panel.lineStyle(2, 0xcccccc, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);

    const intro = [
      'Izračunana vrednost Kc = 1,25 potrjuje, da je ravnotežje trenutno stabilno.',
      'A kljub pravilnim koncentracijam se pojavi nova težava: v sistemu začne hitro naraščati tlak.',
      'Da lahko nadaljuješ proti izhodu, moraš zmanjšati tlak tako, da del NO₂ pretvoriš v N₂O₄.'
    ].join('\n\n');
    const introText = this.add.text(panelX + 16, panelY + 16, intro, {
      fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW - 32 }
    });

    const nextW = 160, nextH = 40;
    const nextX = width / 2 - nextW / 2;
    const nextY = panelY + panelH - nextH - 16;
    const nextRect = this.add.rectangle(nextX + nextW / 2, nextY + nextH / 2, nextW, nextH, 0x3399ff)
      .setInteractive({ useHandCursor: true });
    const nextLbl = this.add.text(nextX + nextW / 2, nextY + nextH / 2, 'Naprej ▶', { fontFamily: 'Arial', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    nextRect.on('pointerover', () => nextRect.setFillStyle(0x2563eb));
    nextRect.on('pointerout', () => nextRect.setFillStyle(0x3399ff));

    // Screen panel (hidden until Next), matching Scene 1 position
    const screenW = Math.min(780, width - 160);
    const screenH = 200;
    const screenX = width / 2 - screenW / 2;
    const screenY = 90;
    const screen = this.add.graphics();
    screen.fillStyle(0x1f2937, 0.96);
    screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
    screen.lineStyle(2, 0x0f172a, 1);
    screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
    screen.setVisible(false);

    const qText = 'Da stabiliziraš tlak, moraš del NO₂ pretvoriti v N₂O₄.\nKolikšen procent NO₂ moraš odstraniti, da tlak pade iz 3,0 atm na 2,0 atm (V konstanten, T konstanten)?';
    const screenText = this.add.text(screenX + 16, screenY + 16, qText, {
      fontFamily: 'Arial', fontSize: '18px', color: '#e5e7eb', wordWrap: { width: screenW - 32 }
    }).setVisible(false);
    const gauge = this.add.graphics();
    const gaugeW = 200;
    const gaugeH = 90;
    const gaugeX = width / 2 - gaugeW / 2; // centered under the question screen
    const gaugeY = screenY + screenH + 8; // directly below screen, tighter to question
    const drawGauge = (pointerAngle = -80, colorZone = 'red') => {
      gauge.clear();
      // outer bezel
      gauge.lineStyle(2, 0x374151, 1);
      gauge.strokeRoundedRect(gaugeX, gaugeY, gaugeW, gaugeH, 10);
      // zones
      const red = 0xcc3333, yellow = 0xf59e0b, green = 0x22c55e;
      const zoneW = (gaugeW - 20) / 3;
      const zoneY = gaugeY + gaugeH - 24;
      gauge.fillStyle(red, 0.3); gauge.fillRect(gaugeX + 10, zoneY, zoneW, 14);
      gauge.fillStyle(yellow, 0.3); gauge.fillRect(gaugeX + 10 + zoneW, zoneY, zoneW, 14);
      gauge.fillStyle(green, 0.3); gauge.fillRect(gaugeX + 10 + zoneW * 2, zoneY, zoneW, 14);
      // ticks
      gauge.lineStyle(1, 0x6b7280, 1);
      for (let i = 0; i <= 6; i++) {
        const tx = gaugeX + 14 + i * ((gaugeW - 28) / 6);
        gauge.strokeLineShape(new Phaser.Geom.Line(tx, gaugeY + 18, tx, gaugeY + 30));
      }
      // pointer pivot mid-top
      const pivotX = gaugeX + gaugeW / 2;
      const pivotY = gaugeY + 38;
      const len = 28;
      const rad = Phaser.Math.DegToRad(pointerAngle);
      const tipX = pivotX + Math.cos(rad) * len;
      const tipY = pivotY + Math.sin(rad) * len;
      gauge.lineStyle(3, 0x0f172a, 1);
      gauge.strokeLineShape(new Phaser.Geom.Line(pivotX, pivotY, tipX, tipY));
      gauge.fillStyle(0x374151, 1);
      gauge.fillCircle(pivotX, pivotY, 4);
      // label
      const lblColor = colorZone === 'green' ? '#1b5e20' : colorZone === 'yellow' ? '#8a6d1a' : '#8b0000';
      if (!gauge._text) {
        gauge._text = this.add.text(gaugeX + 12, gaugeY + 6, 'Manometer', { fontFamily: 'Arial', fontSize: '14px', color: '#374151' });
        gauge._state = this.add.text(gaugeX + 12, gaugeY + 50, 'Tlak: visok', { fontFamily: 'Arial', fontSize: '14px', color: lblColor });
      } else {
        gauge._state.setColor(lblColor);
        gauge._state.setText(colorZone === 'green' ? 'Tlak: stabilen' : colorZone === 'yellow' ? 'Tlak: nihanje' : 'Tlak: visok');
      }
      gauge._text.setVisible(gauge.visible);
      gauge._state.setVisible(gauge.visible);
    };
    gauge.setVisible(false);
    let gaugeVibrate = null;
    // Track current pointer angle for smooth transitions
    let pointerAngle = -80;
    // Input and submit (hidden until Next)
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

      const inputW = 200;
      const inputH = 44;
      const inputX = width / 2 - inputW / 2;
      gauge.setVisible(true);
      // start with pointer far-left in red zone (deeper left)
      pointerAngle = -80;
      drawGauge(pointerAngle, 'red');
      gaugeVibrate = this.time.addEvent({ delay: 180, loop: true, callback: () => {
        const jitter = Phaser.Math.Between(-45, -43);
        drawGauge(pointerAngle + jitter, 'red');
      }});
      // Place input below the gauge to keep gauge visible
      const inputY = gaugeY + gaugeH + 20;
      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.placeholder = 'Procent NO₂';
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

      // Submit button
      const btnW = 160, btnH = 44;
      const btnX = width / 2 - btnW / 2;
      // Keep submit button below the input so both are under the screen
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
        const raw = inputEl.value.trim().replace(',', '.');
        const val = parseFloat(raw);
        if (Math.abs(val - 33) < 0.001) {
          feedback.setColor('#1b5e20');
          feedback.setText('✔ Pravilen odgovor: 33%. Tlak se stabilizira.');
          this.incrementScore(10);
          // After correct answer: stop strong vibration
          if (gaugeVibrate) {
            gaugeVibrate.remove(false);
            gaugeVibrate = null;
          }
          // Disable interactions while showing transition/animation
          btnZone.disableInteractive();
          this.input.keyboard.removeAllListeners();
          if (inputEl) {
            inputEl.disabled = true;
          }
          // Tween the pointer smoothly from red (-80) to green (-20)
          const transitionDuration = 900; // ms
          this.tweens.add({
            targets: { angle: pointerAngle },
            angle: -20,
            duration: transitionDuration,
            ease: 'Sine.easeInOut',
            onUpdate: (tween, target) => {
              // As angle approaches -20, change color to yellow then green
              const ang = target.angle;
              pointerAngle = ang;
              const zone = ang > -35 ? (ang > -25 ? 'green' : 'yellow') : 'red';
              drawGauge(ang, zone);
            },
            onComplete: () => {
              // Start minimal jitter around stable angle in green zone
              pointerAngle = -20;
              drawGauge(pointerAngle, 'green');
              gaugeVibrate = this.time.addEvent({ delay: 180, loop: true, callback: () => {
                const jitter = Phaser.Math.Between(-2, 2);
                drawGauge(pointerAngle + jitter, 'green');
              }});
              // After showing stability briefly, redirect to Scene 4
              this.time.delayedCall(1200, () => {
                if (inputEl) inputEl.remove();
                this.scene.start('ChemistryScene4', { remainingSeconds: this.remainingSeconds });
              });
            }
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

    // Cleanup
    this.events.once('shutdown', () => {
      if (inputEl) inputEl.remove();
    });

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
