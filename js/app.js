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

    grid.innerHTML = `<div class="status-msg">ESCANEANDO API...</div>`;

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
        grid.innerHTML = `<div class="status-msg error-msg">ERRO: POKÉMON NÃO ENCONTRADO.</div>`;
    }
}

function renderBest(p, originalName) {
    const totalStats = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const mainType = p.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || ['#9CA3AF', '#4B5563'];
    
    document.getElementById('grid').innerHTML = `
        <div class="pokemon-card animate-pop">
            <div class="card-header" style="background: linear-gradient(to bottom, ${colors[0]}, ${colors[1]})">
                <img src="${CONFIG.IMG_BASE}${p.id}.png" class="pokemon-img">
            </div>
            <div class="card-body">
                <div class="info-row">
                    <div>
                        <h2 class="poke-name">${p.name.replace(/-/g, ' ')}</h2>
                        <p class="poke-origin">Origem: ${originalName}</p>
                    </div>
                    <div>
                        <p class="bst-value">${totalStats}</p>
                        <p class="bst-label">TOTAL BST</p>
                    </div>
                </div>
                <div class="stats-grid">
                    ${p.stats.map(s => `
                        <div class="stat-item">
                            <div class="stat-label-row">
                                <span>${s.stat.name}</span><span>${s.base_stat}</span>
                            </div>
                            <div class="bar-bg">
                                <div class="bar-fill" style="width: ${(s.base_stat/160)*100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') findBestVersion(); });
