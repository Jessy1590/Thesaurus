// Si la variable window.dataFromPython existe (injectée par data.js), on l'utilise directement
// Sinon, on affiche un message d'erreur

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('table-container');
    const legendContainer = document.createElement('div');
    legendContainer.className = 'legend';
    legendContainer.innerHTML = `
        <div style="margin-top:32px; font-size:1.05em;">
            <b>Légende couleurs indications :</b><br>
            <span style="color:#fff; background:#4caf50; padding:2px 8px; border-radius:6px;">AMM</span> : Autorisation de Mise sur le Marché<br>
            <span style="color:#fff; background:#e53935; padding:2px 8px; border-radius:6px;">Hors AMM</span> : Hors Autorisation de Mise sur le Marché<br>
            <span style="color:#fff; background:#1976d2; padding:2px 8px; border-radius:6px;">Groupe 3</span> : Groupe 3<br>
            <span style="color:#000; background:#ffe082; padding:2px 8px; border-radius:6px;">Liste en sus</span> : Liste en sus
        </div>
    `;
    const majContainer = document.createElement('div');
    majContainer.className = 'maj';
    majContainer.style.marginTop = '18px';
    majContainer.style.fontSize = '1em';

    if (window.dataFromPython && Array.isArray(window.dataFromPython.tableData) && window.dataFromPython.tableData.length > 0) {
        const data = window.dataFromPython.tableData;
        const lastUpdate = window.dataFromPython.lastUpdate;
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        // En-têtes
        const headers = Object.keys(data[0]);
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            if (h === 'DCI') th.style.textAlign = 'center';
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                let val = (row[h] !== undefined && row[h] !== null) ? String(row[h]) : '';
                // Affichage des listes à puces et retours à la ligne
                if (h === 'Détails produit' && val.includes('Produit')) {
                    // Séparer par double saut de ligne pour chaque produit
                    const produits = val.split(/\n\n|\r\n\r\n/);
                    produits.forEach(prod => {
                        // Surligner la ligne 'Produit X :'
                        const lines = prod.split(/\n|\r\n/);
                        lines.forEach((line, idx) => {
                            const div = document.createElement('div');
                            if (/^\s*Produit \d+\s*:/i.test(line)) {
                                div.textContent = line.trim();
                                div.style.background = '#f0f0f0';
                                div.style.fontWeight = 'bold';
                                div.style.padding = '2px 8px';
                                div.style.margin = '6px 0 2px 0';
                                div.style.borderRadius = '6px';
                            } else if (line.trim().startsWith('•')) {
                                div.textContent = line.trim();
                                div.style.marginLeft = '18px';
                            } else {
                                div.textContent = line.trim();
                            }
                            td.appendChild(div);
                        });
                    });
                } else if (h === 'Indications' && val.includes('•')) {
                    // On sépare chaque puce et on crée une liste colorée
                    const items = val.split('\n').map(x => x.trim()).filter(Boolean);
                    const ul = document.createElement('ul');
                    ul.style.margin = '0';
                    ul.style.paddingLeft = '1.2em';
                    items.forEach(item => {
                        const li = document.createElement('li');
                        // Chercher le remboursement entre parenthèses
                        const match = item.match(/\(([^)]+)\)$/i);
                        let color = '';
                        if (match) {
                            const rem = match[1].toLowerCase();
                            if (rem.includes('amm')) color = '#4caf50';
                            if (rem.includes('hors amm')) color = '#e53935';
                            if (rem.includes('groupe 3')) color = '#1976d2';
                            if (rem.includes('liste en sus')) color = '#ffe082';
                        }
                        if (color) {
                            li.style.background = color;
                            li.style.borderRadius = '6px';
                            li.style.padding = '2px 8px';
                            li.style.marginBottom = '2px';
                            li.style.color = (color === '#ffe082') ? '#000' : '#fff';
                        }
                        li.textContent = item.replace(/^•\s*/, '');
                        ul.appendChild(li);
                    });
                    td.appendChild(ul);
                } else if (val.includes('•')) {
                    // Pour les autres listes à puces
                    const items = val.split('\n').map(x => x.trim()).filter(Boolean);
                    const ul = document.createElement('ul');
                    ul.style.margin = '0';
                    ul.style.paddingLeft = '1.2em';
                    items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item.replace(/^•\s*/, '');
                        ul.appendChild(li);
                    });
                    td.appendChild(ul);
                } else {
                    // Sinon, on gère les retours à la ligne simples
                    td.innerHTML = val.replace(/\n/g, '<br>');
                }
                if (h === 'DCI') {
                    td.style.textAlign = 'center';
                    td.style.verticalAlign = 'middle';
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
        // Ajout de la date de mise à jour
        majContainer.innerHTML = `<b>Dernière mise à jour du tableau :</b> ${lastUpdate}`;
        container.appendChild(legendContainer);
        container.appendChild(majContainer);
    } else {
        container.innerHTML = '<div class="loader">Aucune donnée à afficher ou données manquantes.</div>';
    }

    // Ajout modal info
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeModal = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');
    if (infoBtn && infoModal && closeModal && modalBody) {
        infoBtn.onclick = () => {
            // Générer le contenu de la modale (légende + date MAJ)
            let legend = `
                <div style=\"font-size:1.08em;\">
                    <b>Légende couleurs indications :</b><br>
                    <span style=\"color:#fff; background:#4caf50; padding:2px 8px; border-radius:6px;\">AMM</span> : Autorisation de Mise sur le Marché<br>
                    <span style=\"color:#fff; background:#e53935; padding:2px 8px; border-radius:6px;\">Hors AMM</span> : Hors Autorisation de Mise sur le Marché<br>
                    <span style=\"color:#fff; background:#1976d2; padding:2px 8px; border-radius:6px;\">Groupe 3</span> : Groupe 3<br>
                    <span style=\"color:#000; background:#ffe082; padding:2px 8px; border-radius:6px;\">Liste en sus</span> : Liste en sus
                </div>
            `;
            let maj = '';
            if (window.dataFromPython && window.dataFromPython.lastUpdate) {
                maj = `<div style=\"margin-top:18px;\"><b>Dernière mise à jour du tableau :</b> ${window.dataFromPython.lastUpdate}</div>`;
            }
            modalBody.innerHTML = legend + maj;
            infoModal.classList.remove('hidden');
        };
        closeModal.onclick = () => infoModal.classList.add('hidden');
        infoModal.onclick = (e) => { if (e.target === infoModal) infoModal.classList.add('hidden'); };
    }

    // Gestion de la fenêtre de recherche (modal)
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchModal = document.getElementById('close-search-modal');
    const searchBody = document.getElementById('search-body');
    let allData = null;
    let lastUpdate = '';
    if (window.dataFromPython) {
        allData = window.dataFromPython.tableData;
        lastUpdate = window.dataFromPython.lastUpdate;
    }
    // Variables pour mémoriser les derniers filtres appliqués
    let lastDciVal = '';
    let lastIndVal = '';
    let lastRembChecked = ['AMM', 'Hors AMM', 'Groupe 3', 'Liste en sus'];

    if (searchBtn && searchModal && closeSearchModal && searchBody && allData) {
        searchBtn.onclick = () => {
            // Générer la liste des DCI uniques (triées)
            const dciList = Array.from(new Set(allData.map(row => row.DCI))).sort((a, b) => a.localeCompare(b, 'fr', {sensitivity:'base'}));
            // Générer la liste des indications uniques (triées)
            let indicationsSet = new Set();
            allData.forEach(row => {
                if (row.Indications && typeof row.Indications === 'string') {
                    row.Indications.split('\n').forEach(item => {
                        const ind = item.replace(/^•\s*/, '').replace(/\s*\(.*\)$/, '').trim();
                        if (ind) indicationsSet.add(ind);
                    });
                }
            });
            const indicationsList = Array.from(indicationsSet).sort((a, b) => a.localeCompare(b, 'fr', {sensitivity:'base'}));
            // Générer le formulaire avec valeurs mémorisées
            searchBody.innerHTML = `
                <label for='dci-select'><b>Filtrer par DCI :</b></label><br>
                <input list='dci-datalist' id='dci-select' placeholder='Commencez à taper une DCI...' style='width:90%;margin-bottom:12px;padding:6px;' value="${lastDciVal}">
                <datalist id='dci-datalist'>
                    ${dciList.map(dci => `<option value="${dci}">`).join('')}
                </datalist>
                <br>
                <label for='indication-select'><b>Filtrer par indication :</b></label><br>
                <input list='indication-datalist' id='indication-select' placeholder='Commencez à taper une indication...' style='width:90%;margin-bottom:12px;padding:6px;' value="${lastIndVal}">
                <datalist id='indication-datalist'>
                    ${indicationsList.map(ind => `<option value="${ind}">`).join('')}
                </datalist>
                <br>
                <b>Filtrer les indications par remboursement :</b><br>
                <label><input type='checkbox' class='remb-filter' value='AMM' ${lastRembChecked.includes('AMM') ? 'checked' : ''}> AMM</label>
                <label><input type='checkbox' class='remb-filter' value='Hors AMM' ${lastRembChecked.includes('Hors AMM') ? 'checked' : ''}> Hors AMM</label>
                <label><input type='checkbox' class='remb-filter' value='Groupe 3' ${lastRembChecked.includes('Groupe 3') ? 'checked' : ''}> Groupe 3</label>
                <label><input type='checkbox' class='remb-filter' value='Liste en sus' ${lastRembChecked.includes('Liste en sus') ? 'checked' : ''}> Liste en sus</label>
                <br><br>
                <button id='apply-search' style='margin-right:10px;'>Appliquer</button>
                <button id='reset-search'>Réinitialiser</button>
            `;
            searchModal.classList.remove('hidden');
        };
        closeSearchModal.onclick = () => searchModal.classList.add('hidden');
        searchModal.onclick = (e) => { if (e.target === searchModal) searchModal.classList.add('hidden'); };
        // Appliquer le filtre
        searchBody.onclick = (e) => {
            if (e.target && e.target.id === 'apply-search') {
                const dciVal = document.getElementById('dci-select').value.trim();
                const indVal = document.getElementById('indication-select').value.trim();
                const rembChecked = Array.from(document.querySelectorAll('.remb-filter:checked')).map(cb => cb.value);
                // Mémoriser les derniers filtres
                lastDciVal = dciVal;
                lastIndVal = indVal;
                lastRembChecked = rembChecked.length ? rembChecked : [];
                // Filtrage
                let filtered = allData;
                // 1. Filtre DCI
                if (dciVal) {
                    filtered = filtered.filter(row => (row.DCI || '').toLowerCase() === dciVal.toLowerCase());
                }
                // 2. Filtre indication + remboursement
                filtered = filtered.map(row => {
                    let newRow = {...row};
                    if (row.Indications && typeof row.Indications === 'string') {
                        const items = row.Indications.split('\n').filter(Boolean);
                        // On garde les indications qui matchent l'indication recherchée ET le remboursement
                        newRow.Indications = items.filter(item => {
                            // Filtre indication (partiel, insensible à la casse)
                            let keep = true;
                            if (indVal) {
                                const ind = item.replace(/^•\s*/, '').replace(/\s*\(.*\)$/, '').trim().toLowerCase();
                                keep = ind.includes(indVal.toLowerCase());
                            }
                            // Filtre remboursement
                            const match = item.match(/\(([^)]+)\)$/i);
                            if (match) {
                                const rem = match[1].toLowerCase();
                                if (!rembChecked.some(val => rem && rem.includes(val.toLowerCase()))) return false;
                            } else if (!keep) {
                                return false;
                            }
                            return keep;
                        }).join('\n');
                    }
                    return newRow;
                })
                // 3. On ne garde que les lignes où il reste au moins une indication si un filtre indication/remb est actif
                .filter(row => {
                    if ((indVal || rembChecked.length < 4) && row.Indications !== undefined) {
                        return row.Indications && row.Indications.trim() !== '';
                    }
                    return true;
                });
                renderTable(filtered, lastUpdate);
                searchModal.classList.add('hidden');
            }
            if (e.target && e.target.id === 'reset-search') {
                lastDciVal = '';
                lastIndVal = '';
                lastRembChecked = ['AMM', 'Hors AMM', 'Groupe 3', 'Liste en sus'];
                renderTable(allData, lastUpdate);
                searchModal.classList.add('hidden');
            }
        };
    }
});

