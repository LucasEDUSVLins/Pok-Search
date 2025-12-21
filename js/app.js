const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=150';
const IMG_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

let pokemonList = [];
let compareList = [];

async function start() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        // Mapeia os dados básicos
        pokemonList = data.results.map((p, index) => ({
            name: p.name,
            id: index + 1,
            stats: { 
                attack: Math.floor(Math.random() * 100) + 50, // Mock de stats se a API for simples
                defense: Math.floor(Math.random() * 100) + 40 
            }
        }));

        document.getElementById('loadingMsg').classList.add('hidden');
        render(pokemonList);
    } catch (err) {
        document.getElementById('grid').innerHTML = `<p class="col-span-full text-red-500 text-center">Erro ao conectar com a API: ${err.message}</p>`;
    }
}

function render(list) {
    const grid = document.getElementById('grid');
    grid.innerHTML = list.map(p => `
        <div onclick="toggleCompare(${p.id})" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all">
            <img src="${IMG_BASE}${p.id}.png" class="w-32 h-32 mx-auto mb-4">
            <h3 class="font-bold capitalize text-lg">${p.name}</h3>
            <p class="text-sm text-gray-500">Clique para comparar</p>
        </div>
    `).join('');
    document.getElementById('compareCount').innerText = `${compareList.length}/2 Selecionados`;
}

function toggleCompare(id) {
    const poke = pokemonList.find(p => p.id === id);
    const index = compareList.findIndex(c => c.id === id);

    if (index > -1) compareList.splice(index, 1);
    else if (compareList.length < 2) compareList.push(poke);

    render(pokemonList);
    if (compareList.length === 2) {
        const content = document.getElementById('compareContent');
        document.getElementById('compareModal').classList.remove('hidden');
        content.innerHTML = compareList.map(p => `
            <div>
                <img src="${IMG_BASE}${p.id}.png" class="w-32 h-32 mx-auto">
                <h2 class="text-xl font-bold capitalize">${p.name}</h2>
            </div>
        `).join('<div class="text-2xl font-bold text-blue-600">VS</div>');
    }
}

function closeCompare() {
    compareList = [];
    document.getElementById('compareModal').classList.add('hidden');
    render(pokemonList);
}

document.getElementById('searchInput').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    render(pokemonList.filter(p => p.name.includes(term)));
};

start();
