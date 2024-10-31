const fs = require('fs');

function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }

        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

class Airport {
    constructor(name, code, distanceFromMAN, distanceFromLGW) {
        this.name = name;
        this.code = code;
        this.distanceFromMAN = distanceFromMAN;
        this.distanceFromLGW = distanceFromLGW;
    }
}

class Aeroplane {
    constructor(model, costPerMile, capacity) {
        this.model = model;
        this.costPerMile = costPerMile;
        this.capacity = capacity;
    }
}

function createAirports(data) {
    return data.map(function(row) {
        var name = row[0];
        var code = row[1];
        var distanceFromMAN = parseFloat(row[2]);
        var distanceFromLGW = parseFloat(row[3]);
        return new Airport(name, code, distanceFromMAN, distanceFromLGW);
    });
}

function createAeroplanes(data) {
    return data.map(function(row) {
        var type = row[0];
        var runningCostPerSeat = parseFloat(row[1]);
        var maxFlightRange = parseFloat(row[2]);
        var totalSeats = parseInt(row[3], 10);
        return new Aeroplane(type, runningCostPerSeat, maxFlightRange, totalSeats);
    });
}




// Usage example
const airportsData = readCsv('airports.csv');
if (airportsData) {
    airportsData.forEach(row => {
        console.log(row);
    });
}
