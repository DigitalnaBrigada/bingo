import Phaser from 'phaser';

export default class DesktopScene extends Phaser.Scene {
  constructor() {
    super('DesktopScene');
  }

  preload() {
    this.load.image('desktop_bg', 'src/components/desktop_bg.png');
    this.load.image('icon1', 'src/components/linux_icon.png');
    this.load.image('icon2', 'src/components/OR_gate.png');
    this.load.image('icon3', 'src/components/java_icon.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    if (this.textures.exists('desktop_bg')) {
      this.add.image(width / 2, height / 2, 'desktop_bg').setDisplaySize(width, height);
    } else {
      this.add.rectangle(0, 0, width, height, 0x1e2933).setOrigin(0);
      this.add.rectangle(width / 2, height / 2, width * 0.96, height * 0.94, 0x26343a).setOrigin(0.5).setAlpha(0.6);
    }

    // Title / hint
    // this.add.text(224, 18, 'Navigate through the apps on the left', { fontFamily: 'Arial', fontSize: '18px', color: '#dbeafe' }).setDepth(10);

    const icons = [
      { key: 'icon1', label: 'App One' },
      { key: 'icon2', label: 'App Two' },
      { key: 'icon3', label: 'Files' }
    ];

    // layout levo
    const startX = 80;
    const startY = 110;
    const gapY = 140;
    const iconSize = 96;

    icons.forEach((it, i) => {
      const x = startX;
      const y = startY + i * gapY;

      if (this.textures.exists(it.key)) {
        const img = this.add.image(x, y, it.key).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
        img.setInteractive({ useHandCursor: true });
        img.on('pointerdown', () => this.onIconClicked(it.key, it.label));
      } else {
        // placeholder
        const container = this.add.container(x, y);
        const box = this.add.rectangle(0, 0, iconSize, iconSize, 0x0f1724).setStrokeStyle(2, 0x334155);
        const glyph = this.add.text(0, 0, it.label.charAt(0), { fontFamily: 'monospace', fontSize: '36px', color: '#8be9a8' }).setOrigin(0.5);
        const label = this.add.text(0, iconSize / 2 + 8, it.label, { fontFamily: 'Arial', fontSize: '14px', color: '#dbeafe' }).setOrigin(0.5, 0);
        container.add([box, glyph, label]);
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => this.onIconClicked(it.key, it.label));
      }
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
  }

  onIconClicked(key, label) {
    //Dialog za javo
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY - 80;
    const dialog = this.add.container(cx, cy).setDepth(1001);
    this.screenDialog = null;
    switch(key){
        case 'icon1':
            if(dialog != null){
                dialog.destroy();
                this.screenDialog = null;
            }
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('LinuxScene');
            });
            break;
        case 'icon2':
            if(dialog != null){
                dialog.destroy();
                this.screenDialog = null;
            }
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('LogicScene');
            });
            break;
        case 'icon3':
            if (this.screenDialog) return;
            const dlgW = 820;
            const dlgH = 280;

            // ozadje
            const bg = this.add.rectangle(0, 0, dlgW, dlgH, 0x0b0b0e, 0.96).setOrigin(0.5);
            bg.setStrokeStyle(2, 0x666666);
            const innerBg = this.add.rectangle(-8, -24, dlgW - 40, dlgH - 76, 0x08280C, 0.96).setOrigin(0.5);
            innerBg.setStrokeStyle(2, 0x666666);

            // tekst
            //this.key = '~~b +\"\"+ (a&b) +\"\"+ (a/b) +\"\"+ (b<<1) +\"\"+ (b|2)'; // 3 1 5 6 3
            this.key = '(a&b) +\"\"+ (b<<1)'; // 1 6
            const dialogText = this.add.text(-dlgW/2 + 18, -dlgH/2 + 26,
                "public class Main {\n    publ!c sstatic void main(String[] args)[\n        int a = ▓☢; // Binary: 1◻◆Ӝ▩\n        int b = ✗Ϟ; //  Binary: @0Ӝ◇1\n\n        // PARTIAL PASSKEY!!!\n        $ystem.out.println("+this.key+");\n     }\n}\n\n\n\nCompilation failed due to error(s).",
                {
                fontFamily: 'Monospace',
                fontSize: '18px',
                color: '#e6ffe6',
                wordWrap: { width: dlgW - 36 }
                });

            // gumb za zapret
            const closeBtn = this.add.text(dlgW/2 - 78, dlgH/2 - 32, 'Close', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            closeBtn.on('pointerdown', () => {
                dialog.destroy();
                this.screenDialog = null;
            });

            dialog.add([bg, innerBg, dialogText, closeBtn]);
            this.screenDialog = dialog;
            break;
    }
  }
}