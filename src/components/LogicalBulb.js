import { Component } from './component.js';

class LogicalBulb extends Component {
    constructor(id, start, end) {
        // LogicalBulb doesn't use image from parent, it's handled by Phaser
        super(id, 'logicalBulb', start, end, null, false);
        this.state = 'off'; // 'off' or 'on' (responds to node connections)
    }

    toggleState() {
        this.state = this.state === 'off' ? 'on' : 'off';
        console.log(`💡 LogicalBulb ${this.id} state: ${this.state}`);
    }

    getState() {
        return this.state;
    }
}

export { LogicalBulb };