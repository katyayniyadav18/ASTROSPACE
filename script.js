/* ==================================
   ASTROVERSE - SPACE EXPLORATION
================================== */

"use strict";


// DOM ELEMENTS

const planetGrid = document.getElementById("planetGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const resultCount = document.getElementById("resultCount");
const emptyMessage = document.getElementById("emptyMessage");

const planetModal = document.getElementById("planetModal");
const closeModalButton = document.getElementById("closeModal");

const modalPlanetVisual = document.getElementById("modalPlanetVisual");
const modalName = document.getElementById("modalName");
const modalType = document.getElementById("modalType");
const modalDescription = document.getElementById("modalDescription");
const modalStats = document.getElementById("modalStats");
const modalFact = document.getElementById("modalFact");

const randomFactElement = document.getElementById("randomFact");
const factButton = document.getElementById("factButton");


// DATA

let planets = [];

const spaceFacts = [
    "A day on Venus is longer than its year.",
    "Jupiter is the largest planet in our Solar System.",
    "Neptune takes approximately 165 Earth years to orbit the Sun.",
    "Earth is the only planet currently known to support life.",
    "Mercury is the closest planet to the Sun.",
    "Saturn is famous for its spectacular ring system.",
    "Mars has two natural moons: Phobos and Deimos.",
    "Uranus rotates on an extreme tilt compared with most planets."
];


// LOAD JSON DATA

async function loadPlanets() {

    try {

        const response = await fetch("sample.json");

        if (!response.ok) {
            throw new Error("Could not load the planet data.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Planet data must be a JSON array.");
        }

        planets = data;

        renderPlanets();

    } catch (error) {

        console.error("AstroVerse error:", error);

        resultCount.textContent = "Unable to load planet information.";

        planetGrid.innerHTML = `
            <p>
                Please run this website using VS Code Live Server
                and check that sample.json is in the same folder.
            </p>
        `;

    }

}


// CREATE PLANET CARDS

function createPlanetCard(planet) {

    const card = document.createElement("article");

    card.className = "planet-card";

    card.style.setProperty("--planet-color", planet.color);

    const size = Math.max(
        42,
        Math.min(planet.diameter / 1800, 105)
    );

    const distance = Number(planet.distance).toLocaleString("en-IN");

    card.innerHTML = `
        <div class="planet-topline">

            <span class="planet-number">
                PLANET ${String(planet.id).padStart(2, "0")}
            </span>

            <span class="planet-type">
                ${escapeHTML(planet.type)}
            </span>

        </div>

        <div class="planet-visual">

            <div
                class="planet-sphere ${planet.name === "Saturn" ? "saturn" : ""}"
                style="
                    --planet-color: ${planet.color};
                    --planet-size: ${size}px;
                "
                role="img"
                aria-label="${escapeHTML(planet.name)} illustration"
            ></div>

        </div>

        <h3>${escapeHTML(planet.name)}</h3>

        <p class="planet-distance">
            ${distance} million km from the Sun
        </p>

        <p class="planet-summary">
            ${escapeHTML(planet.description)}
        </p>

        <button
            class="planet-details-button"
            type="button"
            data-planet-id="${planet.id}"
        >
            Explore Planet →
        </button>
    `;

    return card;

}


// PREVENT HTML INJECTION IN TEXT FIELDS

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


// SEARCH AND SORT PLANETS

function getVisiblePlanets() {

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const sortBy = sortSelect.value;

    // Linear Search: O(n)

    let filteredPlanets = planets.filter(function (planet) {

        return (
            planet.name.toLowerCase().includes(searchTerm) ||
            planet.type.toLowerCase().includes(searchTerm)
        );

    });


    // Sorting: JavaScript's built-in sort method.

    if (sortBy === "distance") {

        filteredPlanets.sort(function (a, b) {
            return a.distance - b.distance;
        });

    } else if (sortBy === "size") {

        filteredPlanets.sort(function (a, b) {
            return b.diameter - a.diameter;
        });

    } else if (sortBy === "name") {

        filteredPlanets.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

    } else {

        filteredPlanets.sort(function (a, b) {
            return a.id - b.id;
        });

    }

    return filteredPlanets;

}


// DISPLAY PLANETS

function renderPlanets() {

    const visiblePlanets = getVisiblePlanets();

    planetGrid.replaceChildren();

    visiblePlanets.forEach(function (planet) {

        const card = createPlanetCard(planet);

        planetGrid.appendChild(card);

    });

    resultCount.textContent =
        `Showing ${visiblePlanets.length} of ${planets.length} planets`;

    emptyMessage.classList.toggle(
        "hidden",
        visiblePlanets.length !== 0
    );

}


// OPEN PLANET DETAILS

function openPlanetDetails(planetId) {

    const planet = planets.find(function (item) {
        return item.id === Number(planetId);
    });

    if (!planet) {
        return;
    }

    modalName.textContent = planet.name;
    modalType.textContent = planet.type;
    modalDescription.textContent = planet.description;
    modalFact.textContent = planet.fact;

    modalPlanetVisual.replaceChildren();

    const sphere = document.createElement("div");

    sphere.className =
        "planet-sphere" +
        (planet.name === "Saturn" ? " saturn" : "");

    sphere.style.setProperty("--planet-color", planet.color);

    modalPlanetVisual.appendChild(sphere);


    const stats = [
        ["Distance from Sun", `${planet.distance} million km`],
        ["Diameter", `${Number(planet.diameter).toLocaleString("en-IN")} km`],
        ["Orbital period", `${planet.year} Earth days`],
        ["Rotation period", `${planet.day} Earth days`],
        ["Known moons in sample data", planet.moons],
        ["Average temperature", planet.temperature]
    ];


    modalStats.replaceChildren();

    stats.forEach(function (item) {

        const stat = document.createElement("div");

        stat.className = "modal-stat";

        const label = document.createElement("span");

        label.textContent = item[0];

        const value = document.createElement("strong");

        value.textContent = item[1];

        stat.append(label, value);

        modalStats.appendChild(stat);

    });


    planetModal.classList.remove("hidden");

    closeModalButton.focus();

    document.body.style.overflow = "hidden";

}


// CLOSE PLANET DETAILS

function closePlanetDetails() {

    planetModal.classList.add("hidden");

    document.body.style.overflow = "";

}


// EVENT LISTENERS

searchInput.addEventListener("input", renderPlanets);

sortSelect.addEventListener("change", renderPlanets);


// Event delegation: one listener handles all planet buttons.

planetGrid.addEventListener("click", function (event) {

    const button = event.target.closest("[data-planet-id]");

    if (!button) {
        return;
    }

    openPlanetDetails(button.dataset.planetId);

});


closeModalButton.addEventListener("click", closePlanetDetails);


planetModal.addEventListener("click", function (event) {

    if (event.target === planetModal) {
        closePlanetDetails();
    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closePlanetDetails();
    }

});


// RANDOM SPACE FACT GENERATOR

function showRandomFact() {

    const randomIndex = Math.floor(
        Math.random() * spaceFacts.length
    );

    randomFactElement.textContent = spaceFacts[randomIndex];

}


factButton.addEventListener("click", showRandomFact);


// INITIALISE WEBSITE

loadPlanets();

showRandomFact();
