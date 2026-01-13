// ==UserScript==
// @name         YouTube Suchfilter – Upload-Datum & Altersfilter
// @namespace    https://tampermonkey.net/
// @version      1.1
// @description  Sortierung nach Upload-Datum + Filter für sehr alte Videos (10/15/20 Jahre)
// @match        https://www.youtube.com/results*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const FILTER_ID = 'yt-advanced-upload-filter';

    function yearsAgo(years) {
        const d = new Date();
        d.setFullYear(d.getFullYear() - years);
        return d.toISOString().split('T')[0];
    }

    function updateSearch(extraQuery, sp = null) {
        const url = new URL(window.location.href);
        const q = url.searchParams.get('search_query') || '';

        if (!q.includes(extraQuery)) {
            url.searchParams.set('search_query', `${q} ${extraQuery}`.trim());
        }

        if (sp) url.searchParams.set('sp', sp);

        window.location.href = url.toString();
    }

    function button(label, action) {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = `
            margin:4px;
            padding:6px 12px;
            font-weight:700;
            border-radius:16px;
            border:1px solid #ccc;
            cursor:pointer;
            background:#fff;
        `;
        b.onclick = action;
        return b;
    }

    function inject() {
        if (document.getElementById(FILTER_ID)) return;

        const target = document.querySelector('ytd-search-sub-menu-renderer');
        if (!target) return;

        const box = document.createElement('div');
        box.id = FILTER_ID;
        box.style.cssText = `
            display:flex;
            flex-wrap:wrap;
            margin:10px 0;
        `;

        // Sortierung
        box.appendChild(button('⬆ Neueste zuerst', () => updateSearch('', 'CAI%3D')));
        box.appendChild(button('⬇ Älteste zuerst', () => updateSearch('', 'CAASAhAB')));

        // Altersfilter
        box.appendChild(button('📼 älter als 10 Jahre', () =>
            updateSearch(`before:${yearsAgo(10)}`)));

        box.appendChild(button('📼 älter als 15 Jahre', () =>
            updateSearch(`before:${yearsAgo(15)}`)));

        box.appendChild(button('📼 älter als 20 Jahre', () =>
            updateSearch(`before:${yearsAgo(20)}`)));

        target.parentNode.insertBefore(box, target.nextSibling);
    }

    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });

    inject();
})();
