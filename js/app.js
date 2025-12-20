const CONFIG = {
    API_URL: 'https://raw.githubusercontent.com/Pokeminers/game_masters/master/latest/JSON/v2/pokemon_stats.json',
    IMG: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

let pokemonList = [];
let compareList = [];

// Início da aplicação
async function start() {
    try {
        const res = await fetch(CONFIG.API_URL);
        const data = await res.json();
        
        // Filtra para pegar apenas formas base e ordena por ataque
        pokemonList = data
            .filter(p => p.form === "Normal" || !p.form)
            .sort((a, b) => b.stats.attack - a.stats.attack)
            .slice(0, 200);

        render(pokemonList);
    } catch (err) {
        document.getElementById('grid').innerHTML = `<p class="col-span-full text-center text-red-500">Erro ao carregar API PokéMiners.</p>`;
    }
}

// Renderização dos cards
function render(list) {
    const grid = document.getElementById('grid');
    grid.innerHTML = list.map(p => {
        const isSelected = compareList.find(c => c.pokedex_id === p.pokedex_id);
        return `
        <div onclick="toggleCompare(${p.pokedex_id})" class="glass-card rounded-3xl p-6 cursor-pointer ${isSelected ? 'selected-card' : ''}">
            <div class="text-[10px] font-bold opacity-30 mb-2">#${String(p.pokedex_id).padStart(3, '0')}</div>
            <img src="${CONFIG.IMG}${p.pokedex_id}.png" class="w-full h-32 object-contain mb-4 drop-shadow-lg" onerror="this.src='https://via.placeholder.com/150?text=?'">
            <h3 class="font-bold text-center text-lg capitalize mb-4">${p.name.replace(/_/g, ' ')}</h3>
            <div class="space-y-3">
                <div>
                    <div class="flex justify-between text-[10px] mb-1"><span>ATAQUE</span> <b>${p.stats.attack}</b></div>
                    <div class="stat-bar-container"><div class="stat-fill bg-orange-500" style="width:${(p.stats.attack/400)*100}%"></div></div>
                </div>
                <div>
                    <div class="flex justify-between text-[10px] mb-1"><span>DEFESA</span> <b>${p.stats.defense}</b></div>
                    <div class="stat-bar-container"><div class="stat-fill bg-blue-500" style="width:${(p.stats.defense/400)*100}%"></div></div>
                </div>
            </div>
        </div>
    `}).join('');
    document.getElementById('compareCount').innerText = `${compareList.length}/2 Selecionados`;
}

// Lógica de Seleção e Comparação
function toggleCompare(id) {
    const poke = pokemonList.find(p => p.pokedex_id === id);
    const index = compareList.findIndex(c => c.pokedex_id === id);

    if (index > -1) {
        compareList.splice(index, 1);
    } else if (compareList.length < 2) {
        compareList.push(poke);
    }

    render(pokemonList);
    if (compareList.length === 2) showModal();
}

function showModal() {
    const modal = document.getElementById('compareModal');
    const content = document.getElementById('compareContent');
    modal.classList.remove('hidden');
    
    content.innerHTML = `
        ${renderCompareSide(compareList[0])}
        <div class="flex flex-col items-center justify-center">
            <div class="bg-blue-600 text-white font-black rounded-full w-16 h-16 flex items-center justify-center shadow-xl shadow-blue-500/50">VS</div>
        </div>
        ${renderCompareSide(compareList[1])}
    `;
}

function renderCompareSide(p) {
    return `
        <div class="text-center p-4">
            <img src="${CONFIG.IMG}${p.pokedex_id}.png" class="w-48 h-48 mx-auto mb-4">
            <h2 class="text-3xl font-black capitalize mb-6">${p.name.replace(/_/g, ' ')}</h2>
            <div class="space-y-4">
                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border dark:border-slate-700">
                    <span class="block text-3xl font-bold text-blue-500">${p.stats.attack}</span>
                    <span class="text-[10px] uppercase tracking-widest opacity-60">Ataque Base</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border dark:border-slate-700">
                    <span class="block text-3xl font-bold text-green-500">${p.stats.defense}</span>
                    <span class="text-[10px] uppercase tracking-widest opacity-60">Defesa Base</span>
                </div>
            </div>
        </div>
    `;
}

function closeCompare() {
    compareList = [];
    document.getElementById('compareModal').classList.add('hidden');
    render(pokemonList);
}

// Controle de Tema
document.getElementById('themeBtn').onclick = () => {
    document.documentElement.classList.toggle('dark');
};

// Barra de Busca
document.getElementById('searchInput').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = pokemonList.filter(p => p.name.toLowerCase().includes(term));
    render(filtered);
};

start();
