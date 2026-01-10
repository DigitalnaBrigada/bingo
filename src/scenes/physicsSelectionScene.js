import Phaser from 'phaser';

export default class PhysicsSelectionScene extends Phaser.Scene {
    constructor() {
        super('PhysicsSelectionScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);

        this.add.text(width / 2, 80, 'Izberi simulacijo', {
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Buttons for scenes
        this.makeButton(width / 2, 200, 'Škripec (Mehanika)', () => {
            this.scene.start('PhysicsPulleyScene');
        });

        this.makeButton(width / 2, 300, 'Orbite (Astronomija)', () => {
            this.scene.start('AstronomyScene');
        });

        this.makeButton(width / 2, 400, 'Radioaktivni Razpad\n (Moderna fizika)', () => {
            this.scene.start('RadioactiveDecayScene');
        });

        // Back to lab
        this.makeButton(width / 2, 520, 'Nazaj v laboratorij', () => {
            this.scene.start('LabScene');
        });
    }

    makeButton(x, y, label, callback) {
        const btn = this.add.rectangle(x, y, 300, 60, 0x4a90e2)
            .setInteractive({ useHandCursor: true });

        const txt = this.add.text(x, y, label, {
            fontSize: '24px',
            color: '#fff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x3b73b6));
        btn.on('pointerout', () => btn.setFillStyle(0x4a90e2));
        btn.on('pointerdown', callback);
    }
}
