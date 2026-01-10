import Phaser from 'phaser';
import DesktopScene from './desktopScene';
import { Battery } from '../components/battery';
//import { Bulb } from '../components/bulb';
import { Wire } from '../components/wire';
import { CircuitGraph } from '../logic/circuit_graph';
import { Node } from '../logic/node';
import { Switch } from '../components/switch';
import { Resistor } from '../components/resistor';
import { LogicalNode } from '../components/LogicalNode';
import { LogicalBulb } from '../components/LogicalBulb';

export default class LogicScene extends Phaser.Scene {
  constructor() {
    super('LogicScene');
  }

  init() {
    const savedIndex = localStorage.getItem('currentChallengeIndex');
    this.currentChallengeIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
  }

  preload() {
    this.graph = new CircuitGraph();
    this.load.image('baterija', 'src/components/battery.png');
    this.load.image('upor', 'src/components/resistor.png');
    this.load.image('svetilka', 'src/components/lamp.png');
    this.load.image('stikalo-on', 'src/components/switch-on.png');
    this.load.image('stikalo-off', 'src/components/switch-off.png');
    this.load.image('žica', 'src/components/wire.png');
    this.load.image('node_off', 'src/components/node_off.png');
    this.load.image('node_on', 'src/components/node_on.png');
    this.load.image('bulb_off', 'src/components/bulb_off.png');
    this.load.image('bulb_on', 'src/components/bulb_on.png');
    this.load.image('OR_gate', 'src/components/OR_gate.png');
    this.load.image('AND_gate', 'src/components/AND_gate.png');
    this.load.image('NOR_gate', 'src/components/NOR_gate.png');
    this.load.image('NAND_gate', 'src/components/NAND_gate.png');
    this.load.image('voltmeter', 'src/components/voltmeter.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.placedComponents = [];
    this.logicalConnectors = [];
    this.logicalConnections = [];

    // površje mize
    const desk = this.add.rectangle(0, 0, width, height, 0x13131a).setOrigin(0).setDepth(-100);
    const gridGraphics = this.add.graphics().setDepth(-50);
    gridGraphics.lineStyle(1, 0x00FF41, 0.35);
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
      gridGraphics.strokePath();
    }
    for (let y = 0; y < height; y += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(width, y);
      gridGraphics.strokePath();
    }

    this.infoWindow = this.add.container(0, 0);
    this.infoWindow.setDepth(1000);
    this.infoWindow.setVisible(false);
    
    // ozadje info okna
    const infoBox = this.add.rectangle(0, 0, 200, 80, 0x2c2c2c, 0.95);
    infoBox.setStrokeStyle(2, 0xffffff);
    const infoText = this.add.text(0, 0, '', {
        fontSize: '14px',
        color: '#ffffff',
        align: 'left',
        wordWrap: { width: 180 }
    }).setOrigin(0.5);
    
    this.infoWindow.add([infoBox, infoText]);
    this.infoText = infoText;

    this.challenges = [
      {
        prompt: 'Sestavi preprosti električni krog z baterijo in svetilko.',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'žica', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Osnovni električni krog potrebuje vir, to je v našem primeru baterija. Potrebuje tudi porabnike, to je svetilka. Električni krog je v našem primeru sklenjen, kar je nujno potrebno, da električni tok teče preko prevodnikov oziroma žic.']
      },
      {
        prompt: 'Sestavi preprosti nesklenjeni električni krog z baterijo, svetilko in stikalom.',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-off'],
        theory: ['V nesklenjenem krogu je stikalo odprto, kar pomeni, da je električni tok prekinjen. Svetilka posledično zato ne sveti.']
      },
      {
        prompt: 'Sestavi preprosti sklenjeni električni krog z baterijo, svetilko in stikalom.',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-on'],
        theory: ['V sklenjenem krogu je stikalo zaprto, kar pomeni, da lahko električni tok teče neovirano. Torej v tem primeru so vrata zaprta.']
      },
      {
        prompt: 'Sestavi električni krog z baterijo, svetilko in stikalom, ki ga lahko ugašaš in prižigaš.',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-on', 'stikalo-off'],
        theory: ['Stikalo nam omogoča nadzor nad pretokom električnega toka. Ko je stikalo zaprto, tok teče in posledično svetilka sveti. Kadar pa je stikalo odprto, tok ne teče in se svetilka ugasne. To lahko primerjamo z vklapljanjem in izklapljanjem električnih naprav v naših domovih.']
      },
      {
        prompt: 'Sestavi krog z dvema baterijama in svetilko. ',
        requiredComponents: ['baterija', 'baterija', 'svetilka', 'žica'],
        theory: ['Kadar vežemo dve ali več baterij zaporedno, se napetosti seštevajo. Večja je napetost, večji je električni tok. V našem primeru zato svetilka sveti močneje.']
      },
      {
        prompt: 'V električni krog zaporedno poveži dve svetilki, ki ju priključiš na baterijo. ',
        requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica'],
        theory: ['V zaporedni vezavi teče isti električni tok skozi vse svetilke. Napetost baterije se porazdeli. Če imamo primer, da ena svetilka preneha delovati, bo ta prekinila tok skozi drugo svetilko.']
      },

      {
        prompt: 'V električni krog vzporedno poveži dve svetilki, ki ju priključiš na baterijo. ',
        requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica'],
        theory: ['V vzporedni vezavi ima vsaka svetilka enako napetost kot baterija. Eletrični tok se porazdeli med svetilkami. Če ena svetilka preneha delovati, bo druga še vedno delovala.']
      },
      {
        prompt: 'Sestavi električni krog s svetilko in uporom. ',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'upor'],
        theory: ['Upor omejuje tok v krogu. Večji kot je upor, manjši je tok. Spoznajmo Ohmov zakon: tok (I) = napetost (U) / upornost (R). Svetilka bo svetila manj intenzivno, saj skozi njo teče manjši tok.']
      },

    ];

