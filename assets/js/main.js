(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        if (!document.querySelector(".aetheros-test-banner")) {
            var badge = document.createElement("div");
            badge.className = "aetheros-test-banner";
            badge.textContent = "AetherOS Test Skin Active";
            document.body.appendChild(badge);
        }

        var items = document.querySelectorAll("section, article, .card, .division-card, .feature-card, .panel, [class*='card'], [class*='division']");
        items.forEach(function (el) {
            el.classList.add("aetheros-reveal");
        });

        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("aetheros-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08 });

            items.forEach(function (el) { observer.observe(el); });
        } else {
            items.forEach(function (el) { el.classList.add("aetheros-visible"); });
        }
    });
})();
