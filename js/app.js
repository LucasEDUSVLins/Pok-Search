/**
 * POKÉMETA - Versão 2.1 (Correção de Fechamento e Dados Reais)
 */

const CONFIG = {
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=1025',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

// Estado da Aplicação
let pokemonList = [];
let compareList = [];

// Elementos da Interface
const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const compareCount = document.getElementById('compareCount');
const detailsModal = document.getElementById('detailsModal'); // Cache do modal de detalhes

/**
 * Inicializa a aplicação
 */
async function start() {
  try {
    const res = await fetch(CONFIG.API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    pokemonList = data.results.map((p) => {
      const id = p.url.split('/')[6];
      return {
        name: p.name,
        id: parseInt(id)
      };
    });

    if (grid) grid.innerHTML = '';
    render(pokemonList);

  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = `<div class="col-span-full py-20 text-center text-red-500">Erro ao carregar lista.</div>`;
  }
}

/**
 * Renderiza os cards
 */
function render(list) {
  if (!grid) return;
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-full opacity-50 py-10 text-center text-gray-400">Nenhum Pokémon encontrado.</p>`;
    return;
  }

  // Mostra os primeiros 100 ou o resultado da busca
  const displayList = searchInput.value.length > 0 ? list : list.slice(0, 100);

  const htmlContent = displayList.map(p => {
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

  grid.insertAdjacentHTML('beforeend', htmlContent);
  if (compareCount) compareCount.innerText = `${compareList.length}/2 Selecionados`;
}

/**
 * Detalhes (Abrir e Fechar)
 */
async function showDetails(id) {
  const content = document.getElementById('detailsContent');
  if (!detailsModal || !content) return;

  detailsModal.classList.remove('hidden');
  content.innerHTML = `<div class="p-10 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">Acessando Banco de Dados...</div>`;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    const types = data.types.map(t => `<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">${t.type.name}</span>`).join(' ');

    content.innerHTML = `
      <div class="bg-gradient-to-b from-blue-500 to-blue-600 p-8 text-center">
        <img src="${CONFIG.IMG_BASE}${id}.png" class="w-40 h-40 mx-auto drop-shadow-2xl">
      </div>
      <div class="p-8">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-3xl font-black capitalize text-gray-800">${data.name}</h2>
          <div class="flex flex-wrap gap-1 justify-end">${types}</div>
        </div>
        <div class="space-y-4">
          ${renderStatBar('HP', data.stats[0].base_stat, 'bg-green-500')}
          ${renderStatBar('ATAQUE', data.stats[1].base_stat, 'bg-red-500')}
          ${renderStatBar('DEFESA', data.stats[2].base_stat, 'bg-blue-500')}
          ${renderStatBar('VELOCIDADE', data.stats[5].base_stat, 'bg-yellow-500')}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-10 text-center text-red-500 font-bold">Erro ao carregar dados oficiais.</div>`;
  }
}

// ESTA É A FUNÇÃO QUE FECHA O MODAL
function closeDetails() {
  if (detailsModal) {
    detailsModal.classList.add('hidden');
  }
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
 * Comparação
 */
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
  if (!modal || !content) return;

  modal.classList.remove('hidden');
  content.innerHTML = `<div class="col-span-full p-10 text-center text-gray-400 font-bold">Sincronizando estatísticas...</div>`;

  try {
    const [p1, p2] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[0].id}`).then(r => r.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[1].id}`).then(r => r.json())
    ]);

    content.innerHTML = `
      <div class="p-4">
        <img src="${CONFIG.IMG_BASE}${p1.id}.png" class="w-32 h-32 mx-auto">
        <h2 class="text-xl font-black capitalize text-gray-800">${p1.name}</h2>
        <p class="text-red-500 font-bold text-xs">ATK: ${p1.stats[1].base_stat}</p>
        <p class="text-blue-500 font-bold text-xs">DEF: ${p1.stats[2].base_stat}</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="bg-blue-600 text-white font-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg">VS</div>
      </div>
      <div class="p-4">
        <img src="${CONFIG.IMG_BASE}${p2.id}.png" class="w-32 h-32 mx-auto">
        <h2 class="text-xl font-black capitalize text-gray-800">${p2.name}</h2>
        <p class="text-red-500 font-bold text-xs">ATK: ${p2.stats[1].base_stat}</p>
        <p class="text-blue-500 font-bold text-xs">DEF: ${p2.stats[2].base_stat}</p>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p class="col-span-full text-red-500">Erro na comparação.</p>`;
  }
}

function closeCompare() {
  compareList = [];
  const modal = document.getElementById('compareModal');
  if (modal) modal.classList.add('hidden');
  render(pokemonList);
}

/**
 * Busca
 */
searchInput?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  term.length > 0 ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');
  const filtered = pokemonList.filter(p => p.name.includes(term));
  render(filtered);
});

clearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  render(pokemonList);
  searchInput.focus();
});

start();
