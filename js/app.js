/**
 * POKÉMETA - Versão Final Estabilizada
 */

const CONFIG = {
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=1025',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

let pokemonList = [];
let compareList = [];

// Cache de Elementos
const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');

async function start() {
  try {
    const res = await fetch(CONFIG.API_URL);
    const data = await res.json();
    pokemonList = data.results.map((p) => ({
      name: p.name,
      id: parseInt(p.url.split('/')[6])
    }));
    if (grid) grid.innerHTML = '';
    render(pokemonList);
  } catch (err) {
    console.error("Erro ao iniciar:", err);
  }
}

function render(list) {
  if (!grid) return;
  grid.innerHTML = '';
  
  // Lógica de exibição: 100 primeiros ou filtro de busca
  const isSearching = searchInput.value.length > 0;
  const displayList = isSearching ? list : list.slice(0, 100);

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

// FUNÇÃO DE ABRIR DETALHES
async function showDetails(id) {
  const modal = document.getElementById('detailsModal');
  const content = document.getElementById('detailsContent');
  
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="p-10 text-center animate-pulse text-xs font-bold text-gray-400">CARREGANDO...</div>`;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    
    const types = data.types.map(t => `<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">${t.type.name}</span>`).join(' ');

    content.innerHTML = `
      <div class="bg-gradient-to-b from-blue-500 to-blue-600 p-8 text-center">
        <img src="${CONFIG.IMG_BASE}${id}.png" class="w-40 h-40 mx-auto drop-shadow-2xl">
      </div>
      <div class="p-8">
        <div class="flex justify-between items-start mb-6 text-left">
          <h2 class="text-3xl font-black capitalize text-gray-800">${data.name}</h2>
          <div class="flex flex-wrap gap-1 justify-end">${types}</div>
        </div>
        <div class="space-y-4 text-left">
          ${renderStatBar('HP', data.stats[0].base_stat, 'bg-green-500')}
          ${renderStatBar('ATAQUE', data.stats[1].base_stat, 'bg-red-500')}
          ${renderStatBar('DEFESA', data.stats[2].base_stat, 'bg-blue-500')}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-10 text-center text-red-500">Erro ao carregar dados oficiais.</div>`;
  }
}

// FUNÇÃO DE FECHAR DETALHES (CORRIGIDA)
function closeDetails() {
  document.getElementById('detailsModal').classList.add('hidden');
}

function renderStatBar(label, value, color) {
  const width = Math.min((value / 150) * 100, 100);
  return `
    <div>
      <div class="flex justify-between text-[10px] font-black text-gray-400 mb-1">
        <span>${label}</span>
        <span>${value}</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5">
        <div class="${color} h-1.5 rounded-full transition-all duration-1000" style="width: ${width}%"></div>
      </div>
    </div>
  `;
}

/**
 * COMPARAÇÃO
 */
function toggleCompare(id) {
  const poke = pokemonList.find(p => p.id === id);
  const index = compareList.findIndex(c => c.id === id);
  
  if (index > -1) {
    compareList.splice(index, 1);
  } else if (compareList.length < 2) {
    compareList.push(poke);
  }
  
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
      <img src="${CONFIG.IMG_BASE}${p1.id}.png" class="w-32 h-32 mx-auto">
      <h2 class="text-xl font-black capitalize text-gray-800">${p1.name}</h2>
      <div class="mt-2 text-[10px] font-bold text-gray-400">ATK: ${p1.stats[1].base_stat} | DEF: ${p1.stats[2].base_stat}</div>
    </div>
    <div class="flex flex-col items-center">
      <div class="bg-blue-600 text-white font-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg">VS</div>
    </div>
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${p2.id}.png" class="w-32 h-32 mx-auto">
      <h2 class="text-xl font-black capitalize text-gray-800">${p2.name}</h2>
      <div class="mt-2 text-[10px] font-bold text-gray-400">ATK: ${p2.stats[1].base_stat} | DEF: ${p2.stats[2].base_stat}</div>
    </div>
  `;
}

function closeCompare() {
  compareList = [];
  document.getElementById('compareModal').classList.add('hidden');
  render(pokemonList);
}

// BUSCA
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

// Inicializar
start();
