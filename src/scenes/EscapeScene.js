import Phaser from 'phaser';

export default class EscapeScene extends Phaser.Scene {
    constructor() {
        super('EscapeScene');
    }

    preload() {
        this.load.image('escape', 'src/assets/escape.png');
    }

    create() {
        const img = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height * 2 / 3,
            'escape'
        );

        img.setScale(0.4);

        this.add.text(
            20,              // x position
            20,              // y position
            '' +
            '🎉 Čestitke, raziskovalec! 🎉\n' +
            'Uspelo ti je premagati vse izzive iz kemije, fizike, matematike\nin računalništva. ' +
            'S svojim znanjem si deaktiviral nevarnosti laboratorija,\nstabiliziral reaktor in našel pot do izhoda.\n' +
            '\n' +
            'Pobeg iz Area 51 je uspel.\n' +
            'Tvoja misija je končana – in dokazal si, da si pripravljen tudi na najtežje izzive.',   // text
            {
                fontSize: '32px',
                color: '#000000'
            }
        );
    }
}
