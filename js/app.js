function renderBest(p, originalName) {
    const totalStats = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const mainType = p.types[0].type.name;
    const colors = TYPE_COLORS[mainType] || ['#9CA3AF', '#4B5563'];
    
    document.getElementById('grid').innerHTML = `
        <article class="pokemon-card">
            <div class="card-header" style="background: radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 100%)">
                <img src="${CONFIG.IMG_BASE}${p.id}.png" class="pokemon-img" alt="${p.name}">
            </div>
            
            <div class="card-body">
                <div class="info-row">
                    <div>
                        <p class="poke-origin">Evolução de ${originalName}</p>
                        <h2 class="poke-name">${p.name.replace(/-/g, ' ')}</h2>
                    </div>
                    <div class="bst-container">
                        <p class="bst-value">${totalStats}</p>
                        <p class="bst-label">Total BST</p>
                    </div>
                </div>

                <div class="stats-grid">
                    ${p.stats.map(s => `
                        <div class="stat-item">
                            <div class="stat-label-row">
                                <span class="stat-name">${s.stat.name}</span>
                                <span class="stat-number">${s.base_stat}</span>
                            </div>
                            <div class="bar-bg">
                                <div class="bar-fill" 
                                     style="width: ${(s.base_stat/160)*100}%; background-color: ${colors[0]}">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </article>`;
}
