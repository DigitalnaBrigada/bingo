import './style.css'

// uvoz scen
import UIScene from './scenes/UIScene';
import PreloadScene from './scenes/preloadScene';
import MenuScene from './scenes/menuScene';
import LabScene from './scenes/labScene';
import TestScene from './scenes/testScene';
import LoginScene from './scenes/loginScene';
import ScoreboardScene from './scenes/scoreboardScene';
import WorkspaceScene from './scenes/workspaceScene';
import ChemistryScene1 from './scenes/chemistryScene1';
import ChemistryScene2 from './scenes/chemistryScene2';
import ChemistryScene3 from './scenes/chemistryScene3';
import ChemistryScene4 from './scenes/chemistryScene4';
import ChemistryScene5 from './scenes/chemistryScene5';
import PhysicsPulleyScene from './scenes/physicsPulleyScene';
import AstronomyScene from "./scenes/astronomyScene.js";
import RadioactiveDecayScene from "./scenes/radioactiveDecayScene.js";
import PhysicsSelectionScene from "./scenes/physicsSelectionScene.js";
import ClassroomScene from './scenes/ClassroomScene.ts';
import LogicScene from './scenes/logicScene';
import DesktopScene from './scenes/desktopScene';
import LinuxScene from './scenes/linuxScene';
import EscapeScene from "./scenes/EscapeScene.js";
import BingoScene from './scenes/bingoScene';
import LosingScene from './scenes/losingScene';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#f4f6fa',
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    scene: [
        // uvoz scen
        LoginScene,
        MenuScene,
        LabScene,
        WorkspaceScene,
        ChemistryScene1,
        ChemistryScene2,
        ChemistryScene3,
        ChemistryScene4,
        ChemistryScene5,
        PreloadScene,
        UIScene,
        TestScene,
        ScoreboardScene,

        // nove scene
        PhysicsSelectionScene,
        PhysicsPulleyScene,
        AstronomyScene,
        RadioactiveDecayScene,
        ClassroomScene,
        LogicScene,
        DesktopScene,
        LinuxScene,
        EscapeScene,

        // še novejše scene
        BingoScene,
        LosingScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// inicializacija igre
const game = new Phaser.Game(config);
export default game;