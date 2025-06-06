// Atualização do relógio
function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clockElement.textContent = timeString;
}

// Iniciar relógio e atualizá-lo a cada segundo
setInterval(updateClock, 1000);
updateClock();

// Formatação de data
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

// Formatação de hora
function formatTime(dateString) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString('pt-BR', options);
}

// Atualização da informação de última mudança
function updateLastChange(changeInfo) {
    if (!changeInfo) return;

    const lastChangeInlineElement = document.getElementById('lastChangeInline');
    const date = new Date(changeInfo.timestamp);
    
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = formatTime(changeInfo.timestamp);
    
    let changeText = '';
    switch (changeInfo.type) {
        case 'create':
            changeText = `Created ID ${changeInfo.id}`;
            break;
        case 'update':
            changeText = `Edited ID ${changeInfo.id}`;
            break;
        case 'delete':
            changeText = `Deleted ID ${changeInfo.id}`;
            break;
    }

    // Update inline change info
    lastChangeInlineElement.textContent = `Last Change - ${formattedDate} - ${formattedTime} - ${changeText}`;

    // Add highlight animation
    lastChangeInlineElement.classList.add('highlight');
    setTimeout(() => lastChangeInlineElement.classList.remove('highlight'), 1000);
}

// Atualização da tabela de registros
function updateTable(data) {
    // Sort data by dataEdicao in descending order
    const sortedData = [...data].sort((a, b) => {
        return new Date(b.dataEdicao) - new Date(a.dataEdicao);
    });

    const tbody = document.getElementById('registrosTabela');
    const currentRows = new Set([...tbody.children].map(row => row.dataset.id));
    const newRows = new Set(sortedData.map(record => record.id.toString()));

    // Remover registros que não existem mais
    for (const row of tbody.children) {
        if (!newRows.has(row.dataset.id)) {
            row.remove();
        }
    }

    // Clear table before adding sorted records
    tbody.innerHTML = '';

    sortedData.forEach(record => {
        const rowContent = `
            <td>${record.id}</td>
            <td>${record.name}</td>
            <td>${record.occupation}</td>
            <td>${formatDate(record.dataCriacao)}</td>
            <td>${formatDate(record.dataEdicao)}</td>
        `;

        const newRow = document.createElement('tr');
        newRow.dataset.id = record.id;
        newRow.innerHTML = rowContent;
        
        // Add highlight class if it's a new or updated record
        if (!currentRows.has(record.id.toString())) {
            newRow.classList.add('highlight');
            setTimeout(() => newRow.classList.remove('highlight'), 1000);
        }
        
        tbody.appendChild(newRow);
    });
}

// Extrair UUID da URL
function getUuidFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const uuidIndex = pathParts.findIndex(part => 
        part.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    );
    
    return uuidIndex !== -1 ? pathParts[uuidIndex] : null;
}

// Carregar dados iniciais
async function loadInitialData() {
    try {
        // Get the API path by removing /view from current path
        const uuid = getUuidFromUrl();
        const pathPrefix = window.location.pathname.includes('/proxy/3006') ? '/proxy/3006' : 
                          window.location.pathname.includes('/proxy/3007') ? '/proxy/3007' : '';
        const apiPath = uuid ? `${pathPrefix}/${uuid}` : pathPrefix || '/';
        
        console.log('Loading data from API path:', apiPath);
        console.log('Current location:', window.location.pathname);
        
        const response = await fetch(apiPath, {
            headers: {
                'Authorization': 'Bearer uzJtmYh8DrCuAK5td3APLxvYds704hOslXZJd7a'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateTable(data);
        } else {
            console.error('Erro ao carregar dados:', response.status, response.statusText);
            console.error('Failed URL:', apiPath);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Configuração do WebSocket
function setupWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    
    // Usar o caminho completo incluindo o UUID
    const wsPath = window.location.pathname.replace(/\/view$/, '');
    const wsUrl = `${wsProtocol}//${wsHost}${wsPath}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
        try {
            console.log('WebSocket message received:', event.data);
            const message = JSON.parse(event.data);
            if (message.type === 'update') {
                updateTable(message.data);
                if (message.changeInfo) {
                    updateLastChange(message.changeInfo);
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem do WebSocket:', error);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket desconectado. Tentando reconectar em 5 segundos...');
        setTimeout(setupWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
    };

    // Adicionar listener para reconectar quando a página voltar a ficar online
    window.addEventListener('online', setupWebSocket);
}

// Examples section functionality
function setupExamplesSection() {
    const toggleBtn = document.getElementById('toggleExamples');
    const examplesContainer = document.getElementById('examplesContainer');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const copyBtns = document.querySelectorAll('.copy-btn');
    
    // Toggle examples container visibility
    toggleBtn.addEventListener('click', () => {
        examplesContainer.classList.toggle('active');
        if (examplesContainer.classList.contains('active')) {
            generateExamples();
        }
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Copy functionality
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const textToCopy = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Visual feedback
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });
}

// Generate example commands
function generateExamples() {
    const uuid = getUuidFromUrl() || 'default';
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const authToken = 'Bearer uzJtmYh8DrCuAK5td3APLxvYds704hOslXZJd7a';
    
    // Get the path prefix from the current URL
    const pathPrefix = window.location.pathname.includes('/proxy/3006') ? '/proxy/3006' : '';
    
    // CREATE example (POST)
    document.getElementById('createExample').textContent = 
        `curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${authToken}" \\
  -d '{"name":"Example Name","occupation":"Example Job"}' \\
  ${baseUrl}${pathPrefix}/${uuid}`;
    
    // READ examples with separate copy buttons (GET)
    // Get all records
    document.getElementById('readAllExample').textContent = 
        `curl -X GET \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}`;
    
    // Filter by ID
    document.getElementById('readByIdExample').textContent = 
        `curl -X GET \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}?id=1`;
    
    // Filter by name
    document.getElementById('readByNameExample').textContent = 
        `curl -X GET \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}?name=example`;
    
    // Filter by profession
    document.getElementById('readByProfessionExample').textContent = 
        `curl -X GET \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}?occupation=developer`;
    
    // Combine multiple filters
    document.getElementById('readCombinedExample').textContent = 
        `curl -X GET \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}?name=john&occupation=developer`;
    
    // UPDATE example (PUT)
    document.getElementById('updateExample').textContent = 
        `curl -X PUT \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${authToken}" \\
  -d '{"name":"Updated Name","occupation":"Updated Job"}' \\
  ${baseUrl}${pathPrefix}/${uuid}/1`;
    
    // DELETE example (DELETE)
    document.getElementById('deleteExample').textContent = 
        `curl -X DELETE \\
  -H "Authorization: ${authToken}" \\
  ${baseUrl}${pathPrefix}/${uuid}/1`;
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupWebSocket();
    setupExamplesSection();
});
