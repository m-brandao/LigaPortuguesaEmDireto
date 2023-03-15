let standingsTable = document.querySelector('#standing-table');

const standingsCache = 'standings';
const cacheDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

function fetchStandings() {
    const storedData = localStorage.getItem(standingsCache);
    if (storedData) {
        const data = JSON.parse(storedData);
        if (Date.now() - data.timestamp < cacheDuration) {
            displayStandings(data.standings[0].table);
            return;
        }
    }
    fetch('https://api.football-data.org/v2/competitions/PPL/standings', {
        headers: {
            'X-Auth-Token': '2ca8fb6a5ed148f78ee7015f23d38142',
            'Access-Control-Allow-Origin': 'http://127.0.0.1:5500'
        }
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem(standingsCache, JSON.stringify({ standings: data.standings, timestamp: Date.now() }));
            displayStandings(data.standings[0].table);
        })
        .catch(error => console.error(error));
}

function displayStandings(standings) {
    const table = document.getElementById('standings');
    standings.forEach(team => {
        const row = table.insertRow();
        const position = row.insertCell(0);
        const name = row.insertCell(1);
        const played = row.insertCell(2);
        const won = row.insertCell(3);
        const drawn = row.insertCell(4);
        const lost = row.insertCell(5);
        const points = row.insertCell(6);
        position.innerHTML = team.position;
        name.innerHTML = team.team.name;
        played.innerHTML = team.playedGames;
        won.innerHTML = team.won;
        drawn.innerHTML = team.draw;
        lost.innerHTML = team.lost;
        points.innerHTML = team.points;
    });
}

fetchStandings();