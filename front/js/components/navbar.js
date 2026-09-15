import { store } from '../store.js';

export class AppNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <header class="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button id="logoBtn" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <i class="ph-bold ph-cooking-pot text-2xl text-emerald-600"></i>
                        <span class="font-bold text-xl tracking-tight text-slate-900">Cookmate<span class="text-emerald-600">Local</span></span>
                    </button>
                    <div id="navActions" class="flex items-center gap-3"></div>
                </div>
            </header>
        `;

        this.querySelector('#logoBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'list' }, bubbles: true }));
        });
    }

    setActions(actionsHtml, callbacks = {}) {
        const container = this.querySelector('#navActions');
        container.innerHTML = actionsHtml;
        Object.entries(callbacks).forEach(([id, callback]) => {
            const btn = container.querySelector(`#${id}`);
            if (btn) btn.addEventListener('click', callback);
        });
    }
}
customElements.define('app-navbar', AppNavbar);