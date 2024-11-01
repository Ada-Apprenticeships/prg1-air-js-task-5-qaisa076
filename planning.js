const fs = require('fs');

// Function to read a CSV file and return its data as an array of arrays
function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        // Skip the header row and process each subsequent row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns); // Add the columns of the row to the data array
            }
        }
        
        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null; // Return null if there was an error
    }
}

// Class to represent an airport
class Airport {
    constructor(name, code, distanceFromMAN, distanceFromLGW) {
        this.name = name;
        this.code = code;
        this.distanceFromMAN = distanceFromMAN; // Distance from Manchester
        this.distanceFromLGW = distanceFromLGW; // Distance from Gatwick
    }
}

// Class to represent an aeroplane
class Aeroplane {
    constructor(model, runningCostPerSeat, maxFlightRange, economySeats, businessSeats, firstClassSeats) {
        this.model = model;
        // Parse cost and ensure it's a float
        this.runningCostPerSeatPer100km = parseFloat(runningCostPerSeat.replace('£', '').replace(',', ''));
        this.maxFlightRange = maxFlightRange;
        this.economySeats = economySeats;
        this.businessSeats = businessSeats;
        this.firstClassSeats = firstClassSeats;
    }
}

// Create an array of Airport objects from the CSV data
function createAirports(data) {
    return data.map(row => new Airport(row[1], row[0], parseFloat(row[2]), parseFloat(row[3])));
}

// Create an array of Aeroplane objects from the CSV data
function createAeroplanes(data) {
    return data.map(row => new Aeroplane(row[0], row[1], parseFloat(row[2]), parseInt(row[3]), parseInt(row[4]), parseInt(row[5])));
}

// Validate flight data against airport and aeroplane data
function validateFlight(flight, airports, aeroplanes) {
    const airport = airports.find(a => a.code === flight[1]);
    const aeroplane = aeroplanes.find(a => a.model === flight[2]);
    
    if (!airport) {
        return `Error: Invalid airport code (${flight[1]})`;
    }

    if (!aeroplane) {
        return `Error: Invalid aircraft code (${flight[2]})`;
    }

    // Determine distance based on the departure airport
    const distance = flight[0] === 'MAN' ? airport.distanceFromMAN : airport.distanceFromLGW;

    // Check if the flight distance exceeds the aeroplane's range
    if (distance > aeroplane.maxFlightRange) {
        return `Error: ${aeroplane.model} doesn't have the range to fly to ${airport.name}`;
    }

    // Parse the number of seats booked
    const economyBooked = parseInt(flight[3]);
    const businessBooked = parseInt(flight[4]);
    const firstClassBooked = parseInt(flight[5]);
    const totalSeats = economyBooked + businessBooked + firstClassBooked; // Total booked seats

    // Validate bookings against available seats in the aeroplane
    if (economyBooked > aeroplane.economySeats) {
        return `Error: Too many economy seats booked (${economyBooked} > ${aeroplane.economySeats})`;
    }

    if (businessBooked > aeroplane.businessSeats) {
        return `Error: Too many business seats booked (${businessBooked} > ${aeroplane.businessSeats})`;
    }

    if (firstClassBooked > aeroplane.firstClassSeats) {
        return `Error: Too many first-class seats booked (${firstClassBooked} > ${aeroplane.firstClassSeats})`;
    }

    // Check if total booked seats exceed the aeroplane's capacity
    if (totalSeats > (aeroplane.economySeats + aeroplane.businessSeats + aeroplane.firstClassSeats)) {
        return `Error: Too many total seats booked (${totalSeats} > ${aeroplane.economySeats + aeroplane.businessSeats + aeroplane.firstClassSeats})`;
    }

    return "Valid flight"; // Indicate that the flight data is valid
}

// Format the error message for output
function formatFlightError(flight, error) {
    return `Flight from ${flight[0]} to ${flight[1]} using ${flight[2]}:\n${error}\n`;
}

// Main function to execute the program
function main() {
    const airportData = readCsv('airports.csv');
    const aeroplaneData = readCsv('aeroplanes.csv');
    const invalidFlightData = readCsv('invalid_flight_data.csv');

    const airports = createAirports(airportData);
    const aeroplanes = createAeroplanes(aeroplaneData);

    const flightErrors = []; // Array to store flight error messages

    // Check each flight for validation errors
    invalidFlightData.forEach(row => {
        const error = validateFlight(row, airports, aeroplanes);
        if (error !== "Valid flight") {
            flightErrors.push(formatFlightError(row, error)); // Add error message if flight is invalid
        }
    });

    const outputContent = flightErrors.join('\n'); // Combine all error messages into a single string
    fs.writeFileSync('invalid_flights_report.txt', outputContent, { encoding: 'utf-8' }); // Write to output file
}

main(); // Execute the main function


// Usage example
const airportsData = readCsv('airports.csv');
if (airportsData) {
    airportsData.forEach(row => {
        console.log(row);
    });
}