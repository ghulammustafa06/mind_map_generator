const mindMap = document.getElementById('mind-map');
const mindMapContainer = document.getElementById('mind-map-container');
const addNodeBtn = document.getElementById('add-node');
const deleteNodeBtn = document.getElementById('delete-node');
const connectNodesBtn = document.getElementById('connect-nodes');
const nodeColorPicker = document.getElementById('node-color');
const lineColorPicker = document.getElementById('line-color');
const saveMapBtn = document.getElementById('save-map');
const loadMapBtn = document.getElementById('load-map');
const zoomSlider = document.getElementById('zoom');

let nodeId = 0;
let selectedNodes = [];
let isConnecting = false;

function createNode(x, y, text = 'New Node', color = '#4CAF50') {
    const node = document.createElement('div');
    node.className = 'node';
    node.id = `node-${nodeId++}`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.backgroundColor = color;
    node.textContent = text;
    node.draggable = true;
    
    node.addEventListener('dragstart', dragStart);
    node.addEventListener('dragend', dragEnd);
    node.addEventListener('click', selectNode);
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

function updateLines(node) {
    const lines = document.querySelectorAll(`.line[data-from="${node.id}"], .line[data-to="${node.id}"]`);
    lines.forEach(line => {
        const fromNode = document.getElementById(line.dataset.from);
        const toNode = document.getElementById(line.dataset.to);
        updateLine(line, fromNode, toNode);
    });
}

function dragEnd(e) {
    const rect = mindMapContainer.getBoundingClientRect();
    const zoom = parseFloat(zoomSlider.value);
    e.target.style.left = `${(e.clientX - rect.left) / zoom}px`;
    e.target.style.top = `${(e.clientY - rect.top) / zoom}px`;
    updateLines(e.target);
}

function updateLines(node) {
    const lines = document.querySelectorAll(`.line[data-from="${node.id}"], .line[data-to="${node.id}"]`);
    lines.forEach(line => {
        const fromNode = document.getElementById(line.dataset.from);
        const toNode = document.getElementById(line.dataset.to);
        updateLine(line, fromNode, toNode);
    });
}
function updateLine(line, fromNode, toNode) {
    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();
    const mapRect = mindMapContainer.getBoundingClientRect();
    
    const fromX = (fromRect.left + fromRect.width / 2 - mapRect.left) / mindMap.style.transform.match(/scale\((.*?)\)/)[1];
    const fromY = (fromRect.top + fromRect.height / 2 - mapRect.top) / mindMap.style.transform.match(/scale\((.*?)\)/)[1];
    const toX = (toRect.left + toRect.width / 2 - mapRect.left) / mindMap.style.transform.match(/scale\((.*?)\)/)[1];
    const toY = (toRect.top + toRect.height / 2 - mapRect.top) / mindMap.style.transform.match(/scale\((.*?)\)/)[1];
    
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    
    line.style.width = `${length}px`;
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;
}

function editNodeText(e) {
    const node = e.target;
    const text = prompt('Enter new text:', node.textContent);
    if (text !== null) {
        node.textContent = text;
    }
}

function addNode() {
    const x = Math.random() * (mindMap.clientWidth - 100);
    const y = Math.random() * (mindMap.clientHeight - 50);
    createNode(x, y);
}

function deleteNode() {
    if (selectedNode) {
        const lines = document.querySelectorAll(`.line[data-from="${selectedNode.id}"], .line[data-to="${selectedNode.id}"]`);
        lines.forEach(line => line.remove());
        selectedNode.remove();
        selectedNode = null;
    }
}

function changeNodeColor() {
    if (selectedNode) {
        selectedNode.style.backgroundColor = nodeColorPicker.value;
    }
}

function changeLineColor() {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        line.style.backgroundColor = lineColorPicker.value;
    });
}

mindMap.addEventListener('dblclick', (e) => {
    if (e.target === mindMap) {
        createNode(e.clientX - mindMap.offsetLeft, e.clientY - mindMap.offsetTop);
    }
});

addNodeBtn.addEventListener('click', addNode);
deleteNodeBtn.addEventListener('click', deleteNode);
nodeColorPicker.addEventListener('change', changeNodeColor);
lineColorPicker.addEventListener('change', changeLineColor);

createNode(400, 300);