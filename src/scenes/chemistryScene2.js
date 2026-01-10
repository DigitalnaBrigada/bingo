import Phaser from 'phaser';

export default class ChemistryScene2 extends Phaser.Scene {
  constructor() {
    super('ChemistryScene2');
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

    // Panel for intro dialog (centered horizontally and vertically)
      const panelW = Math.min(820, width - 160);
      const panelH = 240;
      const panelX = width / 2 - panelW / 2;
      const panelY = height / 2 - panelH / 2;
      this.panel = this.add.graphics();
      this.panel.fillStyle(0xffffff, 0.96);
      this.panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
      this.panel.lineStyle(2, 0xcccccc, 1);
      this.panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);

    const textStyle = { fontFamily: 'Arial', fontSize: '18px', color: '#222', wordWrap: { width: panelW - 32 } };
    const intro = [
      'Temperatura je pravilno znižana. Reakcija se premakne v smeri N₂O₄ in koncentracija nevarnega NO₂ začne padati.',
      'A reaktor opozarja na novo nestabilnost – koncentracije NO₂ in N₂O₄ nihajo hitreje, kot bi smele. Da lahko varno nadaljuješ pot proti izhodu, moraš preveriti stabilnost sistema.'
    ].join('\n\n');
    const introText = this.add.text(panelX + 16, panelY + 16, intro, textStyle);

    // Next button inside the dialog
    const nextW = 160, nextH = 40;
    const nextX = width / 2 - nextW / 2;
    const nextY = panelY + panelH - nextH - 16;
    const nextRect = this.add.rectangle(nextX + nextW / 2, nextY + nextH / 2, nextW, nextH, 0x3399ff)
      .setInteractive({ useHandCursor: true });
    const nextLbl = this.add.text(nextX + nextW / 2, nextY + nextH / 2, 'Naprej ▶', { fontFamily: 'Arial', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    nextRect.on('pointerover', () => nextRect.setFillStyle(0x2563eb));
    nextRect.on('pointerout', () => nextRect.setFillStyle(0x3399ff));

    // Screen question panel
    // Match screen position/size to Scene 1
    const screenW = Math.min(780, width - 160);
    const screenH = 200;
    const screenX = width / 2 - screenW / 2;
    const screenY = 90;
    const screen = this.add.graphics();
    screen.fillStyle(0x1f2937, 0.96);
    screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
    screen.lineStyle(2, 0x0f172a, 1);
    screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
    const qText = [
      '• [NO₂] = 0,40 mol/L',
      '• [N₂O₄] = 0,20 mol/L',
      '• Reakcija: 2 NO₂ ⇌ N₂O₄',
      'Vnesi izračunan Kc, da preveriš stabilnost ravnotežja'
    ].join('\n');
    const screenText = this.add.text(screenX + 16, screenY + 16, qText, { fontFamily: 'Arial', fontSize: '18px', color: '#e5e7eb', wordWrap: { width: screenW - 32 } });

    // Reactor is not used in Scene 2 per spec

    // Timer (carry over)
    const timerText = this.add.text(30, 30, formatTime(this.remainingSeconds), {
      fontFamily: 'Arial', fontSize: '22px', color: '#111', fontStyle: 'bold'
    }).setOrigin(0, 0);
    const timeoutDialog = () => {
      // Disable interactions and show failure dialog
      if (kcInput) kcInput.remove();
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

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
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

    // Elements for question (hidden until Next)
    screen.setVisible(false);
    screenText.setVisible(false);
    let kcInput = null;
    let btnZone = null;
    let btnBg = null;
    let feedback = null;

    const showQuestion = () => {
      // remove dialog
      this.panel.destroy();
      introText.destroy();
      nextRect.destroy();
      nextLbl.destroy();
      // show question (screen only)
      screen.setVisible(true);
      screenText.setVisible(true);

      const inputW = 240;
      const inputH = 44;
      const inputX = width / 2 - inputW / 2;
      const inputY = screenY + screenH + 40;
      kcInput = document.createElement('input');
      kcInput.type = 'text';
      kcInput.placeholder = 'Vnesi Kc';
      kcInput.style.position = 'absolute';
      kcInput.style.width = `${inputW}px`;
      kcInput.style.height = `${inputH}px`;
      kcInput.style.left = `${inputX}px`;
      kcInput.style.top = `${inputY}px`;
      kcInput.style.borderRadius = '10px';
      kcInput.style.padding = '8px 12px';
      kcInput.style.border = '1px solid #ccd';
      kcInput.style.fontSize = '18px';
      kcInput.style.textAlign = 'center';
      kcInput.style.backgroundColor = '#fff';
      document.body.appendChild(kcInput);

      // Submit button
      const btnW = 160, btnH = 44;
      const btnX = width / 2 - btnW / 2;
      const btnY = inputY + 70; // premakni gumb malo nižje
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
        const raw = kcInput.value.trim().replace(',', '.');
        const val = parseFloat(raw);
        if (Math.abs(val - 1.25) < 0.001) {
          feedback.setColor('#1b5e20');
          feedback.setText('✔ Kc je pravilen. Sistem je stabilen.');
          this.incrementScore(10);
          // Continue to Scene 3, carry remaining time
          if (kcInput) kcInput.remove();
          this.scene.start('ChemistryScene3', { remainingSeconds: this.remainingSeconds });
        } else {
          feedback.setColor('#8b0000');
          feedback.setText('Ni pravilno. Poskusi znova.');
          this.remainingSeconds = Math.max(0, this.remainingSeconds - 30);
          timerText.setText(formatTime(this.remainingSeconds));
        }
      };

      btnZone.on('pointerdown', validate);
      this.input.keyboard.on('keydown-ENTER', validate);
      kcInput.focus();
    };

    nextRect.on('pointerdown', showQuestion);
    nextLbl.setInteractive({ useHandCursor: true }).on('pointerdown', showQuestion);

    this.events.once('shutdown', () => {
      if (kcInput) kcInput.remove();
    });

    // Back button
    const backBtn = this.add.text(width - 40, 30, '↩ Nazaj', { fontFamily: 'Arial', fontSize: '18px', color: '#0066ff' }).setOrigin(1, 0);
    backBtn.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (kcInput) kcInput.remove();
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
