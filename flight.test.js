const { 
    readCsv, 
    createAirports, 
    createAeroplanes, 
    validateFlight, 
    formatFlightError,
    Airport,
    Aeroplane
  } = require("./planning.js"); // Adjust the path to your module
  
  describe("Airline Feasibility Project Tests", () => {
    describe("readCsv", () => {
      test("should correctly read CSV data", () => {
        const data = readCsv("./airports.csv");
        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBeGreaterThan(0);
      });
  
      test("handles nonexistent file paths", () => {
        const data = readCsv("./nonexistent.csv");
        expect(data).toBeNull();
      });
    });
  
    describe("createAirports", () => {
      test("should create Airport objects", () => {
        const data = [["JFK", "John F. Kennedy International", "5376", "5576"]];
        const airports = createAirports(data);
        expect(airports[0]).toHaveProperty("name", "John F. Kennedy International");
        expect(airports[0]).toHaveProperty("code", "JFK");
        expect(airports[0].distanceFromMAN).toBeCloseTo(5376);
        expect(airports[0].distanceFromLGW).toBeCloseTo(5576);
      });
    });
  
    describe("createAeroplanes", () => {
      test("should create Aeroplane objects", () => {
        const data = [["A380", "£7", "6000", "300", "50", "10"]];
        const aeroplanes = createAeroplanes(data);
        expect(aeroplanes[0]).toHaveProperty("model", "A380");
        expect(aeroplanes[0].runningCostPerSeatPer100km).toBeCloseTo(7);
        expect(aeroplanes[0].maxFlightRange).toBeCloseTo(6000);
        expect(aeroplanes[0].economySeats).toBe(300);
      });
    });
  
    describe("validateFlight", () => {
      const airports = [new Airport("John F. Kennedy International", "JFK", 5376, 5576)];
      const aeroplanes = [new Aeroplane("A380", "£7", 6000, 300, 50, 10)];
  
      test("should validate a valid flight", () => {
        const flight = ["MAN", "JFK", "A380", "200", "30", "5"];
        const result = validateFlight(flight, airports, aeroplanes);
        expect(result).toBe("Valid flight");
      });
  
      test("should detect an invalid airport code", () => {
        const flight = ["MAN", "XYZ", "A380", "200", "30", "5"];
        const result = validateFlight(flight, airports, aeroplanes);
        expect(result).toBe("Error: Invalid airport code (XYZ)");
      });
  
      test("should detect insufficient flight range", () => {
        const longDistanceAirport = new Airport("Los Angeles International", "LAX", 10000, 10200);
        const airportsWithLongDistance = [...airports, longDistanceAirport];
        const flight = ["MAN", "LAX", "A380", "200", "30", "5"];
        const result = validateFlight(flight, airportsWithLongDistance, aeroplanes);
        expect(result).toBe("Error: A380 doesn't have the range to fly to Los Angeles International");
      });
    });
  
    describe("formatFlightError", () => {
      test("should format errors correctly", () => {
        const flight = ["MAN", "XYZ", "A380", "200", "30", "5"];
        const error = "Error: Invalid airport code (XYZ)";
        const result = formatFlightError(flight, error);
        expect(result).toBe("Flight from MAN to XYZ using A380:\nError: Invalid airport code (XYZ)\n");
      });
    });
  });
  