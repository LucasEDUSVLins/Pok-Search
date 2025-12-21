const POKE_API = {
    GO_DATA: 'https://raw.githubusercontent.com/BrunnerLivio/Pokemon-GO-Data/master/pokemon.json',
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

// Carregamento inicial
async function initSearch() {
    try {
        const res = await fetch(POKE_API.GO_DATA);
        allPokemonGO = await res.json();
        console.log("Base GO carregada com sucesso.");
    } catch (err) {
        console.error("Erro ao carregar base GO:", err);
    }
}

// Renderização do Card
function renderGoCard(p) {
    const grid = document.getElementById('grid');
    const type = p.types[0].toLowerCase();
    const color = COLORS[type] || ['#94a3b8', '#475569'];
    const eggInfo = p.egg === "Not in Eggs" ? "Apenas Captura" : p.egg;
    const candyCost = p.evolution?.candy_cost ? `${p.evolution.candy_cost} Doces` : "N/A";
    const stages = p.evolution?.next_evolution ? p.evolution.next_evolution.length : 0;

    grid.innerHTML = `
        <article class="pokemon-card">
            <div class="card-banner" style="background: linear-gradient(135deg, ${color[0]}, ${color[1]})">
                <img src="${POKE_API.SPRITE}${p.id}.png" class="pokemon-sprite" alt="${p.name}">
            </div>
            <div class="card-info">
                <div class="title-row">
                    <div>
                        <p class="tagline">ID #${p.id}</p>
                        <h2 class="name">${p.name}</h2>
                    </div>
                    <div style="text-align:right">
                        <span class="bst-num">CP ${p.maxCP}</span>
                        <p class="tagline" style="margin-top:5px">CP MÁXIMO</p>
                    </div>
                </div>
                <div class="go-details-grid">
                    <div class="detail-item"><strong>Linhagem</strong><span>${stages} Evoluções</span></div>
                    <div class="detail-item"><strong>Custo Evolução</strong><span>${candyCost}</span></div>
                    <div class="detail-item"><strong>Obtenção por Ovo</strong><span>${eggInfo}</span></div>
                    <div class="detail-item"><strong>Distância Buddy</strong><span>${p.buddyDistance || 0} km</span></div>
                </div>
                <div class="stat-label">Status Máximos (Base)</div>
                <div class="stats-row">
                    <p><strong>ATK</strong> ${p.stats.attack}</p>
                    <p><strong>DEF</strong> ${p.stats.defense}</p>
                    <p><strong>STA</strong> ${p.stats.stamina}</p>
                </div>
                <div class="data-source">
                    <small>DADOS REAIS EXTRAÍDOS DO POKÉMON GO</small>
                </div>
            </div>
        </article>`;
}

// Funções de Busca
async function findElite() {
    const input = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const query = input.value.toLowerCase().trim().replace(/\s+/g, '-');

    if (!query) return;

    // Animação da Pinap
    const logoIcon = document.querySelector('.logo-pinap');
    if (logoIcon) {
        logoIcon.classList.remove('animate-jump');
        void logoIcon.offsetWidth;
        logoIcon.classList.add('animate-jump');
    }

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">BUSCANDO...</p>`;

    // Busca exata ou por slug
    const pokemon = allPokemonGO.find(p =>
        p.slug === query ||
        p.name.toLowerCase() === query.replace(/-/g, ' ')
    );

    if (!pokemon) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">NÃO ENCONTRADO NO GO</p>`;
        return;
    }
    renderGoCard(pokemon);
}

// Elementos da Interface
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('customSuggestions');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearSearch');

// Lógica de Sugestão Única e Corrigida
searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase().trim();
    if (value.length < 1) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const filtered = allPokemonGO
        .filter(p => p.slug.includes(value) || p.name.toLowerCase().includes(value))
        .slice(0, 8);

    if (filtered.length > 0) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'block';
        filtered.forEach(p => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = p.name;
            div.onclick = () => {
                searchInput.value = p.name;
                suggestionsBox.style.display = 'none';
                renderGoCard(p);
            };
            suggestionsBox.appendChild(div);
        });
    } else {
        suggestionsBox.style.display = 'none';
    }
});

// Eventos de Teclado e Tema
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        suggestionsBox.style.display = 'none';
        findElite();
    }
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

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) suggestionsBox.style.display = 'none';
});

// Inicializa
initSearch();