    // this.currentChallengeIndex = 0;

    this.promptText = this.add.text(width / 1.8, height - 30, this.challenges[this.currentChallengeIndex].prompt, {
      fontSize: '20px',
      color: '#333',
      fontStyle: 'bold',
      backgroundColor: '#ffffff88',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.checkText = this.add.text(width / 2, height - 70, '', {
      fontSize: '18px',
      color: '#cc0000',
      fontStyle: 'bold',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    const buttonWidth = 180;
    const buttonHeight = 45;
    const cornerRadius = 10;

    const makeButton = (x, y, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x3399ff, 1);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);

      const text = this.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x0f5cad, 1);
          bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
        })
        .on('pointerout', () => {
          bg.clear();
          bg.fillStyle(0x3399ff, 1);
          bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
        })
        .on('pointerdown', onClick);

      return { bg, text };
    };

    makeButton(width - 140, 75, 'Lestvica', () => this.scene.start('ScoreboardScene', { cameFromMenu: false }));
    makeButton(width - 140, 125, 'Preveri krog', () => this.checkCircuit());
    makeButton(width - 140, 175, 'Simulacija', () => {
      this.connected = this.graph.simulate()
      if (this.connected == 1) {
        this.checkText.setStyle({ color: '#00aa00' });
        this.checkText.setText('Električni tok je sklenjen');
        this.sim = true;
        return;
      }
      this.checkText.setStyle({ color: '#cc0000' });
      if (this.connected == -1) {
        this.checkText.setText('Manjka ti baterija');
      }
      else if (this.connected == -2) {
        this.checkText.setText('Stikalo je izklopljeno');
      }
      else if (this.connected == 0) {
        this.checkText.setText('Električni tok ni sklenjen');
      }
      this.sim = false;
    });

    this.connectorGraphics = this.add.graphics().setDepth(0);
    this.gridSize = 40;

    // Generacija naloge
    // lvl 1
    /*const lvl1_node1 = this.createComponent(800, 280, 'Node', 0x00cc66);
    lvl1_node1.setData('isStatic', true);
    this.placedComponents.push(lvl1_node1);
    this.updateLogicNodePositions(lvl1_node1);

    const lvl1_node2 = this.createComponent(800, 600, 'Node', 0x00cc66);
    lvl1_node2.setData('isStatic', true);
    this.placedComponents.push(lvl1_node2);
    this.updateLogicNodePositions(lvl1_node2);

    const lvl1_bulb = this.createComponent(1200, 440, 'Bulb', 0x00cc66);
    lvl1_bulb.setData('isStatic', true);
    this.placedComponents.push(lvl1_bulb);
    this.updateLogicNodePositions(lvl1_bulb);*/

    // lvl 2
    const lvl2_node1 = this.createComponent(200, 50, 'Node', 0x00cc66);
    lvl2_node1.setData('isStatic', true);
    this.placedComponents.push(lvl2_node1);
    this.updateLogicNodePositions(lvl2_node1);

    const lvl2_node2 = this.createComponent(200, 175, 'Node', 0x00cc66);
    lvl2_node2.setData('isStatic', true);
    this.placedComponents.push(lvl2_node2);
    this.updateLogicNodePositions(lvl2_node2);

    const lvl2_node3 = this.createComponent(200, 300, 'Node', 0x00cc66);
    lvl2_node3.setData('isStatic', true);
    this.placedComponents.push(lvl2_node3);
    this.updateLogicNodePositions(lvl2_node3);

    const lvl2_node4 = this.createComponent(200, 425, 'Node', 0x00cc66);
    lvl2_node4.setData('isStatic', true);
    this.placedComponents.push(lvl2_node4);
    this.updateLogicNodePositions(lvl2_node4);

    const lvl2_node5 = this.createComponent(200, 550, 'Node', 0x00cc66);
    lvl2_node5.setData('isStatic', true);
    this.placedComponents.push(lvl2_node5);
    this.updateLogicNodePositions(lvl2_node5);

    const lvl2_node6 = this.createComponent(200, 675, 'Node', 0x00cc66);
    lvl2_node6.setData('isStatic', true);
    this.placedComponents.push(lvl2_node6);
    this.updateLogicNodePositions(lvl2_node6);

    const lvl2_node7 = this.createComponent(200, 800, 'Node', 0x00cc66);
    lvl2_node7.setData('isStatic', true);
    this.placedComponents.push(lvl2_node7);
    this.updateLogicNodePositions(lvl2_node7);

    const lvl2_node8 = this.createComponent(200, 925, 'Node', 0x00cc66);
    lvl2_node8.setData('isStatic', true);
    this.placedComponents.push(lvl2_node8);
    this.updateLogicNodePositions(lvl2_node8);

    const lvl2_OR_gate1 = this.createComponent(350, 125, 'OR_gate', 0x00cc66);
    lvl2_OR_gate1.setData('isStatic', true);
    this.placedComponents.push(lvl2_OR_gate1);
    this.updateLogicNodePositions(lvl2_OR_gate1);

    const lvl2_AND_gate = this.createComponent(400, 350, 'AND_gate', 0x00cc66);
    lvl2_AND_gate.setData('isStatic', true);
    this.placedComponents.push(lvl2_AND_gate);
    this.updateLogicNodePositions(lvl2_AND_gate);

    const lvl2_NAND_gate2 = this.createComponent(600, 250, 'NAND_gate', 0x00cc66);
    lvl2_NAND_gate2.setData('isStatic', true);
    this.placedComponents.push(lvl2_NAND_gate2);
    this.updateLogicNodePositions(lvl2_NAND_gate2);

    const lvl2_NOR_gate1 = this.createComponent(400, 655, 'NOR_gate', 0x00cc66);
    lvl2_NOR_gate1.setData('isStatic', true);
    this.placedComponents.push(lvl2_NOR_gate1);
    this.updateLogicNodePositions(lvl2_NOR_gate1);

    const lvl2_NAND_gate = this.createComponent(400, 860, 'NAND_gate', 0x00cc66);
    lvl2_NAND_gate.setData('isStatic', true);
    this.placedComponents.push(lvl2_NAND_gate);
    this.updateLogicNodePositions(lvl2_NAND_gate);

    const lvl2_NOR_gate2 = this.createComponent(600, 760, 'NOR_gate', 0x00cc66);
    lvl2_NOR_gate2.setData('isStatic', true);
    this.placedComponents.push(lvl2_NOR_gate2);
    this.updateLogicNodePositions(lvl2_NOR_gate2);

    const lvl2_node9 = this.createComponent(400, 475, 'Node', 0x00cc66);
    lvl2_node9.setData('isStatic', true);
    this.placedComponents.push(lvl2_node9);
    this.updateLogicNodePositions(lvl2_node9);

    const lvl2_NOR_gate3 = this.createComponent(600, 565, 'NOR_gate', 0x00cc66);
    lvl2_NOR_gate3.setData('isStatic', true);
    this.placedComponents.push(lvl2_NOR_gate3);
    this.updateLogicNodePositions(lvl2_NOR_gate3);

    const lvl2_AND_gate2 = this.createComponent(800, 325, 'AND_gate', 0x00cc66);
    lvl2_AND_gate2.setData('isStatic', true);
    this.placedComponents.push(lvl2_AND_gate2);
    this.updateLogicNodePositions(lvl2_AND_gate2);

    const lvl2_AND_gate3 = this.createComponent(800, 725, 'AND_gate', 0x00cc66);
    lvl2_AND_gate3.setData('isStatic', true);
    this.placedComponents.push(lvl2_AND_gate3);
    this.updateLogicNodePositions(lvl2_AND_gate3);

    const lvl2_AND_gate4 = this.createComponent(1000, 480, 'AND_gate', 0x00cc66);
    lvl2_AND_gate4.setData('isStatic', true);
    this.placedComponents.push(lvl2_AND_gate4);
    this.updateLogicNodePositions(lvl2_AND_gate4);

    const lvl2_bulb = this.createComponent(1200, 480, 'Bulb', 0x00cc66);
    lvl2_bulb.setData('isStatic', true);
    this.placedComponents.push(lvl2_bulb);
    this.updateLogicNodePositions(lvl2_bulb);

    // Connections table
    this.logicalConnections.push([0, 8]) // node1 - OR
    this.logicalConnections.push([1, 8]) // node2 - OR
    this.logicalConnections.push([2, 9]) // node3 - AND 1
    this.logicalConnections.push([3, 9]) // node4 - AND 1
    this.logicalConnections.push([4, 11])
    this.logicalConnections.push([5, 11])
    this.logicalConnections.push([6, 12])
    this.logicalConnections.push([7, 12]) 
    this.logicalConnections.push([8, 10])
    this.logicalConnections.push([9, 10])
    this.logicalConnections.push([11, 13])
    this.logicalConnections.push([12, 13])
    this.logicalConnections.push([4, 15]) 
    this.logicalConnections.push([14, 15]) 
    this.logicalConnections.push([13, 17])
    this.logicalConnections.push([15, 17])  
    this.logicalConnections.push([9, 16])
    this.logicalConnections.push([10, 16]) 
    this.logicalConnections.push([16, 18])
    this.logicalConnections.push([17, 18]) 
    this.logicalConnections.push([18, 19]) 
    this.updateLogicalConnectors();
    
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
          this.scene.start('DesktopScene');
        });
      });

    this.add.text(width / 2 + 50, 30, 'Vklopi prava stikala da vklopiš luč!', {
      fontSize: '20px',
      color: '#333',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#ffffff88',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
  }

  getComponentDetails(type) {
    const details = {
        'baterija': 'Napetost: 3.3 V\nVir električne energije',
        'upor': 'Uporabnost: omejuje tok\nMeri se v ohmih (Ω)',
        'svetilka': 'Pretvarja električno energijo v svetlobo',
        'stikalo-on': 'Dovoljuje pretok toka',
        'stikalo-off': 'Prepreči pretok toka',
        'žica': 'Povezuje komponente\nKlikni za obračanje',
        'node': 'Click to turn ON/OFF',
        'voltmeter': 'Meri električno napetost\nEnota: volti (V)',
        'bulb': 'Power to turn ON'
    };
    return details[type] || 'Komponenta';
  }

  createGrid() {
    const { width, height } = this.cameras.main;
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(2, 0x8b7355, 0.4);

    const gridSize = 40;
    const startX = 200;

    // vertikalne črte
    for (let x = startX; x < width; x += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
      gridGraphics.strokePath();
    }

    // horizontalne črte
    for (let y = 0; y < height; y += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(startX, y);
      gridGraphics.lineTo(width, y);
      gridGraphics.strokePath();
    }
  }

  snapToGrid(x, y) {
    const gridSize = this.gridSize;
    const startX = 200;

    // komponeta na sredisce mreze/kvadratkov
    const snappedX = Math.round((x - startX) / gridSize) * gridSize + startX;
    const snappedY = Math.round(y / gridSize) * gridSize;
    return { x: snappedX, y: snappedY };
  }

  getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }

