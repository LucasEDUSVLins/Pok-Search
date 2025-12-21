/**
 * POKÉMETA - Versão Mestre (Cores, Proteção e Dados Reais)
 */

const CONFIG = {
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=1025',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

// Mapa de Cores (Tailwind)
const TYPE_COLORS = {
  fire: 'from-orange-500 to-red-600',
  water: 'from-blue-500 to-cyan-600',
  grass: 'from-green-500 to-emerald-600',
  electric: 'from-yellow-400 to-yellow-600',
  psychic: 'from-pink-500 to-purple-600',
  ice: 'from-cyan-400 to-blue-400',
  dragon: 'from-purple-600 to-indigo-700',
  dark: 'from-gray-700 to-black',
  fairy: 'from-pink-300 to-rose-400',
  normal: 'from-gray-400 to-gray-500',
  fighting: 'from-orange-700 to-red-800',
  flying: 'from-sky-400 to-blue-500',
  poison: 'from-purple-500 to-fuchsia-600',
  ground: 'from-amber-600 to-orange-700',
  rock: 'from-stone-500 to-stone-700',
  bug: 'from-lime-500 to-green-600',
  ghost: 'from-indigo-800 to-purple-900',
  steel: 'from-slate-400 to-gray-500'
};

let pokemonList = [];
let compareList = [];

const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');

// --- INICIALIZAÇÃO BLINDADA (Restaurada) ---
async function start() {
  try {
    // Timeout de segurança
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(CONFIG.API_URL, { signal: controller.signal });
    clearTimeout(timeoutId); // Cancela o timeout se der certo

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    pokemonList = data.results.map((p) => ({
      name: p.name,
      id: parseInt(p.url.split('/')[6])
    }));

    if (grid) grid.innerHTML = '';
    render(pokemonList);

  } catch (err) {
    console.error("Erro Blindado:", err);
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <p class="text-red-500 font-bold mb-4">Falha na conexão.</p>
          <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700">Tentar Novamente</button>
        </div>
      `;
    }
  }
}

function render(list) {
  if (!grid) return;
  grid.innerHTML = '';
  
  // Mostra os 100 primeiros ou o resultado da busca para performance
  const displayList = searchInput.value.length > 0 ? list : list.slice(0, 100);

  grid.innerHTML = displayList.map(p => {
    const isSelected = compareList.find(c => c.id === p.id);
    return `
      <div class="relative group bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 ${isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'}">
        <button onclick="showDetails(${p.id})" class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all z-10 font-bold">i</button>
        <div onclick="toggleCompare(${p.id})" class="cursor-pointer">
          <img src="${CONFIG.IMG_BASE}${p.id}.png" class="w-24 h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" loading="lazy">
          <h3 class="font-bold capitalize text-gray-800 tracking-tight">${p.name}</h3>
          <p class="text-[10px] text-gray-400 font-bold mt-1">#${String(p.id).padStart(3, '0')}</p>
        </div>
      </div>
    `;
  }).join('');
}

// --- DETALHES COM CORES DINÂMICAS ---
async function showDetails(id) {
  const modal = document.getElementById('detailsModal');
  const content = document.getElementById('detailsContent');
  
  if (!modal || !content) return;

  modal.classList.remove('hidden');
  content.innerHTML = `<div class="p-10 text-center animate-pulse text-xs font-bold text-gray-400">BUSCANDO DADOS...</div>`;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    
    // Cores Dinâmicas
    const mainType = data.types[0].type.name;
    const bgGradient = TYPE_COLORS[mainType] || 'from-gray-500 to-gray-600';
    const typesHTML = data.types.map(t => `<span class="px-3 py-1 bg-white/20 text-white backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">${t.type.name}</span>`).join(' ');

    content.innerHTML = `
      <div class="bg-gradient-to-b ${bgGradient} p-8 text-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 pattern-dots"></div>
        <img src="${CONFIG.IMG_BASE}${id}.png" class="w-44 h-44 mx-auto drop-shadow-2xl relative z-10 hover:scale-110 transition-transform duration-500">
      </div>
      
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <div class="text-left">
            <h2 class="text-3xl font-black capitalize text-gray-800 leading-none">${data.name}</h2>
            <span class="text-xs font-bold text-gray-400">#${String(id).padStart(3, '0')}</span>
          </div>
          <div class="flex gap-1">${typesHTML}</div>
        </div>

        <div class="space-y-4 text-left">
          ${renderStatBar('HP', data.stats[0].base_stat, 'bg-green-500')}
          ${renderStatBar('ATAQUE', data.stats[1].base_stat, 'bg-red-500')}
          ${renderStatBar('DEFESA', data.stats[2].base_stat, 'bg-blue-500')}
          ${renderStatBar('VELOCIDADE', data.stats[5].base_stat, 'bg-yellow-500')}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-10 text-center text-red-500">Erro ao carregar dados.</div>`;
  }
}

// Função de fechar (Compatível com seu HTML onclick)
function closeDetails() {
  const modal = document.getElementById('detailsModal');
  if (modal) modal.classList.add('hidden');
}

function renderStatBar(label, value, color) {
  const width = Math.min((value / 160) * 100, 100);
  return `
    <div>
      <div class="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase tracking-wider">
        <span>${label}</span>
        <span>${value}</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2 shadow-inner">
        <div class="${color} h-2 rounded-full transition-all duration-1000" style="width: ${width}%"></div>
      </div>
    </div>
  `;
}

// --- COMPARAÇÃO ---
function toggleCompare(id) {
  const poke = pokemonList.find(p => p.id === id);
  const index = compareList.findIndex(c => c.id === id);
  
  if (index > -1) compareList.splice(index, 1);
  else if (compareList.length < 2) compareList.push(poke);
  
  render(pokemonList);
  if (compareList.length === 2) showCompareModal();
}

async function showCompareModal() {
  const modal = document.getElementById('compareModal');
  const content = document.getElementById('compareContent');
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="col-span-full p-10 text-center animate-pulse text-xs text-gray-400 font-bold">COMPARANDO...</div>`;

  const [p1, p2] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[0].id}`).then(r => r.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[1].id}`).then(r => r.json())
  ]);

  content.innerHTML = `
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${p1.id}.png" class="w-32 h-32 mx-auto drop-shadow-lg">
      <h2 class="text-xl font-black capitalize text-gray-800 mt-2">${p1.name}</h2>
      <div class="mt-3 flex justify-center gap-4 text-xs font-bold">
         <span class="text-red-500">ATK: ${p1.stats[1].base_stat}</span>
         <span class="text-blue-500">DEF: ${p1.stats[2].base_stat}</span>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-white text-lg">VS</div>
    </div>
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${p2.id}.png" class="w-32 h-32 mx-auto drop-shadow-lg">
      <h2 class="text-xl font-black capitalize text-gray-800 mt-2">${p2.name}</h2>
      <div class="mt-3 flex justify-center gap-4 text-xs font-bold">
         <span class="text-red-500">ATK: ${p2.stats[1].base_stat}</span>
         <span class="text-blue-500">DEF: ${p2.stats[2].base_stat}</span>
      </div>
    </div>
  `;
}

function closeCompare() {
  compareList = [];
  document.getElementById('compareModal').classList.add('hidden');
  render(pokemonList);
}

// --- BUSCA ---
searchInput?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  term.length > 0 ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');
  render(pokemonList.filter(p => p.name.includes(term)));
});

clearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  render(pokemonList);
  searchInput.focus();
});

start();
