
const games = [
    {name: "Flappy Bird", category: "Arcade", rating: 4, link: "games/flappybird/index.html", description: "Fly the bird through the pipes!"},
    {name: "2048", category: "Puzzle", rating: 5, link: "games/2048/index.html", description: "Combine tiles to reach 2048."},
    {name: "Chess", category: "Strategy", rating: 5, link: "games/chess/index.html", description: "Classic chess game. Play with a friend or against the AI."},
    {name: "Snake", category: "Arcade", rating: 4, link: "games/snake/index.html", description: "The classic snake game! Eat the food and grow longer while avoiding the walls."}
];

function displayGames(gameList = games) {
    const container = document.getElementById('gameList');
    container.innerHTML = gameList.map(game => `
        <div class="game" data-category="${game.category}" data-rating="${game.rating}">
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <a href="${game.link}" target="_blank">Play ${game.name}</a>
            <div class="rating">Rating: ${'★'.repeat(game.rating)}${'☆'.repeat(5-game.rating)}</div>
        </div>
    `).join('');
}

function searchGames() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const filteredGames = games.filter(game => 
        game.name.toLowerCase().includes(query) || 
        game.category.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
    );
    displayGames(filteredGames);
}

function toggleTheme() {
    const button = document.getElementById('themeButton');
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.textContent = '🌞';
        text.textContent = 'Light Mode';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayGames();
    document.getElementById('searchBox').addEventListener('input', searchGames);
});
