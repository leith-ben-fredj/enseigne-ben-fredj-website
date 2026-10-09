// =============================================
// ENSEIGNE BEN FREDJ — SCRIPT PRINCIPAL
// Architecture modulaire & défensive
// =============================================

/**
 * 1. SLIDER DU HERO
 * Défilement automatique avec respect des préférences d'accessibilité
 */
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-media .slide");
  if (slides.length <= 1) return;

  let slideActuelle = 0;
  let intervalId = null;

  function afficherSlideSuivante() {
    slides[slideActuelle].classList.remove("active");
    slideActuelle = (slideActuelle + 1) % slides.length;
    slides[slideActuelle].classList.add("active");
  }

  // Respect des préférences de réduction d'animations (WCAG 2.2.2)
  const respecteMouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function demarrerSlider() {
    if (!respecteMouvementReduit && !intervalId) {
      intervalId = setInterval(afficherSlideSuivante, 4000);
    }
  }

  function arreterSlider() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  demarrerSlider();

  // Pause si onglet masqué
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      arreterSlider();
    } else {
      demarrerSlider();
    }
  });
}

/**
 * 2. CARROUSEL DES CATÉGORIES
 * Défilement horizontal fluide et pagination accessible
 */
function initCategoryCarousel() {
  const piste = document.querySelector(".carrousel-piste");
  const cartes = document.querySelectorAll(".carte-categorie");
  const flecheGauche = document.querySelector(".carrousel-fleche-gauche");
  const flecheDroite = document.querySelector(".carrousel-fleche-droite");
  const conteneurPoints = document.querySelector(".carrousel-points");

  if (!piste || cartes.length === 0) return;

  // 1. Génération accessible des indicateurs
  if (conteneurPoints) {
    conteneurPoints.innerHTML = "";

    cartes.forEach((carte, index) => {
      const point = document.createElement("button");
      point.type = "button";
      point.setAttribute("aria-label", `Aller à la catégorie ${index + 1}`);
      point.setAttribute("aria-current", index === 0 ? "true" : "false");
      if (index === 0) point.classList.add("active");

      point.addEventListener("click", () => {
        carte.scrollIntoView({ behavior: "smooth", inline: "start" });
      });

      conteneurPoints.appendChild(point);
    });

    const points = conteneurPoints.querySelectorAll("button");

    // 2. IntersectionObserver pour mettre à jour l'indicateur actif
    if ("IntersectionObserver" in window) {
      const observateur = new IntersectionObserver(
        (entrees) => {
          entrees.forEach((entree) => {
            if (entree.isIntersecting) {
              const index = Array.from(cartes).indexOf(entree.target);
              if (index !== -1) {
                points.forEach((p, i) => {
                  const estActif = i === index;
                  p.classList.toggle("active", estActif);
                  p.setAttribute("aria-current", estActif ? "true" : "false");
                });
              }
            }
          });
        },
        { root: piste, threshold: 0.6 }
      );

      cartes.forEach((carte) => observateur.observe(carte));
    }
  }

  // 3. Défilement par flèches
  function largeurDefilement() {
    return cartes[0].offsetWidth + 24;
  }

  if (flecheDroite) {
    flecheDroite.addEventListener("click", () => {
      piste.scrollBy({ left: largeurDefilement(), behavior: "smooth" });
    });
  }

  if (flecheGauche) {
    flecheGauche.addEventListener("click", () => {
      piste.scrollBy({ left: -largeurDefilement(), behavior: "smooth" });
    });
  }
}

/**
 * 3. FILTRAGE DE LA GALERIE (Page Portfolio)
 * Garde complète pour éviter tout plantage sur portfolio.html ou autres pages
 */
