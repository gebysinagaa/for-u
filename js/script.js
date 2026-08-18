// =====================================================
// ENVELOPE OPENING
// =====================================================
(function () {
    const envelope = document.getElementById("envelope");
    const envelopeScene = document.getElementById("envelopeScene");
    const openLetterBtn = document.getElementById("openLetterBtn");
    const site = document.getElementById("site");
    const body = document.body;

    let envelopeOpened = false; // amplop sudah dibuka (flap terbuka, surat keluar)
    let siteRevealed = false;   // sudah masuk ke halaman utama

    function openEnvelope() {
        if (envelopeOpened) return;
        envelopeOpened = true;

        envelope.classList.add("is-clicked");
        // small delay so the "grow" feels distinct from the flap opening
        window.setTimeout(() => {
            envelope.classList.add("is-open");
        }, 120);
    }

    function revealSite() {
        if (siteRevealed) return;
        siteRevealed = true;

        // fade-out / zoom transition of the envelope scene
        envelopeScene.classList.add("is-leaving");

        window.setTimeout(() => {
            envelopeScene.classList.add("is-gone");

            // unlock scroll
            body.classList.remove("is-locked");

            // show main content
            site.classList.add("is-shown");

            initScrollReveal();
            offerMusicPulse();
        }, 900);
    }

    envelope.addEventListener("click", (e) => {
        // if letter already out, clicking the envelope body shouldn't re-trigger
        if (envelopeOpened) return;
        openEnvelope();
    });

    openLetterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!envelopeOpened) {
            openEnvelope();
            window.setTimeout(revealSite, 500);
        } else {
            revealSite();
        }
    });

    // keyboard accessibility: Enter/Space opens the envelope
    envelope.setAttribute("tabindex", "0");
    envelope.setAttribute("role", "button");
    envelope.setAttribute("aria-label", "Open the envelope");
    envelope.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEnvelope();
        }
    });
})();

// =====================================================
// SCROLL ANIMATION
// =====================================================
function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
}

// Bottom nav active-state highlighting while scrolling
(function () {
    const navItems = document.querySelectorAll(".bottom-nav__item");
    const sectionIds = ["home", "memories", "letter"];
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (!sections.length) return;

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navItems.forEach((item) => {
                        const target = id === "letter" ? "more" : id === "memories" ? "memories" : "home";
                        item.classList.toggle("is-active", item.dataset.nav === target);
                    });
                }
            });
        },
        { threshold: 0.4 }
    );

    sections.forEach((s) => sectionObserver.observe(s));

    // "Music" nav item just scrolls to top and draws attention to the player
    const musicNav = document.querySelector('.bottom-nav__item[data-nav="music"]');
    if (musicNav) {
        musicNav.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach((item) => item.classList.remove("is-active"));
            musicNav.classList.add("is-active");
            offerMusicPulse();
        });
    }
})();

// =====================================================
// MUSIC PLAYER
// =====================================================
const musicConfig = {
    title: "Glimpse Of Us",
    artist: "Joji",
    cover: "images/cover.jpeg",
    audio: "audio/song.mp3"
};

(function () {
    const audioEl = document.getElementById("audioEl");
    const toggleBtn = document.getElementById("musicPlayerToggle");
    const playIcon = document.getElementById("playerPlayIcon");
    const likeBtn = document.getElementById("playerLike");
    const progress = document.getElementById("playerProgress");
    const progressFill = document.getElementById("playerProgressFill");
    const titleEl = document.getElementById("playerTitle");
    const artistEl = document.getElementById("playerArtist");
    const coverEl = document.getElementById("playerCover");
    const player = document.getElementById("musicPlayer");

    // apply config — easy to edit at the top of this file
    titleEl.textContent = musicConfig.title;
    artistEl.textContent = musicConfig.artist;
    coverEl.src = musicConfig.cover;
    audioEl.src = musicConfig.audio;

    function setPlaying(playing) {
        player.classList.toggle("is-playing", playing);
        playIcon.innerHTML = playing
            ? '<i data-lucide="pause"></i>'
            : '<i data-lucide="play"></i>';
        if (window.lucide) window.lucide.createIcons();
    }

    toggleBtn.addEventListener("click", () => {
        if (audioEl.paused) {
            // jangan autoplay sebelum interaksi — ini adalah interaksi user
            audioEl.play().catch(() => {});
            setPlaying(true);
        } else {
            audioEl.pause();
            setPlaying(false);
        }
    });

    likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        likeBtn.classList.toggle("is-liked");
        const icon = likeBtn.classList.contains("is-liked") ? "heart" : "plus";
        likeBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
        if (window.lucide) window.lucide.createIcons();
    });

    audioEl.addEventListener("timeupdate", () => {
        if (!audioEl.duration) return;
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        progressFill.style.width = pct + "%";
    });

    audioEl.addEventListener("ended", () => setPlaying(false));

    progress.addEventListener("click", (e) => {
        if (!audioEl.duration) return;
        const rect = progress.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audioEl.currentTime = ratio * audioEl.duration;
    });

    // expose a gentle "look at me" pulse, called once the envelope opens
    window.offerMusicPulse = function () {
        player.classList.add("is-pulse");
        window.setTimeout(() => player.classList.remove("is-pulse"), 3000);
    };
})();

function offerMusicPulse() {
    if (window.offerMusicPulse) window.offerMusicPulse();
}

// =====================================================
// LUCIDE ICONS INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) window.lucide.createIcons();
    else window.addEventListener("load", () => window.lucide && window.lucide.createIcons());
});
