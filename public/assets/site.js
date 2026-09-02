/* Theme handling: light is the default. Dark is opt-in via the toggle,
   and the choice is remembered. Loaded synchronously in <head> so the
   theme applies before first paint. */
(function () {
    var root = document.documentElement;

    try {
        var saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            root.setAttribute('data-theme', saved);
        }
    } catch (e) { /* private mode — stay with the default */ }

    var metas = document.querySelectorAll('meta[name="theme-color"]');

    for (var i = 0; i < metas.length; i++) {
        metas[i].dataset.light = metas[i].getAttribute('content');
    }

    function applyMeta(dark) {
        for (var i = 0; i < metas.length; i++) {
            metas[i].setAttribute('content', dark ? '#191D1B' : metas[i].dataset.light);
        }
    }

    if (root.getAttribute('data-theme') === 'dark') applyMeta(true);

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
        if (!btn) return;

        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', next);
        applyMeta(next === 'dark');

        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = btn.getAttribute('aria-label');

        try { localStorage.setItem('theme', next); } catch (err) { /* ignore */ }
    });
})();
