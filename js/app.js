/**
 * POKÉMETA - Versão Final (Cores HEX + Tradução de Tipos)
 */

const CONFIG = {
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=1025',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

const TRANSLATIONS = {
  fire: 'Fogo', water: 'Água', grass: 'Planta', electric: 'Elétrico',
  psychic: 'Psíquico', ice: 'Gelo', dragon: 'Dragão', dark: 'Sombrio',
  fairy: 'Fada', normal: 'Normal', fighting: 'Lutador', flying: 'Voador',
  poison: 'Venenoso', ground: 'Terrestre', rock: 'Pedra', bug: 'Inseto',
  ghost: 'Fantasma', steel: 'Aço'
};

const TYPE_COLORS = {
  fire:     ['#FB923C', '#DC2626'],
  water:    ['#60A5FA', '#2563EB'],
  grass:    ['#4ADE80', '#16A34A'],
  electric: ['#FACC15', '#CA8A04'],
  psychic:  ['#F472B6', '#9333EA'],
  ice:      ['#22D3EE', '#3B82F6'],
  dragon:   ['#818CF8', '#4F46E5'],
  dark:     ['#4B5563', '#111827'],
  fairy:    ['#F9A8D4', '#E11D48'],
  normal:   ['#9CA3AF', '#6B7280'],
  fighting: ['#FB923C', '#991B1B'],
  flying:   ['#7DD3FC', '#3B82F6'],
  poison:   ['#C084FC', '#7E22CE'],
  ground:   ['#D97706', '#92400E'],
  rock:     ['#78716C', '#44403C'],
  bug:      ['#A3E635', '#4D7C0F'],
  ghost:    ['#818CF8', '#4C1D95'],
  steel:    ['#94A3B8', '#475569']
};

let pokemonList = [];
let compareList = [];

const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');

async function start() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(CONFIG.API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    pokemonList = data.results.map((p) => ({
      name: p.name,
      id: parseInt(p.url.split('/')[6])
    }));

    if (grid) grid.innerHTML = '';
    render(pokemonList);
  } catch (err) {
    console.error("Erro:", err);
    if (grid) grid.innerHTML = `<div class="col-span-full py-20 text-center"><p class="text-red-500 font-bold">Erro de conexão.</p><button onclick="location.reload()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full">Recarregar</button></div>`;
  }
}

function render(list) {
  if (!grid) return;
  grid.innerHTML = '';
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

async function showDetails(id) {
  const modal = document.getElementById('detailsModal');
  const content = document.getElementById('detailsContent');
  if (!modal || !content) return;
  
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="p-10 text-center animate-pulse text-xs font-bold text-gray-400">CARREGANDO...</div>`;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    
    const mainType = data.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || ['#9CA3AF', '#4B5563'];
    const gradientStyle = `background: linear-gradient(to bottom, ${colors[0]}, ${colors[1]});`;

    // Lógica de Tradução e Múltiplos Tipos
    const typesHTML = data.types.map(t => {
      const nomeTraduzido = TRANSLATIONS[t.type.name] || t.type.name;
      return `<span class="px-3 py-1 bg-white/20 text-white backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/30">${nomeTraduzido}</span>`;
    }).join(' ');

    content.innerHTML = `
      <div class="p-8 text-center relative overflow-hidden transition-colors duration-500" style="${gradientStyle}">
        <div class="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 pattern-dots"></div>
        <img src="${CONFIG.IMG_BASE}${id}.png" class="w-44 h-44 mx-auto drop-shadow-2xl relative z-10 hover:scale-110 transition-transform duration-500">
      </div>
      <div class="p-8 bg-white">
        <div class="flex justify-between items-center mb-6">
          <div class="text-left">
            <h2 class="text-3xl font-black capitalize text-gray-800 leading-none">${data.name}</h2>
            <span class="text-xs font-bold text-gray-400">#${String(id).padStart(3, '0')}</span>
          </div>
          <div class="flex flex-wrap gap-1 justify-end">${typesHTML}</div>
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
    content.innerHTML = `<div class="p-10 text-center text-red-500">Erro ao carregar detalhes.</div>`;
  }
}

function closeDetails() {
  document.getElementById('detailsModal').classList.add('hidden');
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
      <div class="mt-3 flex justify-center gap-4 text-xs font-bold"><span class="text-red-500">ATK: ${p1.stats[1].base_stat}</span><span class="text-blue-500">DEF: ${p1.stats[2].base_stat}</span></div>
    </div>
    <div class="flex flex-col items-center justify-center"><div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-white text-lg">VS</div></div>
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${p2.id}.png" class="w-32 h-32 mx-auto drop-shadow-lg">
      <h2 class="text-xl font-black capitalize text-gray-800 mt-2">${p2.name}</h2>
      <div class="mt-3 flex justify-center gap-4 text-xs font-bold"><span class="text-red-500">ATK: ${p2.stats[1].base_stat}</span><span class="text-blue-500">DEF: ${p2.stats[2].base_stat}</span></div>
    </div>
  `;
}

function closeCompare() {
  compareList = [];
  document.getElementById('compareModal').classList.add('hidden');
  render(pokemonList);
}

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
