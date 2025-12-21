/**
 * POKÉMETA - Sistema de Busca de Versão Elite
 */

const CONFIG = {
  API_SPECIES: 'https://pokeapi.co/api/v2/pokemon-species/',
  API_POKEMON: 'https://pokeapi.co/api/v2/pokemon/',
  IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

// ... (Mantenha os objetos TRANSLATIONS e TYPE_COLORS do código anterior)

async function findBestVersion() {
  const name = document.getElementById('searchInput').value.toLowerCase().trim();
  const grid = document.getElementById('grid');
  
  if (!name) return;

  grid.innerHTML = `<p class="col-span-full py-20 animate-pulse text-blue-500 font-bold">Analisando todas as variantes de ${name} na PokéAPI...</p>`;

  try {
    // 1. Busca a espécie para achar variedades
    const speciesRes = await fetch(`${CONFIG.API_SPECIES}${name}`);
    const speciesData = await speciesRes.json();

    // 2. Busca dados de todas as variantes em paralelo
    const variantsPromises = speciesData.varieties.map(v => fetch(v.pokemon.url).then(r => r.json()));
    const variantsData = await Promise.all(variantsPromises);

    // 3. Calcula qual tem a maior soma de atributos (BST)
    const best = variantsData.reduce((prev, current) => {
      const prevTotal = prev.stats.reduce((acc, s) => acc + s.base_stat, 0);
      const currTotal = current.stats.reduce((acc, s) => acc + s.base_stat, 0);
      return (currTotal > prevTotal) ? current : prev;
    });

    renderBest(best, speciesData.name);

  } catch (err) {
    grid.innerHTML = `<p class="col-span-full py-20 text-red-500 font-bold">Pokémon não encontrado ou erro na API.</p>`;
  }
}

function renderBest(p, originalName) {
  const totalStats = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
  const mainType = p.types[0].type.name;
  const colors = TYPE_COLORS[mainType] || ['#9CA3AF', '#4B5563'];
  
  grid.innerHTML = `
    <div class="col-span-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400">
      <div class="p-8 text-center" style="background: linear-gradient(to bottom, ${colors[0]}, ${colors[1]})">
        <span class="bg-yellow-400 text-yellow-900 text-[10px] font-black px-4 py-1 rounded-full uppercase mb-4 inline-block shadow-lg">Versão Elite Encontrada</span>
        <img src="${CONFIG.IMG_BASE}${p.id}.png" class="w-64 h-64 mx-auto drop-shadow-2xl transform hover:scale-110 transition-transform">
      </div>
      
      <div class="p-8">
        <div class="flex justify-between items-end mb-6">
          <div class="text-left">
            <h2 class="text-4xl font-black capitalize text-gray-800">${p.name.replace(/-/g, ' ')}</h2>
            <p class="text-gray-400 font-bold">Baseado na espécie: ${originalName}</p>
          </div>
          <div class="text-right">
            <span class="text-5xl font-black text-blue-600">${totalStats}</span>
            <p class="text-[10px] font-black text-gray-400 uppercase">Total BST</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
           ${p.stats.map(s => renderStatBar(s.stat.name, s.base_stat)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderStatBar(label, value) {
  const trad = { hp: 'Vida', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Atk. Esp', 'special-defense': 'Def. Esp', speed: 'Velocidade' };
  const width = Math.min((value / 160) * 100, 100);
  return `
    <div>
      <div class="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase">
        <span>${trad[label] || label}</span><span>${value}</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5">
        <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${width}%"></div>
      </div>
    </div>
  `;
}

// Alterar o listener do searchInput no final do arquivo:
searchInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') findBestVersion();
});
