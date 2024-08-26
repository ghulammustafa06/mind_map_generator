const mindMap = document.getElementById('mind-map');
const addNodeBtn = document.getElementById('add-node');
const deleteNodeBtn = document.getElementById('delete-node');
const nodeColorPicker = document.getElementById('node-color');
const lineColorPicker = document.getElementById('line-color');

let nodeId = 0;
let selectedNode = null;

function createNode(x, y) {
    const node = document.createElement('div');
    node.className = 'node';
    node.id = `node-${nodeId++}`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = 'New Node';
    node.draggable = true;
    
    node.addEventListener('dragstart', dragStart);
    node.addEventListener('dragend', dragEnd);
    node.addEventListener('dblclick', editNodeText);
    
    mindMap.appendChild(node);
    return node;
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function dragEnd(e) {
    e.target.style.left = `${e.clientX - mindMap.offsetLeft}px`;
    e.target.style.top = `${e.clientY - mindMap.offsetTop}px`;
    updateLines(e.target);
}

function updateLine(line, fromNode, toNode) {
    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - mindMap.offsetLeft;
    const fromY = fromRect.top + fromRect.height / 2 - mindMap.offsetTop;
    const toY = toRect.top + toRect.height / 2 - mindMap.offsetTop;
    
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    
    line.style.width = `${length}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;
}

