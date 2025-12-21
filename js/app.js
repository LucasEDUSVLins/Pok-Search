const POKE_API = "https://pokeapi.co/api/v2/";
const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

const COLORS = {
    fire: ['#fb923c', '#dc2626'], water: ['#60a5fa', '#2563eb'], grass: ['#4ade80', '#16a34a'],
    electric: ['#facc15', '#ca8a04'], psychic: ['#f472b6', '#9333ea'], ice: ['#22d3ee', '#3b82f6'],
    dragon: ['#818cf8', '#4f46e5'], dark: ['#4b5563', '#111827'], fairy: ['#f9a8d4', '#e11d48'],
    normal: ['#9ca3af', '#6b7280'], fighting: ['#fb923c', '#991b1b'], flying: ['#7dd3fc', '#3b82f6'],
    poison: ['#c084fc', '#7e22ce'], ground: ['#d97706', '#92400e'], rock: ['#78716c', '#44403c'],
    bug: ['#a3e635', '#4d7c0f'], ghost: ['#818cf8', '#4c1d95'], steel: ['#94a3b8', '#475569']
};

let allPokemonNames = [];
const searchInput = document.getElementById('searchInput');
const box = document.getElementById('customSuggestions');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearSearch');

// Inicialização do Tema
if (localStorage.getItem('dark-theme') === 'true') {
    document.body.classList.add('dark-mode');
}

async function initSearch() {
    try {
        const res = await fetch(`${POKE_API}pokemon?limit=1025`);
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

    const grid = document.getElementById('grid');
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">ESCANEANDO POKÉAPI...</p>`;

    try {
        const p = await fetch(`${POKE_API}pokemon/${query}`).then(r => r.json());
        const s = await fetch(p.species.url).then(r => r.json());
        const evoRes = await fetch(s.evolution_chain.url);
        const evoData = await evoRes.json();
        renderFullCard(p, s, evoData);
    } catch (err) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">NÃO ENCONTRADO NA POKÉAPI</p>`;
    }
}

function renderFullCard(p, s, evo) {
    const grid = document.getElementById('grid');
    const type = p.types[0].type.name;
    const color = COLORS[type] || ['#94a3b8', '#475569'];
    const bst = p.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

    let evoCount = 0;
    let curr = evo.chain;
    while (curr && curr.evolves_to.length > 0) {
        evoCount++;
        curr = curr.evolves_to[0];
    }

    const nextEvo = evo.chain.evolves_to[0]?.evolution_details[0];
    const requirement = nextEvo ?
        (nextEvo.min_level ? `Level ${nextEvo.min_level}` : nextEvo.item ? nextEvo.item.name : nextEvo.trigger.name)
        : "Final ou Único";

    grid.innerHTML = `
        <article class="pokemon-card" style="border-color: ${color[0]}">
            <div class="card-banner" style="background: linear-gradient(135deg, ${color[0]}, ${color[1]})">
                <img src="${SPRITE_URL}${p.id}.png" class="pokemon-sprite">
            </div>
            <div class="card-info">
                <div class="title-row">
                    <div><p class="tagline">ID #${p.id}</p><h2 class="name">${p.name}</h2></div>
                    <div style="text-align:right">
                        <span class="bst-num" style="color:${color[1]}">${bst}</span>
                        <p class="tagline">BST TOTAL</p>
                    </div>
                </div>
                <div class="go-details-grid">
                    <div class="detail-item"><strong>Evoluções</strong><span>${evoCount} estágios</span></div>
                    <div class="detail-item"><strong>Requisito</strong><span>${requirement}</span></div>
                    <div class="detail-item"><strong>Grupo Ovo</strong><span>${s.egg_groups[0]?.name || 'N/A'}</span></div>
                    <div class="detail-item"><strong>Felicidade</strong><span>${s.base_happiness}</span></div>
                </div>
                <div class="stat-label">Status Base</div>
                <div class="stats-row">
                    <p><strong>ATK</strong> ${p.stats[1].base_stat}</p>
                    <p><strong>DEF</strong> ${p.stats[2].base_stat}</p>
                    <p><strong>HP</strong> ${p.stats[0].base_stat}</p>
                </div>
                <div class="data-source"><small>📚 FONTE: POKÉAPI OFICIAL</small></div>
            </div>
        </article>`;
}

// Eventos de Interface
searchInput?.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    box.innerHTML = '';
    clearBtn.style.display = val.length > 0 ? 'block' : 'none';

    if (val.length > 0) {
        const matches = allPokemonNames.filter(n => n.includes(val)).slice(0, 6);
        if (matches.length > 0) {
            box.style.display = 'block';
            matches.forEach(name => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = name;
                div.onclick = () => {
                    searchInput.value = name;
                    box.style.display = 'none';
                    findElite();
                };
                box.appendChild(div);
            });
        } else box.style.display = 'none';
    } else box.style.display = 'none';
});

themeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-theme', isDark);
});

clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    box.style.display = 'none';
    clearBtn.style.display = 'none';
    searchInput.focus();
});

searchInput?.addEventListener('keypress', e => e.key === 'Enter' && (box.style.display = 'none', findElite()));
document.addEventListener('click', e => !e.target.closest('.search-box') && (box.style.display = 'none'));

initSearch();