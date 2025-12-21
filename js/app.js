const POKE_API = "https://pokeapi.co/api/v2/";
const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

let allPokemonNames = [];

async function initSearch() {
    try {
        const res = await fetch(`${POKE_API}pokemon?limit=1000`);
        const data = await res.json();
        allPokemonNames = data.results.map(p => p.name);
    } catch (err) { console.error("Erro ao carregar nomes"); }
}

async function findElite() {
    const input = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#cbd5e1;">PROCESSANDO DADOS...</p>`;

    try {
        const pokemon = await fetch(`${POKE_API}pokemon/${query}`).then(r => r.json());
        const species = await fetch(pokemon.species.url).then(r => r.json());
        const evoChain = await fetch(species.evolution_chain.url).then(r => r.json());

        renderCard(pokemon, species, evoChain);
    } catch (err) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; font-weight:900; color:#f87171;">POKÉMON NÃO ENCONTRADO</p>`;
    }
}

function renderCard(p, s, e) {
    const grid = document.getElementById('grid');

    const countEvos = (chain) => {
        let count = 0;
        let current = chain;
        while (current.evolves_to.length > 0) {
            count++;
            current = current.evolves_to[0];
        }
        return count;
    };

    let method = "Nível ou Especial";
    if (e.chain.evolves_to[0]?.evolution_details[0]) {
        const det = e.chain.evolves_to[0].evolution_details[0];
        method = det.min_level ? `Level ${det.min_level}` : (det.item?.name || "Especial");
    }

    grid.innerHTML = `
        <article class="pokemon-card">
            <div class="card-banner" style="background: #2563eb">
                <img src="${SPRITE_URL}${p.id}.png" class="pokemon-sprite">
            </div>
            <div class="card-info">
                <div class="title-row">
                    <div><p class="tagline">ID #${p.id}</p><h2 class="name">${p.name}</h2></div>
                    <div style="text-align:right">
                        <span class="bst-num">${p.stats.reduce((acc, s) => acc + s.base_stat, 0)}</span>
                        <p class="tagline">BST TOTAL</p>
                    </div>
                </div>

                <div class="go-details-grid">
                    <div class="detail-item"><strong>Evoluções</strong><span>${countEvos(e.chain)} estágio(s)</span></div>
                    <div class="detail-item"><strong>Método</strong><span>${method}</span></div>
                    <div class="detail-item"><strong>Ovos</strong><span>${s.egg_groups[0]?.name || "Desconhecido"}</span></div>
                    <div class="detail-item"><strong>Felicidade</strong><span>${s.base_happiness} base</span></div>
                </div>

                <div class="stat-label">Status de Combate</div>
                <div class="stats-row">
                    <p><strong>ATK</strong> ${p.stats[1].base_stat}</p>
                    <p><strong>DEF</strong> ${p.stats[2].base_stat}</p>
                    <p><strong>SPD</strong> ${p.stats[5].base_stat}</p>
                </div>
                <div class="data-source"><small>FONTE: POKEAPI.CO (OFICIAL)</small></div>
            </div>
        </article>`;
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    const box = document.getElementById('customSuggestions');
    box.innerHTML = '';
    if (val.length > 0) {
        const matches = allPokemonNames.filter(name => name.startsWith(val)).slice(0, 5);
        matches.forEach(name => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = name;
            div.onclick = () => {
                document.getElementById('searchInput').value = name;
                box.style.display = 'none';
                findElite();
            };
            box.appendChild(div);
        });
        box.style.display = matches.length ? 'block' : 'none';
    } else { box.style.display = 'none'; }
});

document.getElementById('searchInput').addEventListener('keypress', e => e.key === 'Enter' && findElite());

initSearch();