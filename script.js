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

function createNode(x, y, text = 'New Node', color = getRandomColor()) {
    const node = document.createElement('div');
    node.className = 'node';
    node.id = `node-${nodeId++}`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.background = `linear-gradient(135deg, ${color}, ${getLighterColor(color)})`;
    node.textContent = text;
    node.draggable = true;
    
    node.addEventListener('dragstart', dragStart);
    node.addEventListener('dragend', dragEnd);
    node.addEventListener('click', selectNode);
    node.addEventListener('dblclick', editNodeText);
    
    mindMap.appendChild(node);
    animateNodeCreation(node);
    return node;
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
}

function getLighterColor(color) {
    const hsl = color.match(/\d+/g).map(Number);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${Math.min(hsl[2] + 15, 100)}%)`;
}

function animateNodeCreation(node) {
    node.style.opacity = '0';
    node.style.transform = 'scale(0.5)';
    setTimeout(() => {
        node.style.transition = 'all 0.3s ease';
        node.style.opacity = '1';
        node.style.transform = 'scale(1)';
    }, 50);
}


function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function dragEnd(e) {
    const rect = mindMapContainer.getBoundingClientRect();
    const zoom = parseFloat(zoomSlider.value);
    e.target.style.left = `${(e.clientX - rect.left) / zoom}px`;
    e.target.style.top = `${(e.clientY - rect.top) / zoom}px`;
    updateLines(e.target);
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

    line.style.opacity = '0';
    line.style.transition = 'none';
    setTimeout(() => {
        line.style.transition = 'all 0.3s ease';
        line.style.opacity = '1';
    }, 50);
}


function selectNode(e) {
    const node = e.target;
    if (isConnecting) {
        selectedNodes.push(node);
        node.classList.add('selected');
        if (selectedNodes.length === 2) {
            connectNodes(selectedNodes[0], selectedNodes[1]);
            selectedNodes.forEach(n => n.classList.remove('selected'));
            selectedNodes = [];
            isConnecting = false;
            connectNodesBtn.textContent = 'Connect Nodes';
        }
    } else {
        if (node.classList.contains('selected')) {
            node.classList.remove('selected');
        } else {
            node.classList.add('selected');
        }
    }
}

function editNodeText(e) {
    const node = e.target;
    const text = prompt('Enter new text:', node.textContent);
    if (text !== null) {
        node.textContent = text;
    }
}

function addNode() {
    const x = Math.random() * (mindMapContainer.clientWidth - 100);
    const y = Math.random() * (mindMapContainer.clientHeight - 50);
    createNode(x, y);
}

function deleteNode() {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        const lines = document.querySelectorAll(`.line[data-from="${node.id}"], .line[data-to="${node.id}"]`);
        lines.forEach(line => line.remove());
        node.remove();
    });
}

function connectNodes(node1, node2) {
    const line = document.createElement('div');
    line.className = 'line';
    line.dataset.from = node1.id;
    line.dataset.to = node2.id;
    line.style.backgroundColor = lineColorPicker.value;
    mindMap.appendChild(line);
    updateLine(line, node1, node2);
    
    [node1, node2].forEach(node => {
        node.style.transition = 'all 0.3s ease';
        node.style.transform = 'scale(1.1)';
        setTimeout(() => {
            node.style.transform = 'scale(1)';
        }, 300);
    });
}


function changeNodeColor() {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        node.style.backgroundColor = nodeColorPicker.value;
    });
}

function changeLineColor() {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        line.style.backgroundColor = lineColorPicker.value;
    });
}

function saveMap() {
    const nodes = Array.from(document.querySelectorAll('.node')).map(node => ({
        id: node.id,
        x: node.style.left,
        y: node.style.top,
        text: node.textContent,
        color: node.style.backgroundColor
    }));
    
    const lines = Array.from(document.querySelectorAll('.line')).map(line => ({
        from: line.dataset.from,
        to: line.dataset.to,
        color: line.style.backgroundColor
    }));
    
    const mapData = { nodes, lines };
    localStorage.setItem('mindMap', JSON.stringify(mapData));
    alert('Mind map saved!');
}

function loadMap() {
    const mapData = JSON.parse(localStorage.getItem('mindMap'));
    if (mapData) {
        mindMap.innerHTML = '';
        nodeId = 0;
        
        mapData.nodes.forEach(nodeData => {
            const node = createNode(
                parseFloat(nodeData.x),
                parseFloat(nodeData.y),
                nodeData.text,
                nodeData.color
            );
            node.id = nodeData.id;
        });
        
        mapData.lines.forEach(lineData => {
            const fromNode = document.getElementById(lineData.from);
            const toNode = document.getElementById(lineData.to);
            const line = document.createElement('div');
            line.className = 'line';
            line.dataset.from = lineData.from;
            line.dataset.to = lineData.to;
            line.style.backgroundColor = lineData.color;
            mindMap.appendChild(line);
            updateLine(line, fromNode, toNode);
        });
        
        alert('Mind map loaded!');
    } else {
        alert('No saved mind map found!');
    }
}

function updateZoom() {
    const zoom = zoomSlider.value;
    mindMap.style.transform = `scale(${zoom})`;
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        const fromNode = document.getElementById(line.dataset.from);
        const toNode = document.getElementById(line.dataset.to);
        updateLine(line, fromNode, toNode);
    });
}

mindMapContainer.addEventListener('dblclick', (e) => {
    if (e.target === mindMap) {
        const rect = mindMapContainer.getBoundingClientRect();
        const zoom = parseFloat(zoomSlider.value);
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        createNode(x, y);
    }
});

addNodeBtn.addEventListener('click', addNode);
deleteNodeBtn.addEventListener('click', deleteNode);
connectNodesBtn.addEventListener('click', () => {
    isConnecting = !isConnecting;
    connectNodesBtn.textContent = isConnecting ? 'Cancel Connection' : 'Connect Nodes';
    selectedNodes = [];
    document.querySelectorAll('.node.selected').forEach(node => node.classList.remove('selected'));
});

nodeColorPicker.addEventListener('change', changeNodeColor);
lineColorPicker.addEventListener('change', changeLineColor);
saveMapBtn.addEventListener('click', saveMap);
loadMapBtn.addEventListener('click', loadMap);
zoomSlider.addEventListener('input', updateZoom);

createNode(400, 300);