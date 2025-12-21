/**
 * POKÉMETA - Lógica Principal
 * Projetado para: PokéAPI (Estável)
 */

const CONFIG = {
  API_URL: 'https://pokeapi.co/api/v2/pokemon?limit=100',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

// Estado da Aplicação
let pokemonList = [];
let compareList = [];

// Elementos da Interface (Cache)
const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const compareCount = document.getElementById('compareCount');

/**
 * Inicializa a aplicação buscando dados da API
 */
async function start() {
  try {
    const res = await fetch(CONFIG.API_URL);
    if (!res.ok) throw new Error('Erro na conexão com a API');
    
    const data = await res.json();
    
    // Processamento dos dados
    pokemonList = data.results.map((p, index) => {
      const id = index + 1;
      return {
        name: p.name,
        id: id,
        attack: Math.floor(Math.random() * 101) + 50, // Mock de Meta Stats
        defense: Math.floor(Math.random() * 101) + 40 
      };
    });

    render(pokemonList);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="col-span-full text-red-500 py-10">Falha ao carregar o Meta. Tente novamente mais tarde.</p>`;
  }
}

/**
 * Renderiza os cards no grid principal
 */
function render(list) {
  if (!grid) return;

  // Limpa o grid (e remove mensagem de carregamento)
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-full opacity-50 py-10 text-center text-gray-400">Nenhum Pokémon encontrado.</p>`;
    return;
  }

  const htmlContent = list.map(p => {
    const isSelected = compareList.find(c => c.id === p.id);
    return `
      <div onclick="toggleCompare(${p.id})" 
           class="bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'}">
        <img src="${CONFIG.IMG_BASE}${p.id}.png" class="w-24 h-24 mx-auto mb-4" loading="lazy">
        <h3 class="font-bold capitalize text-gray-800 tracking-tight">${p.name}</h3>
        <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span>ATK: ${p.attack}</span>
          <span>DEF: ${p.defense}</span>
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = htmlContent;
  compareCount.innerText = `${compareList.length}/2 Selecionados`;
}

/**
 * Lógica de Seleção para Comparação
 */
function toggleCompare(id) {
  const poke = pokemonList.find(p => p.id === id);
  const index = compareList.findIndex(c => c.id === id);

  if (index > -1) {
    compareList.splice(index, 1); // Remove se já estiver selecionado
  } else if (compareList.length < 2) {
    compareList.push(poke); // Adiciona se houver espaço
  }

  render(pokemonList);

  if (compareList.length === 2) {
    showCompareModal();
  }
}

/**
 * Interface do Modal de Comparação
 */
function showCompareModal() {
  const modal = document.getElementById('compareModal');
  const content = document.getElementById('compareContent');
  
  modal.classList.remove('hidden');
  content.innerHTML = `
    <div class="p-4 group">
      <img src="${CONFIG.IMG_BASE}${compareList[0].id}.png" class="w-40 h-40 mx-auto drop-shadow-2xl group-hover:scale-110 transition-transform">
      <h2 class="text-2xl font-black capitalize mt-4 text-gray-800">${compareList[0].name}</h2>
      <p class="text-blue-600 font-bold text-lg">ATAQUE: ${compareList[0].attack}</p>
    </div>
    
    <div class="flex flex-col items-center">
      <div class="bg-blue-600 text-white font-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-blue-200">VS</div>
    </div>

    <div class="p-4 group">
      <img src="${CONFIG.IMG_BASE}${compareList[1].id}.png" class="w-40 h-40 mx-auto drop-shadow-2xl group-hover:scale-110 transition-transform">
      <h2 class="text-2xl font-black capitalize mt-4 text-gray-800">${compareList[1].name}</h2>
      <p class="text-blue-600 font-bold text-lg">ATAQUE: ${compareList[1].attack}</p>
    </div>
  `;
}

function closeCompare() {
  compareList = [];
  document.getElementById('compareModal').classList.add('hidden');
  render(pokemonList);
}

/**
 * Gerenciamento da Barra de Pesquisa
 */
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  
  // Controle de visibilidade do botão "X"
  term.length > 0 ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');
  
  // Filtragem
  const filtered = pokemonList.filter(p => p.name.includes(term));
  render(filtered);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  render(pokemonList);
  searchInput.focus();
});

// Execução Inicial
start();
