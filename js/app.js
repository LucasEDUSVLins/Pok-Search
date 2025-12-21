const POKE_API = {
    SPECIES: 'https://pokeapi.co/api/v2/pokemon-species/',
    SPRITE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
};

const COLORS = {
    fire: ['#fb923c', '#dc2626'], water: ['#60a5fa', '#2563eb'], grass: ['#4ade80', '#16a34a'],
    electric: ['#facc15', '#ca8a04'], psychic: ['#f472b6', '#9333ea'], ice: ['#22d3ee', '#3b82f6'],
    dragon: ['#818cf8', '#4f46e5'], dark: ['#4b5563', '#111827'], fairy: ['#f9a8d4', '#e11d48'],
    normal: ['#9ca3af', '#6b7280'], fighting: ['#fb923c', '#991b1b'], flying: ['#7dd3fc', '#3b82f6'],
    poison: ['#c084fc', '#7e22ce'], ground: ['#d97706', '#92400e'], rock: ['#78716c', '#44403c'],
    bug: ['#a3e635', '#4d7c0f'], ghost: ['#818cf8', '#4c1d95'], steel: ['#94a3b8', '#475569']
};

const input = document.getElementById('searchInput');
const grid = document.getElementById('grid');

async function searchPokemon() {
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    grid.innerHTML = `<p class="status-text">ANALISANDO DADOS...</p>`;

    try {
        const speciesRes = await fetch(`${POKE_API.SPECIES}${query}`);
        if (!speciesRes.ok) throw new Error('Not Found');
        const speciesData = await speciesRes.json();

        // Busca todas as variedades em paralelo
        const variantPromises = speciesData.varieties.map(v => fetch(v.pokemon.url).then(r => r.json()));
        const variants = await Promise.all(variantPromises);

        // Encontra a versão com maior BST (Base Stat Total)
        const elite = variants.reduce((prev, curr) => {
            const getBST = (p) => p.stats.reduce((acc, s) => acc + s.base_stat, 0);
            return getBST(curr) > getBST(prev) ? curr : prev;
        });

        renderCard(elite, speciesData.name);
    } catch (err) {
        grid.innerHTML = `<p class="status-text" style="color:#f87171">POKÉMON NÃO ENCONTRADO</p>`;
    }
}

function renderCard(pokemon, originalName) {
    const bst = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const type = pokemon.types[0].type.name;
    const colorPair = COLORS[type] || ['#94a3b8', '#475569'];

    grid.innerHTML = `
        <article class="pokemon-card">
            <div class="card-banner" style="background: linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})">
                <img src="${POKE_API.SPRITE}${pokemon.id}.png" class="pokemon-sprite" alt="${pokemon.name}">
            </div>
            
            <div class="card-info">
                <div class="title-group">
                    <div>
                        <span class="origin">DNA de ${originalName}</span>
                        <h2 class="name">${pokemon.name.replace(/-/g, ' ')}</h2>
                    </div>
                    <div class="bst-box">
                        <p class="bst-num">${bst}</p>
                        <span class="tagline">Total BST</span>
                    </div>
                </div>

                <div class="stats-container">
                    ${pokemon.stats.map(s => `
                        <div class="stat-row">
                            <div class="stat-label">
                                <span>${s.stat.name}</span>
                                <span>${s.base_stat}</span>
                            </div>
                            <div class="bar-outer">
                                <div class="bar-inner" style="width: ${(s.base_stat/160)*100}%; background-color: ${colorPair[0]}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </article>
    `;
}

input.addEventListener('keypress', (e) => e.key === 'Enter' && searchPokemon());
