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

let allPokemonNames = [];

async function initSearch() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await res.json();
        allPokemonNames = data.results.map(p => p.name);
    } catch (err) { console.error("Erro ao carregar nomes"); }
}

async function findElite() {
    const logoIcon = document.querySelector('.logo-pinap');
    if (logoIcon) {
        logoIcon.classList.remove('animate-jump');
        void logoIcon.offsetWidth;
        logoIcon.classList.add('animate-jump');
    }
    const input = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">ESCANEANDO...</p>`;

    try {
        const res = await fetch(`${POKE_API.SPECIES}${query}`);
        const data = await res.json();
        const variants = await Promise.all(data.varieties.map(v => fetch(v.pokemon.url).then(r => r.json())));

        const elite = variants.reduce((a, b) =>
            (b.stats.reduce((s, c) => s + c.base_stat, 0) > a.stats.reduce((s, c) => s + c.base_stat, 0)) ? b : a
        );

        const bst = elite.stats.reduce((s, c) => s + c.base_stat, 0);
        const type = elite.types[0].type.name;
        const color = COLORS[type] || ['#94a3b8', '#475569'];

        grid.innerHTML = `
            <article class="pokemon-card">
                <div class="card-banner" style="background: linear-gradient(135deg, ${color[0]}, ${color[1]})">
                    <img src="${POKE_API.SPRITE}${elite.id}.png" class="pokemon-sprite" alt="${elite.name}">
                </div>
                <div class="card-info">
                    <div class="title-row">
                        <div><p class="tagline">Base: ${data.name}</p><h2 class="name">${elite.name.replace(/-/g, ' ')}</h2></div>
                        <div style="text-align:right"><p class="bst-num">${bst}</p><p class="tagline">BST TOTAL</p></div>
                    </div>
                    <div class="stats-grid">
                        ${elite.stats.map(s => `
                            <div class="stat-item">
                                <div class="stat-label"><span>${s.stat.name}</span><span>${s.base_stat}</span></div>
                                <div class="bar-bg"><div class="bar-fill" style="width: ${(s.base_stat / 160) * 100}%; background: ${color[0]}"></div></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </article>`;
    } catch {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">POKÉMON NÃO ENCONTRADO</p>`;
    }
}


const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('customSuggestions');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearSearch');

searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    if (value.length > 0) {
        const filtered = allPokemonNames.filter(name => name.startsWith(value)).slice(0, 10);
        if (filtered.length > 0) {
            suggestionsBox.style.display = 'block';
            filtered.forEach(name => {
                const div = document.createElement('div');
                div.classList.add('suggestion-item');
                div.textContent = name;
                div.onclick = () => {
                    searchInput.value = name;
                    suggestionsBox.style.display = 'none';
                    findElite();
                };
                suggestionsBox.appendChild(div);
            });
        } else { suggestionsBox.style.display = 'none'; }
    } else { suggestionsBox.style.display = 'none'; }
});

themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-theme', document.body.classList.contains('dark-mode'));
});

if (localStorage.getItem('dark-theme') === 'true') document.body.classList.add('dark-mode');

clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    suggestionsBox.style.display = 'none';
    searchInput.focus();
});

searchInput?.addEventListener('keypress', e => e.key === 'Enter' && (suggestionsBox.style.display = 'none', findElite()));

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) suggestionsBox.style.display = 'none';
});

initSearch();