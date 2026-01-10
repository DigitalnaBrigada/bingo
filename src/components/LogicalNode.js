import { Component } from './component.js';

class LogicalNode extends Component {
    constructor(id, start, end) {
        // LogicalNode doesn't use image from parent, it's handled by Phaser
        super(id, 'logicalNode', start, end, null, false);
        this.state = 'off'; // 'off' or 'on'
    }

    toggleState() {
        this.state = this.state === 'off' ? 'on' : 'off';
        console.log(`🔘 LogicalNode ${this.id} state: ${this.state}`);
    }

    getState() {
        return this.state;
    }
}

export { LogicalNode };