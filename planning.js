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
    constructor(model, runningCostPerSeat, maxFlightRange, economySeats, businessSeats, firstClassSeats) {
        this.model = model;
        this.runningCostPerSeatPer100km = parseFloat(runningCostPerSeat.replace('£', '').replace(',', ''));
        this.maxFlightRange = maxFlightRange;
        this.economySeats = economySeats;
        this.businessSeats = businessSeats;
        this.firstClassSeats = firstClassSeats;
    }
}

function createAirports(data) {
    return data.map(function(row) {
        return new Airport(row[1], row[0], parseFloat(row[2]), parseFloat(row[3]));
    });
}

function createAeroplanes(data) {
    return data.map(function(row) {
        return new Aeroplane(row[0], row[1], parseFloat(row[2]), parseInt(row[3]), parseInt(row[4]), parseInt(row[5]));
    });
}

function calculateIncome(bookings, prices) {
    const economyIncome = bookings.economy * prices.economy;
    const businessIncome = bookings.business * prices.business;
    const firstClassIncome = bookings.firstClass * prices.firstClass;
    return economyIncome + businessIncome + firstClassIncome;
}

function calculateCost(aeroplane, distance, totalSeats) {
    const costPerSeat = (aeroplane.runningCostPerSeatPer100km * (distance / 100)).toFixed(2);
    return (costPerSeat * totalSeats).toFixed(2);
}

function formatFlightDetails(flight) {
    const { airport, aeroplane, bookings, prices } = flight;

    const totalIncome = calculateIncome(bookings, prices);
    const totalSeats = bookings.economy + bookings.business + bookings.firstClass;
    const totalCost = calculateCost(aeroplane, airport.distanceFromMAN, totalSeats);
    const profitOrLoss = (totalIncome - totalCost).toFixed(2);

    return `Flight to ${airport.name} (${airport.code})\n` +
           `Aircraft Model: ${aeroplane.model}\n` +
           `Bookings: Economy: ${bookings.economy}, Business: ${bookings.business}, First Class: ${bookings.firstClass}\n` +
           `Total Income: £${totalIncome.toFixed(2)}\n` +
           `Total Cost: £${totalCost}\n` +
           `Expected Profit/Loss: £${profitOrLoss}\n`;
}

function main() {
    const airportData = readCsv('airports.csv');
    const aeroplaneData = readCsv('aeroplanes.csv');
    const validFlightData = readCsv('valid_flight_data.csv');

    const airports = createAirports(airportData);
    const aeroplanes = createAeroplanes(aeroplaneData);

    const flightDetails = [];

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
        flightDetails.push(formatFlightDetails(flight));
    });

    const outputContent = flightDetails.join('\n');
    fs.writeFileSync('flights.csv', outputContent, { encoding: 'utf-8' });
}
main();


// Usage example
const airportsData = readCsv('airports.csv');
if (airportsData) {
    airportsData.forEach(row => {
        console.log(row);
    });
}