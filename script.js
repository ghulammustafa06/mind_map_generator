let nodeId = 0;
let selectedNodes = [];
let isConnecting = false;
let currentLineStyle = 'solid';

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
const nodeShapeSelect = document.getElementById('node-shape');
const textBoldBtn = document.getElementById('text-bold');
const textItalicBtn = document.getElementById('text-italic');
const textUnderlineBtn = document.getElementById('text-underline');
const miniMap = document.getElementById('mini-map');
const lineStyleSelect = document.getElementById('line-style');



function createNode(x, y, text = 'New Node', color = getRandomColor(), shape = 'rectangle') {
    const node = document.createElement('div');
    node.className = `node ${shape}`;
    node.id = `node-${nodeId++}`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.background = `linear-gradient(135deg, ${color}, ${getLighterColor(color)})`;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    node.appendChild(textSpan);
    
    mindMap.appendChild(node);
    animateNodeCreation(node);
    makeNodeDraggable(node);
    updateMiniMap();
    return node;
}

function animateNodeCreation(node) {
    gsap.from(node, {
        duration: 0.5,
        scale: 0,
        opacity: 0,
        ease: "back.out(1.7)"
    });
}

function makeNodeDraggable(node) {
    Draggable.create(node, {
        bounds: mindMapContainer,
        onDrag: function() {
            updateLines(this.target);
        },
        onDragEnd: function() {
            updateMiniMap();
        }
    });

    node.addEventListener('dblclick', editNodeText);
}

function getRandomColor() {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
}