updateLogicalConnectors() {
  //console.log('logicalConnections:', this.logicalConnections);
  //console.log('placedComponents count:', this.placedComponents.length);
  
  this.connectorGraphics.clear();
  for (const [idx1, idx2] of this.logicalConnections) {

    //console.log(`Processing connection [${idx1}, ${idx2}]`);
    
    if (idx1 === undefined || idx2 === undefined) {
      console.log('Skipping undefined connection');
      continue;
    }
    
    const comp1 = this.placedComponents[idx1];
    const comp2 = this.placedComponents[idx2];
    
    //console.log(`comp1:`, comp1?.getData('type'), `comp2:`, comp2?.getData('type'));
    
    if (!comp1 || !comp2) {
      console.log('Missing component, skipping');
      continue;
    }
    
    // Prva komponenta
    //console.log(comp1.x);
    const nodePos = this.snapToGrid(parseInt(comp1.x), comp1.y);
    const nodeOn = comp1.getData('nodeState') === 'on';
    const color = nodeOn ? 0x00FF33 : 0xFF6666;
    const width = nodeOn ? 4 : 2;
    
    //console.log(`nodePos:`, nodePos, `nodeOn:`, nodeOn);
    //console.log(comp1.x);
    
    // Druga komponenta
    const logic = comp2.getData('logicComponent');
    if (!logic) {
      console.log('No logic component, skipping');
      continue;
    }

    console.log(comp2.getData('type'));
    if(comp2.getData('type') != 'Node'){
      this.updateNode(idx1, comp2, nodeOn);
    }
    
    //console.log("LOGIC: ", logic);
    const ports = [];
    if (logic.localStart) ports.push(logic.localStart);
    if (logic.localEnd) ports.push(logic.localEnd);
    
    //console.log(`ports:`, ports);
    
    // Risanje povezave
    if (ports.length > 0) {
      const port = ports[0];
      const dx = port.x - nodePos.x;
      const dy = port.y - nodePos.y;
      
      //console.log(`Drawing from [${nodePos.x}, ${nodePos.y}] to [${port.x}, ${port.y}]`);
      
      if (dx === 0 && dy === 0) {
        // Ce premalo je pika
        const radius = nodeOn ? 6 : 4;
        this.connectorGraphics.fillStyle(color, 1);
        this.connectorGraphics.fillCircle(nodePos.x, nodePos.y, radius);
        //console.log(`Drew dot at [${nodePos.x}, ${nodePos.y}] with radius ${radius}`);
      } else {
        // Normalno linija
        this.connectorGraphics.lineStyle(width, color, 1);
        this.connectorGraphics.beginPath();
        this.connectorGraphics.moveTo(nodePos.x, nodePos.y);
        this.connectorGraphics.lineTo(port.x, port.y);
        this.connectorGraphics.strokePath();
        //console.log(`Drew line from [${nodePos.x}, ${nodePos.y}] to [${port.x}, ${port.y}]`);
      }
    }
  }
}

  updateLogicNodePositions(component) {
    //console.log("componenta", component);
    const comp = component.getData('logicComponent');
    if (!comp) return;

    // derive local offsets: prefer comp-local offsets, else use half display
    const halfW = 40;
    const halfH = 40;

    const localStart = comp.localStart || { x: -halfW, y: 0 };
    const localEnd = comp.localEnd || { x: halfW, y: 0 };

    // get container angle in radians (Phaser keeps both .angle and .rotation)
    const theta = (typeof component.rotation === 'number' && component.rotation) ? component.rotation : Phaser.Math.DegToRad(component.angle || 0);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const rotate = (p) => ({
      x: Math.round(p.x * cos - p.y * sin),
      y: Math.round(p.x * sin + p.y * cos)
    });

    const rStart = rotate(localStart);
    const rEnd = rotate(localEnd);

    const worldStart = { x: component.x + rStart.x, y: component.y + rStart.y };
    const worldEnd = { x: component.x + rEnd.x, y: component.y + rEnd.y };

    const snappedStart = this.snapToGrid(worldStart.x, worldStart.y);
    const snappedEnd = this.snapToGrid(worldEnd.x, worldEnd.y);

    if (comp.start) {
      comp.start.x = snappedStart.x;
      comp.start.y = snappedStart.y;
      if (!comp.start.connected) comp.start.connected = new Set();
      this.graph.addNode(comp.start);
    }
    if (comp.end) {
      comp.end.x = snappedEnd.x;
      comp.end.y = snappedEnd.y;
      if (!comp.end.connected) comp.end.connected = new Set();
      this.graph.addNode(comp.end);
    }

    // debug dots are top-level objects (not children). update their positions
    const startDot = component.getData('startDot');
    const endDot = component.getData('endDot');
    if (startDot && comp.start) { startDot.x = comp.start.x; startDot.y = comp.start.y; }
    if (endDot && comp.end) { endDot.x = comp.end.x; endDot.y = comp.end.y; }
  }

  createComponent(x, y, type, color) {
    //console.log("Dobis x in y", x, y);
    let new_x = x;
    let new_y = y;
    const component = this.add.container(x, y);

    let comp = null;
    let componentImage;
    let id;
    let nodeIterator = 0;
    let bulbIterator = 0;

    switch (type) {
      case 'Node':
        id = "node_" + nodeIterator++;
        comp = new LogicalNode(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'Node';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        let randomState = Math.random() < 0.5 ? 'off' : 'on';
        componentImage = this.add.image(0, 0, randomState === 'on' ? 'node_on' : 'node_off')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', randomState);
        break;
      case 'Bulb':
        id = "bulb_" + bulbIterator++;
        comp = new LogicalBulb(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'bulb';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        componentImage = this.add.image(0, 0, 'bulb_off')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', 'off');
        component.setData('PoweredBy', null);
        break;
      case 'OR_gate':
        id = "OR_gate" + bulbIterator++;
        comp = new LogicalBulb(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'OR_gate';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        componentImage = this.add.image(0, 0, 'OR_gate')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', 'off');
        component.setData('PoweredBy', null);
        break;
        case 'NOR_gate':
        id = "NOR_gate" + bulbIterator++;
        comp = new LogicalBulb(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'NOR_gate';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        componentImage = this.add.image(0, 0, 'NOR_gate')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', 'on');
        component.setData('PoweredBy', null);
        break;
      case 'AND_gate':
        id = "AND_gate" + bulbIterator++;
        comp = new LogicalBulb(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'AND_gate';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        componentImage = this.add.image(0, 0, 'AND_gate')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', 'off');
        component.setData('Powered1st', null);
        component.setData('Powered2nd', null);
        break;
      case 'NAND_gate':
        id = "NAND_gate" + bulbIterator++;
        comp = new LogicalBulb(
          id,
          new Node(id + '_start', x, y),
          new Node(id + '_end', x, y)
        );
        comp.type = 'NAND_gate';
        comp.localStart = { x: x, y: y };
        comp.localEnd = { x: x, y: y };
        componentImage = this.add.image(0, 0, 'NAND_gate')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        component.setData('nodeState', 'on');
        component.setData('Powered1st', null);
        component.setData('Powered2nd', null);
      break;
    }

    component.on('pointerover', () => {
      component.setScale(1.1);
    });
  
    
    component.on('pointerout', () => {
        component.setScale(1);
    });

    // Label
    const label = this.add.text(0, 50, type, {
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2},
    }).setOrigin(0.5);
    component.add(label);

    component.setSize(70, 70);
    component.setInteractive({ draggable: true, useHandCursor: true });

    // shrani originalno pozicijo in tip
    component.setData('originalX', x);
    component.setData('originalY', y);
    component.setData('type', type);
    component.setData('color', color);
    component.setData('rotation', 0);
    if (comp) component.setData('logicComponent', comp);
    component.setData('isDragging', false);

    this.input.setDraggable(component);

    component.on('dragstart', () => {
      component.setData('isDragging', true);
    });

    component.on('drag', (pointer, dragX, dragY) => {
      if(component.getData('isStatic')) return;
      component.x = dragX;
      component.y = dragY;
    });

    component.on('pointerdown', () => {
      if(component.getData('isStatic')){
        if (type === 'Node') {
        const currentState = component.getData('nodeState') || 'off';
        const newState = currentState === 'off' ? 'on' : 'off';
        component.setData('nodeState', newState);
        // Nova slika glede na stanje
        const newImage = newState === 'off' ? 'node_off' : 'node_on';
        componentImage.setTexture(newImage)
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);    
        }
        this.updateLogicalConnectors();
        return;
      }

        const currentRotation = component.getData('rotation');
        const newRotation = (currentRotation + 90) % 360;
        component.setData('rotation', newRotation);
        component.setData('isRotated', !component.getData('isRotated'));
        
        this.tweens.add({
          targets: component,
          angle: newRotation,
          duration: 150,
          ease: 'Cubic.easeOut',
        });
    });

    // hover efekt
    component.on('pointerover', () => {
      component.setScale(1.1);
    });

    component.on('pointerout', () => {
      component.setScale(1);
    });
    return component;
  }

  updateNode(nodeId, component, nodeOn){
    const logic = component.getData('logicComponent');
    switch(logic.type){
    case 'bulb':
      if(nodeOn){
        component.setData('PoweredBy', nodeId);
        component.setData('nodeState', 'on');
        console.log("Bulb ON", component.getData('PoweredBy'));
        let componentImage = this.add.image(0, 0, 'bulb_on')
          .setOrigin(0.5)
          .setDisplaySize(200, 200);
        component.add(componentImage);        
      }
      else{
        if(component.getData('PoweredBy') === nodeId){
          component.setData('PoweredBy', null);
          component.setData('nodeState', 'off');
          console.log("Bulb OFF");
          let componentImage = this.add.image(0, 0, 'bulb_off')
            .setOrigin(0.5)
            .setDisplaySize(200, 200);
          component.add(componentImage);  
        }
      }
      break;
    case 'OR_gate':
      if(nodeOn){
        component.setData('PoweredBy', nodeId);
        component.setData('nodeState', 'on');
        console.log("| Gate ON", component.getData('PoweredBy'));
      }
      else{
        if(component.getData('PoweredBy') === nodeId){
          component.setData('PoweredBy', null);
          component.setData('nodeState', 'off');
          console.log("| Gate OFF");
        }
      }
      break;
    case 'NOR_gate':
      if(nodeOn){
        component.setData('PoweredBy', nodeId);
        component.setData('nodeState', 'off');
        console.log("~| Gate OFF", component.getData('PoweredBy'));
      }
      else{
        if(component.getData('PoweredBy') === nodeId){
          component.setData('PoweredBy', null);
          component.setData('nodeState', 'on');
          console.log("~| Gate ON");
        }
      }
      break;
    case 'AND_gate':
      if(nodeOn){
        if(component.getData('Powered1st') === null && component.getData('Powered2nd') === null){
          component.setData('Powered1st', nodeId);
          console.log("& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered1st') === null && component.getData('Powered2nd') !== nodeId){
          component.setData('Powered1st', nodeId);
          component.setData('nodeState', 'on');
          console.log("& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered2nd') === null && component.getData('Powered1st') !== nodeId){
          component.setData('Powered2nd', nodeId);
          component.setData('nodeState', 'on');
          console.log("& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        }
      } else{
        if(component.getData('Powered1st') === null && component.getData('Powered2nd') === null){
          component.setData('nodeState', 'off');
          console.log("& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered1st') !== null && component.getData('Powered2nd') === nodeId){
          component.setData('Powered2nd', null);
          component.setData('nodeState', 'off');
          console.log("& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered2nd') !== null && component.getData('Powered1st') === nodeId){
          component.setData('Powered1st', null);
          component.setData('nodeState', 'off');
          console.log("& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        }
      }
      break;
      case 'NAND_gate':
      if(nodeOn){
        if(component.getData('Powered1st') === null && component.getData('Powered2nd') === null){
          component.setData('Powered1st', nodeId);
          console.log("~& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered1st') === null && component.getData('Powered2nd') !== nodeId){
          component.setData('Powered1st', nodeId);
          component.setData('nodeState', 'off');
          console.log("~& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered2nd') === null && component.getData('Powered1st') !== nodeId){
          component.setData('Powered2nd', nodeId);
          component.setData('nodeState', 'off');
          console.log("~& Gate OFF", component.getData('Powered1st'), component.getData('Powered2nd'));
        }
      } else{
        if(component.getData('Powered1st') === null && component.getData('Powered2nd') === null){
          component.setData('nodeState', 'on');
          console.log("~& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered1st') !== null && component.getData('Powered2nd') === nodeId){
          component.setData('Powered2nd', null);
          component.setData('nodeState', 'on');
          console.log("~& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        } else if (component.getData('Powered2nd') !== null && component.getData('Powered1st') === nodeId){
          component.setData('Powered1st', null);
          component.setData('nodeState', 'on');
          console.log("~& Gate ON", component.getData('Powered1st'), component.getData('Powered2nd'));
        }
      }
      break;
    }
  }

  checkCircuit() {
    const currentChallenge = this.challenges[this.currentChallengeIndex];
    const placedTypes = this.placedComponents.map(comp => comp.getData('type'));
    //console.log("components", placedTypes);
    this.checkText.setStyle({ color: '#cc0000' });
    // preverjas ce so vse komponente na mizi
    if (!currentChallenge.requiredComponents.every(req => placedTypes.includes(req))) {
      this.checkText.setText('Manjkajo komponente za krog.');
      return;
    }

    // je pravilna simulacija 
    if (this.sim == undefined) {
      this.checkText.setText('Zaženi simlacijo');
      return;
    }

    if (this.sim == false) {
      this.checkText.setText('Električni krog ni sklenjen. Preveri kako si ga sestavil');
      return;
    }


    // je zaprt krog

    this.checkText.setStyle({ color: '#00aa00' });
    this.checkText.setText('Čestitke! Krog je pravilen.');
    this.addPoints(10);

    if (currentChallenge.theory) {
      this.showTheory(currentChallenge.theory);
    }
    else {
      this.checkText.setStyle({ color: '#00aa00' });
      this.checkText.setText('Čestitke! Krog je pravilen.');
      this.addPoints(10);
      this.time.delayedCall(2000, () => this.nextChallenge());
    }
    // this.placedComponents.forEach(comp => comp.destroy());
    // this.placedComponents = [];
    // this.time.delayedCall(2000, () => this.nextChallenge());
    // const isCorrect = currentChallenge.requiredComponents.every(req => placedTypes.includes(req));
    // if (isCorrect) {
    //   this.checkText.setText('Čestitke! Krog je pravilen.');
    //   this.addPoints(10);
    //   this.time.delayedCall(2000, () => this.nextChallenge());
    // }
    // else {
    //   this.checkText.setText('Krog ni pravilen. Poskusi znova.');
    // }
  }

  nextChallenge() {
    this.currentChallengeIndex++;
    localStorage.setItem('currentChallengeIndex', this.currentChallengeIndex.toString());
    this.checkText.setText('');

    if (this.currentChallengeIndex < this.challenges.length) {
      this.promptText.setText(this.challenges[this.currentChallengeIndex].prompt);
    }
    else {
      this.promptText.setText('Vse naloge so uspešno opravljene! Čestitke!');
      localStorage.removeItem('currentChallengeIndex');
    }
  }

  addPoints(points) {
    const user = localStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userData = users.find(u => u.username === user);
    if (userData) {
      userData.score = (userData.score || 0) + points;
    }
    localStorage.setItem('users', JSON.stringify(users));
  }

  showTheory(theoryText) {
    const { width, height } = this.cameras.main;

    this.theoryBack = this.add.rectangle(width / 2, height / 2, width - 100, 150, 0x000000, 0.8)
      .setOrigin(0.5)
      .setDepth(10);

    this.theoryText = this.add.text(width / 2, height / 2, theoryText, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 150 }
    })
      .setOrigin(0.5)
      .setDepth(11);

    this.continueButton = this.add.text(width / 2, height / 2 + 70, 'Nadaljuj', {
      fontSize: '18px',
      color: '#0066ff',
      backgroundColor: '#ffffff',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setDepth(11)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.continueButton.setStyle({ color: '#0044cc' }))
      .on('pointerout', () => this.continueButton.setStyle({ color: '#0066ff' }))
      .on('pointerdown', () => {
        this.hideTheory();
        this.placedComponents.forEach(comp => comp.destroy());
        this.placedComponents = [];
        this.nextChallenge();
      });


  }

  hideTheory() {
    if (this.theoryBack) {
      this.theoryBack.destroy();
      this.theoryBack = null;
    }
    if (this.theoryText) {
      this.theoryText.destroy();
      this.theoryText = null;
    }
    if (this.continueButton) {
      this.continueButton.destroy();
      this.continueButton = null;
    }
  }

}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#f0f0f0',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [DesktopScene, LogicScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};
