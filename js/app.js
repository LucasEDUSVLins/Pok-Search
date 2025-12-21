/**
 * POKÉMETA - Versão 2.0 (Dados Reais e Lista Completa)
 */

const CONFIG = {
  // Aumentado para 1025 para pegar todos os Pokémon conhecidos
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=1025',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

let pokemonList = [];
let compareList = [];

const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const compareCount = document.getElementById('compareCount');

async function start() {
  try {
    const res = await fetch(CONFIG.API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // MAPEAMENTO: O ID é extraído da URL para garantir precisão
    pokemonList = data.results.map((p) => {
      const id = p.url.split('/')[6];
      return {
        name: p.name,
        id: parseInt(id),
        // Removido o Random. Agora o render buscará dados reais se necessário
        // ou exibiremos apenas o ID até o clique em detalhes.
      };
    });

    if (grid) grid.innerHTML = '';
    render(pokemonList);

  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = `<div class="col-span-full py-20 text-center text-red-500">Erro: ${err.message}</div>`;
  }
}

function render(list) {
  if (!grid) return;
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-full opacity-50 py-10 text-center text-gray-400">Nenhum Pokémon encontrado.</p>`;
    return;
  }

  // Pegamos apenas os primeiros 100 para não travar o navegador no carregamento inicial, 
  // mas a busca funcionará em TODOS os 1025.
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

async function showDetails(id) {
  const modal = document.getElementById('detailsModal');
  const content = document.getElementById('detailsContent');
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="p-10 text-center animate-pulse">Carregando dados reais...</div>`;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    const stats = {
      hp: data.stats[0].base_stat,
      atk: data.stats[1].base_stat,
      def: data.stats[2].base_stat,
      speed: data.stats[5].base_stat
    };

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
          ${renderStatBar('HP', stats.hp, 'bg-green-500')}
          ${renderStatBar('ATAQUE', stats.atk, 'bg-red-500')}
          ${renderStatBar('DEFESA', stats.def, 'bg-blue-500')}
          ${renderStatBar('VELOCIDADE', stats.speed, 'bg-yellow-500')}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="p-10 text-center text-red-500">Erro ao carregar dados oficiais.</div>`;
  }
}

function renderStatBar(label, value, color) {
  const width = Math.min((value / 150) * 100, 100); // Baseado em um máximo de 150 para a barra
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

// Funções de Comparação e Busca permanecem iguais, apenas atualizadas para os novos dados
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
  content.innerHTML = `<div class="col-span-full p-10 text-center">Obtendo estatísticas comparativas...</div>`;

  // Para comparar dados REAIS, precisamos buscar os dados dos dois selecionados
  const p1Data = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[0].id}`)).json();
  const p2Data = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${compareList[1].id}`)).json();

  content.innerHTML = `
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${compareList[0].id}.png" class="w-32 h-32 mx-auto">
      <h2 class="text-xl font-black capitalize">${p1Data.name}</h2>
      <p class="text-red-500 font-bold">ATK: ${p1Data.stats[1].base_stat}</p>
      <p class="text-blue-500 font-bold">DEF: ${p1Data.stats[2].base_stat}</p>
    </div>
    <div class="text-2xl font-black text-gray-200">VS</div>
    <div class="p-4">
      <img src="${CONFIG.IMG_BASE}${compareList[1].id}.png" class="w-32 h-32 mx-auto">
      <h2 class="text-xl font-black capitalize">${p2Data.name}</h2>
      <p class="text-red-500 font-bold">ATK: ${p2Data.stats[1].base_stat}</p>
      <p class="text-blue-500 font-bold">DEF: ${p2Data.stats[2].base_stat}</p>
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
