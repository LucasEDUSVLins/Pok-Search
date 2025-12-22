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

if (localStorage.getItem('dark-theme') === 'true') document.body.classList.add('dark-mode');

async function initSearch() {
    const cachedNames = localStorage.getItem('pokeNamesCache');

    if (cachedNames) {
        allPokemonNames = JSON.parse(cachedNames);
        console.log("Sugestões carregadas do cache local.");
    } else {
        try {
            const res = await fetch(`${POKE_API}pokemon?limit=1025`);
            const data = await res.json();
            allPokemonNames = data.results.map(p => p.name);
            localStorage.setItem('pokeNamesCache', JSON.stringify(allPokemonNames));
            console.log("Cache criado pela primeira vez.");
        } catch (err) {
            console.error("Erro ao carregar nomes da API", err);
        }
    }
}

async function findElite() {
    const grid = document.getElementById('grid');
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">ELITE FINDER: COMPARANDO VARIANTES...</p>`;

    try {
        const species = await fetch(`${POKE_API}pokemon-species/${query}`).then(r => r.json());

        const varietiesData = await Promise.all(
            species.varieties.map(v => fetch(v.pokemon.url).then(r => r.json()))
        );

        const eliteVariant = varietiesData.reduce((prev, current) => {
            const prevBST = prev.stats.reduce((acc, s) => acc + s.base_stat, 0);
            const currBST = current.stats.reduce((acc, s) => acc + s.base_stat, 0);
            return (currBST > prevBST) ? current : prev;
        });

        const [evoRes, damageData] = await Promise.all([
            fetch(species.evolution_chain.url).then(r => r.json()),
            Promise.all(eliteVariant.types.map(t => fetch(t.type.url).then(r => r.json())))
        ]);

        renderFullCard(eliteVariant, species, evoRes, damageData);
    } catch (err) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">ERRO NO SCANNER ELITE</p>`;
    }
}

function renderFullCard(p, s, evo, damageData) {
    const grid = document.getElementById('grid');
    const mainType = p.types[0].type.name;
    const color = COLORS[mainType] || ['#94a3b8', '#475569'];
    const bst = p.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

    const weaknesses = new Set();
    const resistances = new Set();

    damageData.forEach(d => {
        d.damage_relations.double_damage_from.forEach(t => weaknesses.add(t.name));
        d.damage_relations.half_damage_from.forEach(t => resistances.add(t.name));
        d.damage_relations.no_damage_from.forEach(t => resistances.add(t.name));
    });

    const finalWeak = Array.from(weaknesses).filter(w => !resistances.has(w));
    const finalRes = Array.from(resistances).filter(r => !weaknesses.has(r));

    const weakHtml = finalWeak.map(w => `<span class="type-badge" style="background:${COLORS[w]?.[0] || '#ccc'}">${w.toUpperCase()}</span>`).join('');
    const resHtml = finalRes.map(r => `<span class="type-badge" style="background:${COLORS[r]?.[1] || '#444'}">${r.toUpperCase()}</span>`).join('');
    const typesHtml = p.types.map(t => `<span style="color: ${COLORS[t.type.name][0]}">${t.type.name.toUpperCase()}</span>`).join(' / ');

    grid.innerHTML = `
        <article class="pokemon-card" style="border-color: ${color[0]}">
            <div class="card-banner" style="background: linear-gradient(135deg, ${color[0]}, ${color[1]})">
                <img src="${SPRITE_URL}${p.id}.png" class="pokemon-sprite">
            </div>
            <div class="card-info">
                <div class="title-row">
                    <div>
                        <p class="tagline">ID #${p.id} • ${typesHtml}</p>
                        <h2 class="name">${p.name}</h2>
                    </div>
                    <div style="text-align:right; min-width: 100px;">
                        <span class="bst-num">${bst}</span>
                        <p class="tagline" style="margin-top: 5px;">BST TOTAL</p>
                    </div>
                </div>
                <div class="go-details-grid">
                    <div class="detail-item"><strong>Fraquezas</strong><div>${weakHtml || 'Nenhuma'}</div></div>
                    <div class="detail-item"><strong>Resistências</strong><div>${resHtml || 'Nenhuma'}</div></div>
                    <div class="detail-item"><strong>Habilidades</strong><span style="text-transform:capitalize">${p.abilities[0].ability.name}</span></div>
                    <div class="detail-item"><strong>Felicidade</strong><span>${s.base_happiness}</span></div>
                </div>
                <div class="stat-label">Status Base</div>
                <div class="stats-row">
                    <p><strong>HP</strong> ${p.stats[0].base_stat}</p>
                    <p><strong>ATK</strong> ${p.stats[1].base_stat}</p>
                    <p><strong>DEF</strong> ${p.stats[2].base_stat}</p>
                    <p><strong>SPD</strong> ${p.stats[5].base_stat}</p>
                </div>
            </div>
        </article>`;
}

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
                div.onclick = () => { searchInput.value = name; box.style.display = 'none'; findElite(); };
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