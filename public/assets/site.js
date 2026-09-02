/* Theme handling: follow the system by default, remember a manual choice.
   Loaded synchronously in <head> so the theme applies before first paint. */
(function () {
    var root = document.documentElement;

    try {
        var saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            root.setAttribute('data-theme', saved);
        }
    } catch (e) { /* private mode — just follow the system */ }

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
        if (!btn) return;

        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var current = root.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
        var next = current === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', next);
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = btn.getAttribute('aria-label');

        try { localStorage.setItem('theme', next); } catch (err) { /* ignore */ }
    });
})();
