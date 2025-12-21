const CONFIG = {
    API_SPECIES: 'https://pokeapi.co/api/v2/pokemon-species/',
    IMG_BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

const TYPE_COLORS = {
    fire: ['#FB923C', '#DC2626'], water: ['#60A5FA', '#2563EB'],
    grass: ['#4ADE80', '#16A34A'], electric: ['#FACC15', '#CA8A04'],
    psychic: ['#F472B6', '#9333EA'], ice: ['#22D3EE', '#3B82F6'],
    dragon: ['#818CF8', '#4F46E5'], dark: ['#4B5563', '#111827'],
    fairy: ['#F9A8D4', '#E11D48'], normal: ['#9CA3AF', '#6B7280'],
    fighting: ['#FB923C', '#991B1B'], flying: ['#7DD3FC', '#3B82F6'],
    poison: ['#C084FC', '#7E22CE'], ground: ['#D97706', '#92400E'],
    rock: ['#78716C', '#44403C'], bug: ['#A3E635', '#4D7C0F'],
    ghost: ['#818CF8', '#4C1D95'], steel: ['#94A3B8', '#475569']
};

const searchInput = document.getElementById('searchInput');

async function findBestVersion() {
    const query = searchInput.value.toLowerCase().trim();
    const grid = document.getElementById('grid');
    if (!query) return;

    grid.innerHTML = `<div class="text-center py-20 font-black text-slate-400 animate-pulse">ESCANEANDO API...</div>`;

    try {
        const speciesRes = await fetch(`${CONFIG.API_SPECIES}${query}`);
        if (!speciesRes.ok) throw new Error();
        const speciesData = await speciesRes.json();

        const variantsPromises = speciesData.varieties.map(v => fetch(v.pokemon.url).then(r => r.json()));
        const variantsData = await Promise.all(variantsPromises);

        const best = variantsData.reduce((prev, curr) => {
            const prevTotal = prev.stats.reduce((acc, s) => acc + s.base_stat, 0);
            const currTotal = curr.stats.reduce((acc, s) => acc + s.base_stat, 0);
            return (currTotal > prevTotal) ? curr : prev;
        });

        renderBest(best, speciesData.name);
    } catch (err) {
        grid.innerHTML = `<div class="text-center py-20 text-red-500 font-black">ERRO: POKÉMON NÃO ENCONTRADO.</div>`;
    }
}

function renderBest(p, originalName) {
    const totalStats = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const mainType = p.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || ['#9CA3AF', '#4B5563'];
    
    document.getElementById('grid').innerHTML = `
        <div class="animate-pop max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-yellow-400">
            <div class="p-10 text-center" style="background: linear-gradient(to bottom, ${colors[0]}, ${colors[1]})">
                <img src="${CONFIG.IMG_BASE}${p.id}.png" class="w-64 h-64 mx-auto drop-shadow-2xl">
            </div>
            <div class="p-8">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-4xl font-black capitalize text-slate-800">${p.name.replace(/-/g, ' ')}</h2>
                        <p class="text-slate-400 font-bold uppercase text-[10px]">Origem: ${originalName}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-4xl font-black text-blue-600">${totalStats}</p>
                        <p class="text-[10px] font-bold text-slate-400">TOTAL BST</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${p.stats.map(s => `
                        <div>
                            <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                                <span>${s.stat.name}</span><span>${s.base_stat}</span>
                            </div>
                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div class="bg-blue-500 h-full" style="width: ${(s.base_stat/160)*100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') findBestVersion(); });
