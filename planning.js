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

function calculateIncome(bookings, prices) {
    const economyIncome = bookings.economy * prices.economy;
    const businessIncome = bookings.business * prices.business;
    const firstClassIncome = bookings.firstClass * prices.firstClass;
    return economyIncome + businessIncome + firstClassIncome;
}

function calculateCost(aeroplane, distance, totalSeats) {
    const costPerSeat = (aeroplane.costPerSeatPer100km * (distance / 100)).toFixed(2);
    return (costPerSeat * totalSeats).toFixed(2);
}

function displayFlightDetails(flight) {
    const { airport, aeroplane, bookings, prices } = flight;

    const totalIncome = calculateIncome(bookings, prices);
    
    const totalSeats = bookings.economy + bookings.business + bookings.firstClass;
    const totalCost = calculateCost(aeroplane, airport.distanceFromMAN, totalSeats);

    const profitOrLoss = (totalIncome - totalCost).toFixed(2);
    
    console.log(`Flight to ${airport.name} (${airport.code})`);
    console.log(`Aircraft Model: ${aeroplane.model}`);
    console.log(`Bookings: Economy: ${bookings.economy}, Business: ${bookings.business}, First Class: ${bookings.firstClass}`);
    console.log(`Total Income: £${totalIncome.toFixed(2)}`);
    console.log(`Total Cost: £${totalCost}`);
    console.log(`Expected Profit/Loss: £${profitOrLoss}`);
}

function main() {
    const airportData = readCsv('airports.csv');
    const aeroplaneData = readCsv('aeroplanes.csv');
    const validFlightData = readCsv('valid_flight_data.csv');

    const airports = createAirports(airportData);
    const aeroplanes = createAeroplanes(aeroplaneData);

    validFlightData.forEach(row => {
        const airport = airports.find(a => a.code === row[1]);
        const aeroplane = aeroplanes.find(a => a.model === row[2]);

        const bookings = {
            economy: parseInt(row[3]),
            business: parseInt(row[4]),
            firstClass: parseInt(row[5])
        };

        const prices = {
            economy: parseFloat(row[6]),
            business: parseFloat(row[7]),
            firstClass: parseFloat(row[8])
        };

        const flight = { airport, aeroplane, bookings, prices };
        displayFlightDetails(flight);
    });
}


// Usage example
const airportsData = readCsv('airports.csv');
if (airportsData) {
    airportsData.forEach(row => {
        console.log(row);
    });
}