function initGalleryFilter() {
  const cartesGalerie = document.querySelectorAll(".galerie-carte");
  const checkboxes = document.querySelectorAll(".filtre-checkbox");
  const champRecherche = document.getElementById("recherche-galerie");
  const btnEffacer = document.getElementById("btn-effacer-filtres");
  const messageAucunResultat = document.getElementById("galerie-aucun-resultat");

  // Garde stricte : tous les éléments requis doivent exister
  if (
    cartesGalerie.length === 0 ||
    !champRecherche ||
    !btnEffacer ||
    !messageAucunResultat
  ) {
    return;
  }

  function appliquerFiltres() {
    const categoriesActives = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value.toLowerCase());

    const texteRecherche = champRecherche.value.trim().toLowerCase();
    let resultatsVisibles = 0;

    cartesGalerie.forEach((carte) => {
      const categorie = (carte.dataset.categorie || "").toLowerCase();
      const nom = (carte.dataset.nom || "").toLowerCase();

      const correspondCategorie =
        categoriesActives.length === 0 || categoriesActives.includes(categorie);
      const correspondRecherche =
        texteRecherche === "" || nom.includes(texteRecherche);

      if (correspondCategorie && correspondRecherche) {
        carte.classList.remove("cachee");
        resultatsVisibles++;
      } else {
        carte.classList.add("cachee");
      }
    });

    messageAucunResultat.hidden = resultatsVisibles > 0;
  }

  checkboxes.forEach((cb) => cb.addEventListener("change", appliquerFiltres));
  champRecherche.addEventListener("input", appliquerFiltres);

  btnEffacer.addEventListener("click", () => {
    checkboxes.forEach((cb) => (cb.checked = false));
    champRecherche.value = "";
    appliquerFiltres();
  });
}

/**
 * 4. MENU HAMBURGER MOBILE & ACCESSIBILITÉ
 * Gestion du tiroir de navigation, état ARIA et navigation clavier
 */
function initBurgerMenu() {
  const burgerMenu = document.getElementById("burger-menu");
  const navContainer = document.getElementById("nav-container");
  const navOverlay = document.getElementById("nav-overlay");
  const navLinks = document.querySelectorAll(".menu-principal a, .nav-boutons a");

  if (!burgerMenu || !navContainer || !navOverlay) return;

  function synchroniserInert(ouvert) {
    if (window.innerWidth <= 992) {
      if (ouvert) {
        navContainer.removeAttribute("inert");
        navContainer.removeAttribute("aria-hidden");
      } else {
        navContainer.setAttribute("inert", "");
        navContainer.setAttribute("aria-hidden", "true");
      }
    } else {
      navContainer.removeAttribute("inert");
      navContainer.removeAttribute("aria-hidden");
    }
  }

  function definirEtatMenu(ouvert) {
    burgerMenu.classList.toggle("active", ouvert);
    navContainer.classList.toggle("active", ouvert);
    navOverlay.classList.toggle("active", ouvert);
    document.body.classList.toggle("menu-ouvert", ouvert);

    burgerMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    burgerMenu.setAttribute(
      "aria-label",
      ouvert ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"
    );

    synchroniserInert(ouvert);
  }

  function toggleMenu() {
    const estOuvert = burgerMenu.classList.contains("active");
    definirEtatMenu(!estOuvert);
  }

  function fermerMenu() {
    definirEtatMenu(false);
  }

  // Initialisation à l'état fermé
  definirEtatMenu(false);

  burgerMenu.addEventListener("click", toggleMenu);
  navOverlay.addEventListener("click", fermerMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", fermerMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burgerMenu.classList.contains("active")) {
      fermerMenu();
      burgerMenu.focus();
    }
  });

  window.addEventListener("resize", () => {
    const estOuvert = burgerMenu.classList.contains("active");
    synchroniserInert(estOuvert);
  });
}

/**
 * 5. FORMULAIRE DE CONTACT
 * Retour d'état visuel lors de l'envoi
 */
function initContactForm() {
  const formulaire = document.querySelector(".formulaire-contact");
  if (!formulaire) return;

  formulaire.addEventListener("submit", () => {
    const bouton = formulaire.querySelector("button[type='submit']");
    if (bouton) {
      bouton.disabled = true;
      const texteOriginal = bouton.textContent;
      bouton.textContent = "Envoi en cours...";

      setTimeout(() => {
        bouton.disabled = false;
        bouton.textContent = texteOriginal;
      }, 3000);
    }
  });
}

// Initialisation sécurisée de chaque composant
document.addEventListener("DOMContentLoaded", () => {
  const modules = [
    initHeroSlider,
    initCategoryCarousel,
    initGalleryFilter,
    initBurgerMenu,
    initContactForm,
  ];

  modules.forEach((module) => {
    try {
      module();
    } catch (erreur) {
      console.error(`[Enseigne Ben Fredj] Erreur dans ${module.name}:`, erreur);
    }
  });
});
