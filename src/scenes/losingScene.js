export default class LosingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'losingScene' });
  }

  preload() {
    this.load.image(
      'losingBackground',
      'src/assets/escaped_failed.png'
    );
  }

create() {
  const { width, height } = this.scale;

  // Ozadje (svetlo, da je kontrast dober)
  this.add.rectangle(0, 0, width, height, 0xf8fafc).setOrigin(0);

  // NASLOV
  this.add.text(width / 2, 60, 'Poskus je spodletel.', {
    fontSize: '42px',
    color: '#ef4444',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // OPIS (pod naslovom, NAD sliko)
  const description =
    'Napačna odločitev je povzročila napako v sistemu.\n' +
    'Laboratorij se je zaprl.\n' +
    'Helikopter je odletel brez tebe.\n' +
    'Znanje ni bilo dovolj natančno.';

  const descText = this.add.text(width / 2, 150, description, {
    fontSize: '20px',
    color: '#111827',
    align: 'center',
    lineSpacing: 6
  }).setOrigin(0.5);

  // SLIKA
  const img = this.add.image(width / 2, 0, 'losingBackground').setScale(0.75);
  const spacing = 50;
  const imgY = descText.getBounds().bottom + spacing + img.displayHeight / 2;
  img.setY(imgY);

  // GUMB (pod sliko)
  const retryButton = this.add.text(
    width / 2,
    height - 220,
    'Poskusi znova',
    {
      fontSize: '26px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: { x: 26, y: 12 }
    }
  )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () =>
      retryButton.setStyle({ backgroundColor: '#dc2626' })
    )
    .on('pointerout', () =>
      retryButton.setStyle({ backgroundColor: '#ef4444' })
    )
    .on('pointerdown', () => {
      this.scene.start('LabScene');
    });
}

}