function getLighterColor(color) {
    const hsl = color.match(/\d+/g).map(Number);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${Math.min(hsl[2] + 15, 100)}%)`;
}

function updateLines(node) {
    const lines = document.querySelectorAll(`.line[data-from="${node.id}"], .line[data-to="${node.id}"]`);
    lines.forEach(line => {
        const fromNode = document.getElementById(line.dataset.from);
        const toNode = document.getElementById(line.dataset.to);
        updateLine(line, fromNode, toNode);
    });
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
    
    const fromX = fromRect.left + fromRect.width / 2 - mapRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - mapRect.top;
    const toX = toRect.left + toRect.width / 2 - mapRect.left;
    const toY = toRect.top + toRect.height / 2 - mapRect.top;
    
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    
    line.style.width = `${length}px`;
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    line.style.transform = `rotate(${angle}deg)`;

    const arrow = line.querySelector('.arrow');
    if (arrow) {
        arrow.style.right = '0';
        arrow.style.transform = 'rotate(180deg)';
    }
}


function selectNode(e) {
    const node = e.target.closest('.node');
    if (node) {
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
            node.classList.toggle('selected');
        }
    }
}

function connectNodes(node1, node2) {
    const line = document.createElement('div');
    line.className = 'line';
    line.dataset.from = node1.id;
    line.dataset.to = node2.id;
    line.style.backgroundColor = lineColorPicker.value;
    mindMap.appendChild(line);
    updateLine(line, node1, node2);
    
    gsap.from(line, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
    });
}

function editNodeText(e) {
    const node = e.target.closest('.node');
    const textSpan = node.firstChild;
    const newText = prompt('Enter new text:', textSpan.textContent);
    if (newText !== null) {
        textSpan.textContent = newText;
    }
}

function deleteSelectedNodes() {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        const lines = document.querySelectorAll(`.line[data-from="${node.id}"], .line[data-to="${node.id}"]`);
        lines.forEach(line => line.remove());
        gsap.to(node, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                node.remove();
                updateMiniMap();
            }
        });
    });
}

function updateNodeColor() {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        const color = nodeColorPicker.value;
        node.style.background = `linear-gradient(135deg, ${color}, ${getLighterColor(color)})`;
    });
}

function updateLineColor() {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        line.style.backgroundColor = lineColorPicker.value;
    });
}

function updateNodeShape() {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        node.className = `node ${nodeShapeSelect.value}`;
    });
}

function applyTextStyle(style) {
    const selectedNodes = document.querySelectorAll('.node.selected');
    selectedNodes.forEach(node => {
        const textSpan = node.firstChild;
        switch (style) {
            case 'bold':
                textSpan.style.fontWeight = textSpan.style.fontWeight === 'bold' ? 'normal' : 'bold';
                break;
            case 'italic':
                textSpan.style.fontStyle = textSpan.style.fontStyle === 'italic' ? 'normal' : 'italic';
                break;
            case 'underline':
                textSpan.style.textDecoration = textSpan.style.textDecoration === 'underline' ? 'none' : 'underline';
                break;
        }
    });
}

function updateZoom() {
    const zoom = zoomSlider.value;
    gsap.to(mindMap, {
        scale: zoom,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => {
            const lines = document.querySelectorAll('.line');
            lines.forEach(line => {
                const fromNode = document.getElementById(line.dataset.from);
                const toNode = document.getElementById(line.dataset.to);
                updateLine(line, fromNode, toNode);
            });
        },
        onComplete: updateMiniMap
    });
}

function updateMiniMap() {
    const mapRect = mindMapContainer.getBoundingClientRect();
    const scale = Math.min(miniMap.clientWidth / mapRect.width, miniMap.clientHeight / mapRect.height);
    
    miniMap.innerHTML = '';
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        const nodeRect = node.getBoundingClientRect();
        const miniNode = document.createElement('div');
        miniNode.style.position = 'absolute';
        miniNode.style.left = `${(nodeRect.left - mapRect.left) * scale}px`;
        miniNode.style.top = `${(nodeRect.top - mapRect.top) * scale}px`;
        miniNode.style.width = `${nodeRect.width * scale}px`;
        miniNode.style.height = `${nodeRect.height * scale}px`;
        miniNode.style.backgroundColor = node.style.backgroundColor;
        miniNode.style.borderRadius = '50%';
        miniMap.appendChild(miniNode);
    });
}

function saveMap() {
    const nodes = Array.from(document.querySelectorAll('.node')).map(node => ({
        id: node.id,
        x: node.style.left,
        y: node.style.top,
        text: node.firstChild.textContent,
        color: node.style.background,
        shape: node.className.split(' ')[1],
        fontWeight: node.firstChild.style.fontWeight,
        fontStyle: node.firstChild.style.fontStyle,
        textDecoration: node.firstChild.style.textDecoration
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
                nodeData.color.split(',')[1].trim(),
                nodeData.shape
            );
            node.id = nodeData.id;
            node.firstChild.style.fontWeight = nodeData.fontWeight;
            node.firstChild.style.fontStyle = nodeData.fontStyle;
            node.firstChild.style.textDecoration = nodeData.textDecoration;
        });
        
        mapData.lines.forEach(lineData => {
            const fromNode = document.getElementById(lineData.from);
            const toNode = document.getElementById(lineData.to);
            connectNodes(fromNode, toNode);
        });
        
        updateMiniMap();
        alert('Mind map loaded!');
    } else {
        alert('No saved mind map found!');
    }
}

mindMapContainer.addEventListener('click', selectNode);
addNodeBtn.addEventListener('click', () => {
    const x = Math.random() * (mindMapContainer.clientWidth - 100);
    const y = Math.random() * (mindMapContainer.clientHeight - 50);
    createNode(x, y);
});

deleteNodeBtn.addEventListener('click', deleteSelectedNodes);
connectNodesBtn.addEventListener('click', () => {
    isConnecting = !isConnecting;
    connectNodesBtn.textContent = isConnecting ? 'Cancel Connection' : 'Connect Nodes';
    selectedNodes = [];
    document.querySelectorAll('.node.selected').forEach(node => node.classList.remove('selected'));
});
nodeColorPicker.addEventListener('change', updateNodeColor);
lineColorPicker.addEventListener('change', updateLineColor);
nodeShapeSelect.addEventListener('change', updateNodeShape);
textBoldBtn.addEventListener('click', () => applyTextStyle('bold'));
textItalicBtn.addEventListener('click', () => applyTextStyle('italic'));
textUnderlineBtn.addEventListener('click', () => applyTextStyle('underline'));
zoomSlider.addEventListener('input', updateZoom);
saveMapBtn.addEventListener('click', saveMap);
loadMapBtn.addEventListener('click', loadMap);

createNode(400, 300, 'Central Idea');
updateMiniMap();