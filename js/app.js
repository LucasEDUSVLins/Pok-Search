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

async function initSearch() {
    try {
        const res = await fetch(`${POKE_API}pokemon?limit=1000`);
        const data = await res.json();
        allPokemonNames = data.results.map(p => p.name);
        console.log("Nomes carregados:", allPokemonNames.length);
    } catch (err) {
        console.error("Erro ao carregar lista de nomes");
    }
}

async function findElite() {
    const input = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const query = input.value.toLowerCase().trim();

    if (!query) return;

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">BUSCANDO...</p>`;

    try {
        const p = await fetch(`${POKE_API}pokemon/${query}`).then(r => {
            if (!r.ok) throw new Error("Não encontrado");
            return r.json();
        });
        const s = await fetch(p.species.url).then(r => r.json());
        renderCard(p, s);
    } catch (err) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">POKÉMON NÃO ENCONTRADO</p>`;
    }
}

function renderCard(p, s) {
    const grid = document.getElementById('grid');
    const type = p.types[0].type.name;
    const color = COLORS[type] || ['#94a3b8', '#475569'];
    const bst = p.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

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
                    <div class="detail-item"><strong>Tipo</strong><span style="color:${color[1]}">${type}</span></div>
                    <div class="detail-item"><strong>Peso</strong><span>${p.weight / 10} kg</span></div>
                    <div class="detail-item"><strong>Altura</strong><span>${p.height / 10} m</span></div>
                    <div class="detail-item"><strong>Base XP</strong><span>${p.base_experience}</span></div>
                </div>
                <div class="stat-label">Status de Base</div>
                <div class="stats-row">
                    <p><strong>ATK</strong> ${p.stats[1].base_stat}</p>
                    <p><strong>DEF</strong> ${p.stats[2].base_stat}</p>
                    <p><strong>SPD</strong> ${p.stats[5].base_stat}</p>
                </div>
            </div>
        </article>`;
}

const searchInput = document.getElementById('searchInput');
const box = document.getElementById('customSuggestions');

if (searchInput && box) {
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        box.innerHTML = '';

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
            } else {
                box.style.display = 'none';
            }
        } else {
            box.style.display = 'none';
        }
    });
}

searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        box.style.display = 'none';
        findElite();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        box.style.display = 'none';
    }
});

initSearch();