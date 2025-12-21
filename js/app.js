const CONFIG = {
    // Usando a PokeAPI oficial (mais estável para GitHub Pages)
    API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=100',
    IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

let pokemonList = [];
let compareList = [];

async function start() {
    const grid = document.getElementById('grid');
    const loadingMsg = document.getElementById('loadingMsg');

    try {
        const res = await fetch(CONFIG.API_URL);
        if (!res.ok) throw new Error('Falha na rede');
        
        const data = await res.json();
        
        // Transformar os dados para o formato que o nosso site usa
        pokemonList = data.results.map((p, index) => {
            const id = index + 1;
            return {
                name: p.name,
                id: id,
                // Gerando stats aleatórios para o Meta, já que a lista básica não traz stats
                attack: Math.floor(Math.random() * (150 - 50) + 50),
                defense: Math.floor(Math.random() * (150 - 40) + 40)
            };
        });

        // Remove a mensagem de carregamento e mostra os dados
        if (loadingMsg) loadingMsg.remove();
        render(pokemonList);

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p class="col-span-full text-red-500">Erro: Não foi possível carregar os Pokémon. Verifique sua conexão.</p>`;
    }
}

function render(list) {
    const grid = document.getElementById('grid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = `<p class="col-span-full opacity-50">Nenhum Pokémon encontrado.</p>`;
        return;
    }

    grid.innerHTML = list.map(p => {
        const isSelected = compareList.find(c => c.id === p.id);
        return `
        <div onclick="toggleCompare(${p.id})" class="bg-white p-6 rounded-2xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'} cursor-pointer hover:shadow-md transition-all">
            <img src="${CONFIG.IMG_BASE}${p.id}.png" class="w-24 h-24 mx-auto mb-4" loading="lazy">
            <h3 class="font-bold capitalize text-gray-800">${p.name}</h3>
            <div class="mt-3 flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Atk: ${p.attack}</span>
                <span>Def: ${p.defense}</span>
            </div>
        </div>
    `}).join('');
    
    document.getElementById('compareCount').innerText = `${compareList.length}/2 Selecionados`;
}

function toggleCompare(id) {
    const poke = pokemonList.find(p => p.id === id);
    const index = compareList.findIndex(c => c.id === id);

    if (index > -1) {
        compareList.splice(index, 1);
    } else if (compareList.length < 2) {
        compareList.push(poke);
    }

    render(pokemonList);

    if (compareList.length === 2) {
        showCompareModal();
    }
}

function showCompareModal() {
    const modal = document.getElementById('compareModal');
    const content = document.getElementById('compareContent');
    modal.classList.remove('hidden');
    
    content.innerHTML = `
        <div class="p-4">
            <img src="${CONFIG.IMG_BASE}${compareList[0].id}.png" class="w-32 h-32 mx-auto">
            <h2 class="text-xl font-bold capitalize mt-2">${compareList[0].name}</h2>
            <p class="text-blue-600 font-bold">ATK: ${compareList[0].attack}</p>
        </div>
        <div class="text-3xl font-black text-gray-200">VS</div>
        <div class="p-4">
            <img src="${CONFIG.IMG_BASE}${compareList[1].id}.png" class="w-32 h-32 mx-auto">
            <h2 class="text-xl font-bold capitalize mt-2">${compareList[1].name}</h2>
            <p class="text-blue-600 font-bold">ATK: ${compareList[1].attack}</p>
        </div>
    `;
}

function closeCompare() {
    compareList = [];
    document.getElementById('compareModal').classList.add('hidden');
    render(pokemonList);
}

const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    // Mostra/Esconde o X conforme o usuário digita
    if (term.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
    
    render(pokemonList.filter(p => p.name.includes(term)));
});

// Ação de limpar ao clicar no X
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    render(pokemonList); // Volta a lista completa
    searchInput.focus();
});

// Escuta a barra de pesquisa
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = pokemonList.filter(p => p.name.includes(term));
    render(filtered);
});

// Inicializa
start();
