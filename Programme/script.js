// Si la variable window.dataFromPython existe (injectée par data.js), on l'utilise directement
// Sinon, on affiche un message d'erreur

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('table-container');
    const legendContainer = document.createElement('div');
    legendContainer.className = 'legend';

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
            if (h === 'Détails produit' || h === 'Famille de molécule' || h === 'Fiche' || h === 'Indications_Data') return; // On ne veut plus de ces colonnes
            const th = document.createElement('th');
            th.textContent = h;
            if (h === 'DCI') th.style.textAlign = 'center';
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                if (h === 'Détails produit' || h === 'Famille de molécule' || h === 'Fiche' || h === 'Indications_Data') return; // On saute ces données ici

                const td = document.createElement('td');
                let val = (row[h] !== undefined && row[h] !== null) ? String(row[h]) : '';

                if (h === 'Indications' && Array.isArray(row['Indications_Data']) && row['Indications_Data'].length > 0) {
                    // On affiche toutes les indications, mais le bouton poso seulement si la posologie existe
                    const indicationsBlock = document.createElement('div');
                    indicationsBlock.style.width = '100%';
                    const indicationsData = row['Indications_Data'];
                    indicationsData.forEach((indicationObj) => {
                        const indDiv = document.createElement('div');
                        let color = '';
                        const rem = (indicationObj.remboursement || '').toLowerCase();
                        if (rem === 'amm') color = '#43b581';
                        if (rem === 'hors amm') color = '#e74c3c';
                        if (rem === 'amm non remboursé') color = '#a259d9';
                        if (rem === 'rtu') color = '#ff7043';
                        if (rem === 'groupe 3') color = '#5c6bc0';
                        if (rem === 'liste en sus') color = '#fbc02d';
                        if (color) {
                            indDiv.style.background = color;
                            indDiv.style.borderRadius = '6px';
                            indDiv.style.padding = '2px 8px';
                            indDiv.style.marginBottom = '2px';
                            indDiv.style.color = (color === '#ffe082') ? '#000' : '#fff';
                            indDiv.style.width = '100%';
                            indDiv.style.boxSizing = 'border-box';
                        }
                        // Texte indication + remboursement
                        let indicationText = indicationObj.indication ? indicationObj.indication.trim() : '';
                        if (rem) indicationText += ' (' + indicationObj.remboursement + ')';
                        const indicationContainer = document.createElement('span');
                        indicationContainer.textContent = indicationText;
                        // Bouton posologie si dispo
                        if (indicationObj.posologie && indicationObj.posologie.trim() !== '') {
                            const posologieBtn = document.createElement('button');
                            posologieBtn.textContent = 'Poso';
                            posologieBtn.className = 'posologie-btn action-btn';
                            posologieBtn.title = 'Voir la posologie';
                            posologieBtn.onclick = (e) => {
                                e.stopPropagation();
                                const posologieBody = document.getElementById('posologie-body');
                                const posologieModal = document.getElementById('posologie-modal');
                                posologieBody.innerHTML = '';
                                const indicationDiv = document.createElement('div');
                                indicationDiv.style.fontWeight = 'bold';
                                indicationDiv.style.marginBottom = '10px';
                                indicationDiv.style.color = '#333';
                                indicationDiv.textContent = indicationObj.indication;
                                posologieBody.appendChild(indicationDiv);
                                const posologieDiv = document.createElement('div');
                                posologieDiv.innerHTML = indicationObj.posologie.replace(/\n/g, '<br>');
                                posologieBody.appendChild(posologieDiv);
                                posologieModal.classList.remove('hidden');
                            };
                            indicationContainer.appendChild(posologieBtn);
                        }
                        indDiv.appendChild(indicationContainer);
                        indicationsBlock.appendChild(indDiv);
                    });
                    td.appendChild(indicationsBlock);
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
                    // Surlignage selon la famille de molécule
                    const famille = row['Famille de molécule'] ? row['Famille de molécule'].toLowerCase() : '';
                    if (famille === 'hors taa') {
                        td.style.background = '#8d6e63';
                        td.style.color = '#fff';
                    } else if (famille === 'anti infectieux') {
                        td.style.background = '#00bcd4';
                        td.style.color = '#fff';
                    }
                    // Le nom de la DCI est déjà dans le td.innerHTML
                    // On crée un conteneur pour les boutons en dessous
                    const btnContainer = document.createElement('div');
                    btnContainer.className = 'btn-container';
                    btnContainer.style.marginTop = '10px';

                    // Ajout du bouton 'Produits' si des détails existent
                    const detailsProduit = row['Détails produit'];
                    const fiche = row['Fiche'];
                    if (detailsProduit && detailsProduit.trim() !== '') {
                        const productBtn = document.createElement('button');
                        productBtn.textContent = 'Produits';
                        productBtn.className = 'product-btn action-btn';
                        productBtn.onclick = () => {
                            const productBody = document.getElementById('product-body');
                            const productModal = document.getElementById('product-modal');
                            productBody.innerHTML = '';
                            // On retire uniquement le contenu exact de la fiche du détail produit
                            let produits = detailsProduit;
                            if (fiche && fiche.trim() !== '') {
                                // On retire la fiche si elle est présente dans le détail produit
                                produits = produits.replace(fiche, '');
                            }
                            produits.split(/\n\n|\r\n\r\n/).forEach(prod => {
                                const lines = prod.split(/\n|\r\n/);
                                lines.forEach((line) => {
                                    // On ignore toute ligne qui commence par '• Fiche :' (avec ou sans espaces)
                                    if (/^•?\s*Fiche\s*:/i.test(line.trim())) return;
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
                                    if (div.textContent.trim() !== '') productBody.appendChild(div);
                                });
                            });
                            productModal.classList.remove('hidden');
                        };
                        btnContainer.appendChild(productBtn);
                    }
                    
                    // Ajout du bouton 'Fiche' si une fiche existe
                    if (fiche && fiche.trim() !== '') {
                        const ficheBtn = document.createElement('button');
                        ficheBtn.textContent = 'Fiche';
                        ficheBtn.className = 'fiche-btn action-btn';
                        ficheBtn.onclick = () => {
                            const ficheBody = document.getElementById('fiche-body');
                            const ficheModal = document.getElementById('fiche-modal');
                            // On transforme les liens en hyperliens cliquables
                            let ficheHtml = fiche
                                // Liens web d'abord
                                .replace(/(https?:\/\/[^\s"']+)/gi, '<a href="$1" target="_blank">$1</a>')
                                // Chemins UNC réseau (\\serveur\... ou //serveur/...) qui ne sont pas déjà dans un lien web
                                .replace(/(^|[^\w:>])((?:\\\\|\/\/)[^\s"']+)/g, function(match, p1, p2) {
                                    // On ne transforme pas si précédé de http(s):
                                    if (/https?:$/.test(p1)) return match;
                                    return p1 + `<a href="file:///${p2.replace(/\\/g, '/')}" target="_blank">${p2}</a>`;
                                })
                                // Chemins locaux de type X:\... ou X:/...
                                .replace(/\b([A-Z]:[\\/][^\s"']+)/gi, function(match) {
                                    return `<a href="file:///${match.replace(/\\/g, '/')}" target="_blank">${match}</a>`;
                                });
                            ficheBody.innerHTML = ficheHtml.replace(/\n/g, '<br>');
                            ficheModal.classList.remove('hidden');
                        };
                        btnContainer.appendChild(ficheBtn);
                    }

                    if (btnContainer.hasChildNodes()) {
                        td.appendChild(btnContainer);
                    }
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

    // Suppression de toute création dynamique du bouton Impression avancée

    // Gestion exclusive des modales info/recherche
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeModal = document.getElementById('close-modal');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearchModal = document.getElementById('close-search-modal');

    if (infoBtn && infoModal && closeModal && searchBtn && searchModal && closeSearchModal) {
        infoBtn.onclick = function() {
            // Fermer la modale recherche si ouverte
            if (!searchModal.classList.contains('hidden')) searchModal.classList.add('hidden');
            infoModal.classList.remove('hidden');
            // Injecter la date de mise à jour si disponible
            if (window.dataFromPython && window.dataFromPython.lastUpdate) {
                const majDiv = document.getElementById('maj-info');
                if (majDiv) majDiv.innerHTML = `<b>Dernière mise à jour du tableau :</b> ${window.dataFromPython.lastUpdate}`;
            }
        };
        closeModal.onclick = function() {
            infoModal.classList.add('hidden');
        };
        searchBtn.onclick = function() {
            // Fermer la modale info si ouverte
            if (!infoModal.classList.contains('hidden')) infoModal.classList.add('hidden');
            searchModal.classList.remove('hidden');
        };
        closeSearchModal.onclick = function() {
            searchModal.classList.add('hidden');
        };
    }

    // Gestion de la modale produits
    const productModal = document.getElementById('product-modal');
    const closeProductModal = document.getElementById('close-product-modal');
    if (productModal && closeProductModal) {
        closeProductModal.onclick = () => productModal.classList.add('hidden');
        productModal.onclick = (e) => { if (e.target === productModal) productModal.classList.add('hidden'); };
    }

    // Gestion de la modale fiche
    const ficheModal = document.getElementById('fiche-modal');
    const closeFicheModal = document.getElementById('close-fiche-modal');
    if (ficheModal && closeFicheModal) {
        closeFicheModal.onclick = () => ficheModal.classList.add('hidden');
        ficheModal.onclick = (e) => { if (e.target === ficheModal) ficheModal.classList.add('hidden'); };
    }

    // Gestion de la modale posologie
    const posologieModal = document.getElementById('posologie-modal');
    const closePosologieModal = document.getElementById('close-posologie-modal');
    if (posologieModal && closePosologieModal) {
        closePosologieModal.onclick = () => posologieModal.classList.add('hidden');
        posologieModal.onclick = (e) => { if (e.target === posologieModal) posologieModal.classList.add('hidden'); };
    }

    // Gestion de la fenêtre de recherche (modal)
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
    let lastFamilleVal = '';
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
            // Générer la liste des familles de molécule uniques
            const familleSet = new Set(allData.map(row => row['Famille de molécule'] || '').filter(Boolean));
            const familleList = Array.from(familleSet).sort((a, b) => a.localeCompare(b, 'fr', {sensitivity:'base'}));
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
                <label for='famille-select'><b>Filtrer par famille de molécule :</b></label><br>
                <select id='famille-select' style='width:90%;margin-bottom:12px;padding:6px;'>
                    <option value=''>Toutes</option>
                    ${familleList.map(fam => `<option value="${fam}"${lastFamilleVal === fam ? ' selected' : ''}>${fam}</option>`).join('')}
                </select>
                <br>
                <b>Filtrer les indications par remboursement :</b><br>
                <label><input type='checkbox' class='remb-filter' value='AMM' ${lastRembChecked.includes('AMM') ? 'checked' : ''}> AMM</label>
                <label><input type='checkbox' class='remb-filter' value='Hors AMM' ${lastRembChecked.includes('Hors AMM') ? 'checked' : ''}> Hors AMM</label>
                <label><input type='checkbox' class='remb-filter' value='AMM non remboursé' ${lastRembChecked.includes('AMM non remboursé') ? 'checked' : ''}> AMM non remboursé</label>
                <label><input type='checkbox' class='remb-filter' value='RTU' ${lastRembChecked.includes('RTU') ? 'checked' : ''}> RTU</label>
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
                const familleVal = document.getElementById('famille-select').value.trim();
                const rembChecked = Array.from(document.querySelectorAll('.remb-filter:checked')).map(cb => cb.value);
                // Correction : si aucun filtre n'est appliqué, on affiche tout
                if (!dciVal && !indVal && !familleVal && rembChecked.length === 6) {
                    renderTable(allData, lastUpdate);
                    searchModal.classList.add('hidden');
                    return;
                }
                // Mémoriser les derniers filtres
                lastDciVal = dciVal;
                lastIndVal = indVal;
                lastFamilleVal = familleVal;
                lastRembChecked = rembChecked.length ? rembChecked : [];
                // Filtrage
                let filtered = allData;
                // 1. Filtre DCI
                if (dciVal) {
                    filtered = filtered.filter(row => (row.DCI || '').toLowerCase() === dciVal.toLowerCase());
                }
                // 2. Filtre famille
                if (familleVal) {
                    filtered = filtered.filter(row => (row['Famille de molécule'] || '').toLowerCase() === familleVal.toLowerCase());
                }
                // 3. Filtre indication + remboursement
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
                                if (!rembChecked.some(val => rem && rem === val.toLowerCase())) return false;
                            } else if (!keep) {
                                return false;
                            }
                            return keep;
                        }).join('\n');
                    }
                    // On filtre aussi Indications_Data si elle existe
                    if (Array.isArray(row.Indications_Data)) {
                        newRow.Indications_Data = row.Indications_Data.filter(indObj => {
                            let keep = true;
                            if (indVal && indObj.indication) {
                                keep = indObj.indication.toLowerCase().includes(indVal.toLowerCase());
                            }
                            if (indObj.remboursement) {
                                const rem = indObj.remboursement.toLowerCase();
                                if (!rembChecked.some(val => rem && rem === val.toLowerCase())) return false;
                            } else if (!keep) {
                                return false;
                            }
                            return keep;
                        });
                    }
                    return newRow;
                })
                // 4. On ne garde que les lignes où il reste au moins une indication après filtrage
                .filter(row => {
                    if ((indVal || rembChecked.length < 6) && row.Indications_Data !== undefined) {
                        return Array.isArray(row.Indications_Data) && row.Indications_Data.length > 0;
                    }
                    if ((indVal || rembChecked.length < 6) && row.Indications !== undefined) {
                        return row.Indications && row.Indications.trim() !== '';
                    }
                    return true;
                });
                // Après le filtrage et juste avant renderTable(filtered, lastUpdate)
                if (filtered.length === 0) {
                    // Affiche le message à droite du bouton Réinitialiser
                    let noResultMsg = document.getElementById('no-result-msg');
                    if (!noResultMsg) {
                        noResultMsg = document.createElement('span');
                        noResultMsg.id = 'no-result-msg';
                        noResultMsg.style.color = '#d32f2f';
                        noResultMsg.style.fontWeight = 'bold';
                        noResultMsg.style.marginLeft = '18px';
                        noResultMsg.textContent = 'pas de résultat';
                        const resetBtn = document.getElementById('reset-search');
                        if (resetBtn) resetBtn.parentNode.insertBefore(noResultMsg, resetBtn.nextSibling);
                    } else {
                        noResultMsg.textContent = 'pas de résultat';
                        noResultMsg.style.display = '';
                    }
                } else {
                    // Cache le message si des résultats existent
                    const noResultMsg = document.getElementById('no-result-msg');
                    if (noResultMsg) noResultMsg.style.display = 'none';
                }
                renderTable(filtered, lastUpdate);
                searchModal.classList.add('hidden');
            }
            if (e.target && e.target.id === 'reset-search') {
                lastDciVal = '';
                lastIndVal = '';
                lastFamilleVal = '';
                lastRembChecked = ['AMM', 'Hors AMM', 'Groupe 3', 'Liste en sus'];
                renderTable(allData, lastUpdate);
                searchModal.classList.add('hidden');
            }
        };
    }

    const advancedPrintBtn = document.getElementById('advanced-print-btn');
    if (advancedPrintBtn) {
        advancedPrintBtn.onclick = () => window.open('imprimer.html', '_blank');
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
        if (h === 'Détails produit' || h === 'Famille de molécule' || h === 'Fiche' || h === 'Indications_Data') return; // On saute ces données ici
        const th = document.createElement('th');
        th.textContent = h;
        if (h === 'DCI') th.style.textAlign = 'center';
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            if (h === 'Détails produit' || h === 'Famille de molécule' || h === 'Fiche' || h === 'Indications_Data') return; // On saute ces données ici

            const td = document.createElement('td');
            let val = (row[h] !== undefined && row[h] !== null) ? String(row[h]) : '';

            if (h === 'Indications' && Array.isArray(row['Indications_Data']) && row['Indications_Data'].length > 0) {
                // On affiche toutes les indications, mais le bouton poso seulement si la posologie existe
                const indicationsBlock = document.createElement('div');
                indicationsBlock.style.width = '100%';
                const indicationsData = row['Indications_Data'];
                indicationsData.forEach((indicationObj) => {
                    const indDiv = document.createElement('div');
                    let color = '';
                    const rem = (indicationObj.remboursement || '').toLowerCase();
                    if (rem === 'amm') color = '#43b581';
                    if (rem === 'hors amm') color = '#e74c3c';
                    if (rem === 'amm non remboursé') color = '#a259d9';
                    if (rem === 'rtu') color = '#ff7043';
                    if (rem === 'groupe 3') color = '#5c6bc0';
                    if (rem === 'liste en sus') color = '#fbc02d';
                    if (color) {
                        indDiv.style.background = color;
                        indDiv.style.borderRadius = '6px';
                        indDiv.style.padding = '2px 8px';
                        indDiv.style.marginBottom = '2px';
                        indDiv.style.color = (color === '#ffe082') ? '#000' : '#fff';
                        indDiv.style.width = '100%';
                        indDiv.style.boxSizing = 'border-box';
                    }
                    // Texte indication + remboursement
                    let indicationText = indicationObj.indication ? indicationObj.indication.trim() : '';
                    if (rem) indicationText += ' (' + indicationObj.remboursement + ')';
                    const indicationContainer = document.createElement('span');
                    indicationContainer.textContent = indicationText;
                    // Bouton posologie si dispo
                    if (indicationObj.posologie && indicationObj.posologie.trim() !== '') {
                        const posologieBtn = document.createElement('button');
                        posologieBtn.textContent = 'Poso';
                        posologieBtn.className = 'posologie-btn action-btn';
                        posologieBtn.title = 'Voir la posologie';
                        posologieBtn.onclick = (e) => {
                            e.stopPropagation();
                            const posologieBody = document.getElementById('posologie-body');
                            const posologieModal = document.getElementById('posologie-modal');
                            posologieBody.innerHTML = '';
                            const indicationDiv = document.createElement('div');
                            indicationDiv.style.fontWeight = 'bold';
                            indicationDiv.style.marginBottom = '10px';
                            indicationDiv.style.color = '#333';
                            indicationDiv.textContent = indicationObj.indication;
                            posologieBody.appendChild(indicationDiv);
                            const posologieDiv = document.createElement('div');
                            posologieDiv.innerHTML = indicationObj.posologie.replace(/\n/g, '<br>');
                            posologieBody.appendChild(posologieDiv);
                            posologieModal.classList.remove('hidden');
                        };
                        indicationContainer.appendChild(posologieBtn);
                    }
                    indDiv.appendChild(indicationContainer);
                    indicationsBlock.appendChild(indDiv);
                });
                td.appendChild(indicationsBlock);
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
                // Surlignage selon la famille de molécule
                const famille = row['Famille de molécule'] ? row['Famille de molécule'].toLowerCase() : '';
                if (famille === 'hors taa') {
                    td.style.background = '#8d6e63';
                    td.style.color = '#fff';
                } else if (famille === 'anti infectieux') {
                    td.style.background = '#00bcd4';
                    td.style.color = '#fff';
                }
                // Le nom de la DCI est déjà dans le td.innerHTML
                // On crée un conteneur pour les boutons en dessous
                const btnContainer = document.createElement('div');
                btnContainer.className = 'btn-container';
                btnContainer.style.marginTop = '10px';

                // Ajout du bouton 'Produits' si des détails existent
                const detailsProduit = row['Détails produit'];
                const fiche = row['Fiche'];
                if (detailsProduit && detailsProduit.trim() !== '') {
                    const productBtn = document.createElement('button');
                    productBtn.textContent = 'Produits';
                    productBtn.className = 'product-btn action-btn';
                    productBtn.onclick = () => {
                        const productBody = document.getElementById('product-body');
                        const productModal = document.getElementById('product-modal');
                        productBody.innerHTML = '';
                        // On retire uniquement le contenu exact de la fiche du détail produit
                        let produits = detailsProduit;
                        if (fiche && fiche.trim() !== '') {
                            // On retire la fiche si elle est présente dans le détail produit
                            produits = produits.replace(fiche, '');
                        }
                        produits.split(/\n\n|\r\n\r\n/).forEach(prod => {
                            const lines = prod.split(/\n|\r\n/);
                            lines.forEach((line) => {
                                // On ignore toute ligne qui commence par '• Fiche :' (avec ou sans espaces)
                                if (/^•?\s*Fiche\s*:/i.test(line.trim())) return;
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
                                if (div.textContent.trim() !== '') productBody.appendChild(div);
                            });
                        });
                        productModal.classList.remove('hidden');
                    };
                    btnContainer.appendChild(productBtn);
                }
                
                // Ajout du bouton 'Fiche' si une fiche existe
                if (fiche && fiche.trim() !== '') {
                    const ficheBtn = document.createElement('button');
                    ficheBtn.textContent = 'Fiche';
                    ficheBtn.className = 'fiche-btn action-btn';
                    ficheBtn.onclick = () => {
                        const ficheBody = document.getElementById('fiche-body');
                        const ficheModal = document.getElementById('fiche-modal');
                        // On transforme les liens en hyperliens cliquables
                        let ficheHtml = fiche
                            // Liens web d'abord
                            .replace(/(https?:\/\/[^\s"']+)/gi, '<a href="$1" target="_blank">$1</a>')
                            // Chemins UNC réseau (\\serveur\... ou //serveur/...) qui ne sont pas déjà dans un lien web
                            .replace(/(^|[^\w:>])((?:\\\\|\/\/)[^\s"']+)/g, function(match, p1, p2) {
                                // On ne transforme pas si précédé de http(s):
                                if (/https?:$/.test(p1)) return match;
                                return p1 + `<a href="file:///${p2.replace(/\\/g, '/')}" target="_blank">${p2}</a>`;
                            })
                            // Chemins locaux de type X:\... ou X:/...
                            .replace(/\b([A-Z]:[\\/][^\s"']+)/gi, function(match) {
                                return `<a href="file:///${match.replace(/\\/g, '/')}" target="_blank">${match}</a>`;
                            });
                        ficheBody.innerHTML = ficheHtml.replace(/\n/g, '<br>');
                        ficheModal.classList.remove('hidden');
                    };
                    btnContainer.appendChild(ficheBtn);
                }

                if (btnContainer.hasChildNodes()) {
                    td.appendChild(btnContainer);
                }
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