// Refactorisation du rendu du tableau pour pouvoir le rappeler avec des données filtrées
function renderTable(data, lastUpdate) {
    const container = document.getElementById('table-container');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    // En-têtes
    const headers = Object.keys(data[0]);
    const trHead = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        if (h === 'DCI') th.style.textAlign = 'center';
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            let val = (row[h] !== undefined && row[h] !== null) ? String(row[h]) : '';
            // Affichage des listes à puces et retours à la ligne
            if (h === 'Détails produit' && val.includes('Produit')) {
                // Séparer par double saut de ligne pour chaque produit
                const produits = val.split(/\n\n|\r\n\r\n/);
                produits.forEach(prod => {
                    // Surligner la ligne 'Produit X :'
                    const lines = prod.split(/\n|\r\n/);
                    lines.forEach((line, idx) => {
                        const div = document.createElement('div');
                        if (/^\s*Produit \d+\s*:/i.test(line)) {
                            div.textContent = line.trim();
                            div.style.background = '#f0f0f0';
                            div.style.fontWeight = 'bold';
                            div.style.padding = '2px 8px';
                            div.style.margin = '6px 0 2px 0';
                            div.style.borderRadius = '6px';
                        } else if (line.trim().startsWith('•')) {
                            div.textContent = line.trim();
                            div.style.marginLeft = '18px';
                        } else {
                            div.textContent = line.trim();
                        }
                        td.appendChild(div);
                    });
                });
            } else if (h === 'Indications' && val.includes('•')) {
                // On sépare chaque puce et on crée une liste colorée
                const items = val.split('\n').map(x => x.trim()).filter(Boolean);
                const ul = document.createElement('ul');
                ul.style.margin = '0';
                ul.style.paddingLeft = '1.2em';
                items.forEach(item => {
                    const li = document.createElement('li');
                    // Chercher le remboursement entre parenthèses
                    const match = item.match(/\(([^)]+)\)$/i);
                    let color = '';
                    if (match) {
                        const rem = match[1].toLowerCase();
                        if (rem.includes('amm')) color = '#4caf50';
                        if (rem.includes('hors amm')) color = '#e53935';
                        if (rem.includes('groupe 3')) color = '#1976d2';
                        if (rem.includes('liste en sus')) color = '#ffe082';
                    }
                    if (color) {
                        li.style.background = color;
                        li.style.borderRadius = '6px';
                        li.style.padding = '2px 8px';
                        li.style.marginBottom = '2px';
                        li.style.color = (color === '#ffe082') ? '#000' : '#fff';
                    }
                    li.textContent = item.replace(/^•\s*/, '');
                    ul.appendChild(li);
                });
                td.appendChild(ul);
            } else if (val.includes('•')) {
                // Pour les autres listes à puces
                const items = val.split('\n').map(x => x.trim()).filter(Boolean);
                const ul = document.createElement('ul');
                ul.style.margin = '0';
                ul.style.paddingLeft = '1.2em';
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.replace(/^•\s*/, '');
                    ul.appendChild(li);
                });
                td.appendChild(ul);
            } else {
                // Sinon, on gère les retours à la ligne simples
                td.innerHTML = val.replace(/\n/g, '<br>');
            }
            if (h === 'DCI') {
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
    // Ajout de la date de mise à jour
    const majContainer = document.createElement('div');
    majContainer.className = 'maj';
    majContainer.style.marginTop = '18px';
    majContainer.style.fontSize = '1em';
    majContainer.innerHTML = `<b>Dernière mise à jour du tableau :</b> ${lastUpdate}`;
    container.appendChild(majContainer);
} 