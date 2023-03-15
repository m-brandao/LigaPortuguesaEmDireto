const standingsCache = 'standings';
const fixturesCache = 'fixtures';
const leagueCode = 'PPL'
const apiKey = '2ca8fb6a5ed148f78ee7015f23d38142';
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
    fetch(`https://api.football-data.org/v2/competitions/${leagueCode}/standings`, {
        headers: {
            'X-Auth-Token': apiKey,
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


function fetchFixtures() {
    const storedData = localStorage.getItem(fixturesCache);
    if (storedData) {
        const data = JSON.parse(storedData);
        if (Date.now() - data.timestamp < cacheDuration) {
            displayFixtures(data.fixtures);
            return;
        }
    }
    getCurrentMatchday()
        .then(matchday => {
            const apiUrl = `https://api.football-data.org/v2/competitions/${leagueCode}/matches?status=SCHEDULED&matchday=${matchday}`;
            return fetch(apiUrl, { headers: { 'X-Auth-Token': apiKey } });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem(fixturesCache, JSON.stringify({ fixtures: data.matches, timestamp: Date.now() }));
            displayFixtures(data.matches);
        })
        .catch(error => {
            console.error('Error fetching fixtures:', error);
        });
}

function getCurrentMatchday() {
    const storedData = localStorage.getItem(fixturesCache);
    if (storedData) {
        const data = JSON.parse(storedData);
        if (Date.now() - data.timestamp < cacheDuration) {
            const matchday = data.fixtures[0].matchday;
            return Promise.resolve(matchday);
        }
    }
    const apiUrl = `https://api.football-data.org/v2/competitions/${leagueCode}`;
    return fetch(apiUrl, { headers: { 'X-Auth-Token': apiKey } })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem(fixturesCache, JSON.stringify({ fixtures: [], timestamp: Date.now() }));
            return data.currentSeason.currentMatchday;
        })
        .catch(error => {
            console.error('Error fetching current matchday:', error);
            return 1;
        });
}

function displayFixtures(fixtures) {
    const table = document.getElementById('fixtures');
    fixtures.forEach(fixture => {
        const row = table.insertRow();
        const date = row.insertCell(0);
        const homeTeam = row.insertCell(1);
        const score = row.insertCell(2);
        const awayTeam = row.insertCell(3);
        date.innerHTML = new Date(fixture.utcDate).toLocaleString();
        homeTeam.innerHTML = fixture.homeTeam.name;
        score.innerHTML = `${fixture.score.fullTime.homeTeam} - ${fixture.score.fullTime.awayTeam}`;
        awayTeam.innerHTML = fixture.awayTeam.name;
    });
}

fetchFixtures();