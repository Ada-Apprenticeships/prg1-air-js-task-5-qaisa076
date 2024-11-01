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
    return data.map(row => new Airport(row[1], row[0], parseFloat(row[2]), parseFloat(row[3])));
}

function createAeroplanes(data) {
    return data.map(row => new Aeroplane(row[0], row[1], parseFloat(row[2]), parseInt(row[3]), parseInt(row[4]), parseInt(row[5])));
}

function validateFlight(flight, airports, aeroplanes) {
    const airport = airports.find(a => a.code === flight[1]);
    const aeroplane = aeroplanes.find(a => a.model === flight[2]);
    
    if (!airport) {
        return `Error: Invalid airport code (${flight[1]})`;
    }

    if (!aeroplane) {
        return `Error: Invalid aircraft code (${flight[2]})`;
    }

    const distance = flight[0] === 'MAN' ? airport.distanceFromMAN : airport.distanceFromLGW;

    if (distance > aeroplane.maxFlightRange) {
        return `Error: ${aeroplane.model} doesn't have the range to fly to ${airport.name}`;
    }

    const economyBooked = parseInt(flight[3]);
    const businessBooked = parseInt(flight[4]);
    const firstClassBooked = parseInt(flight[5]);
    const totalSeats = economyBooked + businessBooked + firstClassBooked;

    if (economyBooked > aeroplane.economySeats) {
        return `Error: Too many economy seats booked (${economyBooked} > ${aeroplane.economySeats})`;
    }

    if (businessBooked > aeroplane.businessSeats) {
        return `Error: Too many business seats booked (${businessBooked} > ${aeroplane.businessSeats})`;
    }

    if (firstClassBooked > aeroplane.firstClassSeats) {
        return `Error: Too many first-class seats booked (${firstClassBooked} > ${aeroplane.firstClassSeats})`;
    }

    if (totalSeats > (aeroplane.economySeats + aeroplane.businessSeats + aeroplane.firstClassSeats)) {
        return `Error: Too many total seats booked (${totalSeats} > ${aeroplane.economySeats + aeroplane.businessSeats + aeroplane.firstClassSeats})`;
    }

    return "Valid flight"; // Placeholder for valid flights; adjust as needed.
}

function formatFlightError(flight, error) {
    return `Flight from ${flight[0]} to ${flight[1]} using ${flight[2]}:\n${error}\n`;
}

function main() {
    const airportData = readCsv('airports.csv');
    const aeroplaneData = readCsv('aeroplanes.csv');
    const invalidFlightData = readCsv('invalid_flight_data.csv');

    const airports = createAirports(airportData);
    const aeroplanes = createAeroplanes(aeroplaneData);

    const flightErrors = [];

    invalidFlightData.forEach(row => {
        const error = validateFlight(row, airports, aeroplanes);
        if (error !== "Valid flight") {
            flightErrors.push(formatFlightError(row, error));
        }
    });

    const outputContent = flightErrors.join('\n');
    fs.writeFileSync('invalid_flights_report.txt', outputContent, { encoding: 'utf-8' });
}

main();

// Usage example
const airportsData = readCsv('airports.csv');
if (airportsData) {
    airportsData.forEach(row => {
        console.log(row);
    });
}