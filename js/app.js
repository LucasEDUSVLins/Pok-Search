const POKE_API = {
    // Link via JSDelivr para evitar bloqueios de segurança (CORS)
    GO_DATA: 'https://cdn.jsdelivr.net/gh/BrunnerLivio/Pokemon-GO-Data@master/pokemon.json',
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

let allPokemonGO = [];

async function initSearch() {
    try {
        const res = await fetch(POKE_API.GO_DATA);
        if (!res.ok) throw new Error();
        allPokemonGO = await res.json();
        console.log("Base GO Sincronizada.");
    } catch (err) {
        document.getElementById('grid').innerHTML = '<p style="color:red; text-align:center;">Erro na conexão com a base de dados.</p>';
    }
}

function renderGoCard(p) {
    const grid = document.getElementById('grid');
    const type = p.types[0].toLowerCase();
    const color = COLORS[type] || ['#94a3b8', '#475569'];

    grid.innerHTML = `
        <article class="pokemon-card">
            <div class="card-banner" style="background: linear-gradient(135deg, ${color[0]}, ${color[1]})">
                <img src="${POKE_API.SPRITE}${p.id}.png" class="pokemon-sprite">
            </div>
            <div class="card-info">
                <div class="title-row">
                    <div><p class="tagline">ID #${p.id}</p><h2 class="name">${p.name}</h2></div>
                    <div style="text-align:right"><span class="bst-num">CP ${p.maxCP}</span></div>
                </div>
                <div class="go-details-grid">
                    <div class="detail-item"><strong>Custo</strong><span>${p.evolution?.candy_cost || 'N/A'} Doces</span></div>
                    <div class="detail-item"><strong>Ovo</strong><span>${p.egg === "Not in Eggs" ? "Não" : p.egg}</span></div>
                    <div class="detail-item"><strong>Buddy</strong><span>${p.buddyDistance || 0}km</span></div>
                    <div class="detail-item"><strong>Evoluções</strong><span>${p.evolution?.next_evolution?.length || 0}</span></div>
                </div>
                <div class="stats-row">
                    <p><strong>ATK</strong> ${p.stats.attack}</p><p><strong>DEF</strong> ${p.stats.defense}</p><p><strong>STA</strong> ${p.stats.stamina}</p>
                </div>
            </div>
        </article>`;
}

async function findElite() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim().replace(/\s+/g, '-');
    if (!query || allPokemonGO.length === 0) return;

    const pokemon = allPokemonGO.find(p => p.slug === query || p.name.toLowerCase() === query);
    pokemon ? renderGoCard(pokemon) : alert("Não encontrado!");
}

// Eventos
document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    const box = document.getElementById('customSuggestions');
    box.innerHTML = '';

    if (val.length > 0) {
        const matches = allPokemonGO.filter(p => p.slug.includes(val)).slice(0, 5);
        matches.forEach(p => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = p.name;
            div.onclick = () => { renderGoCard(p); box.style.display = 'none'; document.getElementById('searchInput').value = p.name; };
            box.appendChild(div);
        });
        box.style.display = matches.length ? 'block' : 'none';
    } else { box.style.display = 'none'; }
});

document.getElementById('searchInput').addEventListener('keypress', e => e.key === 'Enter' && findElite());

initSearch();