import { Asset, ControlRoomAlert, KBDocument, LogbookEntry, EngineerFeedback } from "../types.ts";

// Initial assets from standard plant metadata
const INITIAL_ASSETS: Asset[] = [
  {
    id: "bf-04",
    name: "Blast Furnace #4 Tuyere System",
    area: "Ironmaking",
    status: "Critical",
    delayCostPerHour: 18500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 1180,
      temperatureUnit: "°C",
      temperatureLimit: 1250,
      vibration: 2.8,
      vibrationLimit: 3.5,
      pressure: 4.8,
      pressureLimit: 5.5,
      flowRate: 340,
      flowRateLimit: 400,
      historicalData: [
        { time: "00:00", temperature: 950, vibration: 1.2, pressure: 5.1 },
        { time: "01:00", temperature: 980, vibration: 1.3, pressure: 5.1 },
        { time: "02:00", temperature: 1040, vibration: 1.5, pressure: 5.0 },
        { time: "03:00", temperature: 1110, vibration: 2.1, pressure: 4.9 },
        { time: "04:00", temperature: 1180, vibration: 2.8, pressure: 4.8 }
      ]
    }
  },
  {
    id: "cc-02",
    name: "Continuous Caster Mould Oscillator #2",
    area: "Steelmaking",
    status: "Warning",
    delayCostPerHour: 14200,
    processCriticality: "High",
    telemetry: {
      temperature: 185,
      temperatureUnit: "°C",
      temperatureLimit: 200,
      vibration: 6.8,
      vibrationLimit: 5.0,
      pressure: 210,
      pressureLimit: 230,
      historicalData: [
        { time: "00:00", temperature: 140, vibration: 4.1, pressure: 215 },
        { time: "01:00", temperature: 152, vibration: 4.6, pressure: 212 },
        { time: "02:00", temperature: 165, vibration: 5.4, pressure: 209 },
        { time: "03:00", temperature: 178, vibration: 6.2, pressure: 211 },
        { time: "04:00", temperature: 185, vibration: 6.8, pressure: 210 }
      ]
    }
  },
  {
    id: "hsm-01",
    name: "Hot Strip Mill Roughing Stand Work Roll Bearing #1",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 22000,
    processCriticality: "High",
    telemetry: {
      temperature: 68,
      temperatureUnit: "°C",
      temperatureLimit: 85,
      vibration: 2.1,
      vibrationLimit: 4.5,
      pressure: 180,
      pressureLimit: 220,
      historicalData: [
        { time: "00:00", temperature: 62, vibration: 1.9, pressure: 180 },
        { time: "01:00", temperature: 64, vibration: 2.0, pressure: 179 },
        { time: "02:00", temperature: 65, vibration: 2.0, pressure: 181 },
        { time: "03:00", temperature: 66, vibration: 2.1, pressure: 182 },
        { time: "04:00", temperature: 68, vibration: 2.1, pressure: 180 }
      ]
    }
  },
  {
    id: "cogc-03",
    name: "Coke Oven Gas Compressor #3 Main Rotor",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 9500,
    processCriticality: "Medium",
    telemetry: {
      temperature: 92,
      temperatureUnit: "°C",
      temperatureLimit: 110,
      vibration: 1.6,
      vibrationLimit: 3.0,
      pressure: 14.5,
      pressureLimit: 17.0,
      historicalData: [
        { time: "00:00", temperature: 88, vibration: 1.4, pressure: 14.2 },
        { time: "01:00", temperature: 90, vibration: 1.5, pressure: 14.3 },
        { time: "02:00", temperature: 91, vibration: 1.5, pressure: 14.5 },
        { time: "03:00", temperature: 91, vibration: 1.6, pressure: 14.4 },
        { time: "04:00", temperature: 92, vibration: 1.6, pressure: 14.5 }
      ]
    }
  },
  {
    id: "ld-01",
    name: "LD Converter BOF #1 Tilting Drive",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 19500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 75,
      temperatureUnit: "°C",
      temperatureLimit: 95,
      vibration: 1.2,
      vibrationLimit: 3.5,
      pressure: 190,
      pressureLimit: 240,
      historicalData: [
        { time: "00:00", temperature: 68, vibration: 0.9, pressure: 190 },
        { time: "01:00", temperature: 70, vibration: 1.0, pressure: 192 },
        { time: "02:00", temperature: 72, vibration: 1.1, pressure: 191 },
        { time: "03:00", temperature: 74, vibration: 1.1, pressure: 190 },
        { time: "04:00", temperature: 75, vibration: 1.2, pressure: 190 }
      ]
    }
  },
  {
    id: "bf-03",
    name: "Sintering Plant Dust Extraction Fan #3",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 7500,
    processCriticality: "Medium",
    telemetry: {
      temperature: 54,
      temperatureUnit: "°C",
      temperatureLimit: 75,
      vibration: 2.3,
      vibrationLimit: 4.8,
      pressure: 1.8,
      pressureLimit: 3.0,
      historicalData: [
        { time: "00:00", temperature: 50, vibration: 2.1, pressure: 1.8 },
        { time: "01:00", temperature: 51, vibration: 2.1, pressure: 1.8 },
        { time: "02:00", temperature: 52, vibration: 2.2, pressure: 1.8 },
        { time: "03:00", temperature: 53, vibration: 2.2, pressure: 1.8 },
        { time: "04:00", temperature: 54, vibration: 2.3, pressure: 1.8 }
      ]
    }
  },
  {
    id: "hsm-02",
    name: "Hot Mill Coiler Roller Drive Shaft #3",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 16800,
    processCriticality: "High",
    telemetry: {
      temperature: 82,
      temperatureUnit: "°C",
      temperatureLimit: 105,
      vibration: 3.1,
      vibrationLimit: 6.0,
      pressure: 15.0,
      pressureLimit: 20.0,
      historicalData: [
        { time: "00:00", temperature: 74, vibration: 2.8, pressure: 15.0 },
        { time: "01:00", temperature: 76, vibration: 2.9, pressure: 15.0 },
        { time: "02:00", temperature: 78, vibration: 3.0, pressure: 15.0 },
        { time: "03:00", temperature: 80, vibration: 3.1, pressure: 15.0 },
        { time: "04:00", temperature: 82, vibration: 3.1, pressure: 15.0 }
      ]
    }
  },
  {
    id: "cogc-01",
    name: "Coke Oven Push Car Hydraulic Pack #1",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 11000,
    processCriticality: "High",
    telemetry: {
      temperature: 48,
      temperatureUnit: "°C",
      temperatureLimit: 65,
      vibration: 1.1,
      vibrationLimit: 2.5,
      pressure: 160,
      pressureLimit: 200,
      historicalData: [
        { time: "00:00", temperature: 42, vibration: 0.9, pressure: 158 },
        { time: "01:00", temperature: 44, vibration: 1.0, pressure: 160 },
        { time: "02:00", temperature: 45, vibration: 1.0, pressure: 162 },
        { time: "03:00", temperature: 47, vibration: 1.0, pressure: 160 },
        { time: "04:00", temperature: 48, vibration: 1.1, pressure: 160 }
      ]
    }
  },
  {
    id: "bf-01",
    name: "Blast Furnace #4 Raw Iron Sinter Conveyor #1",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 12500,
    processCriticality: "High",
    telemetry: {
      temperature: 42,
      temperatureUnit: "°C",
      temperatureLimit: 60,
      vibration: 1.8,
      vibrationLimit: 4.0,
      pressure: 12,
      pressureLimit: 20,
      historicalData: [
        { time: "00:00", temperature: 38, vibration: 1.5, pressure: 12 },
        { time: "01:00", temperature: 39, vibration: 1.6, pressure: 12 },
        { time: "02:00", temperature: 40, vibration: 1.6, pressure: 12 },
        { time: "03:00", temperature: 41, vibration: 1.7, pressure: 12 },
        { time: "04:00", temperature: 42, vibration: 1.8, pressure: 12 }
      ]
    }
  },
  {
    id: "cc-03",
    name: "Continuous Caster Mould Segment Roller Bearings #3",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 13800,
    processCriticality: "High",
    telemetry: {
      temperature: 95,
      temperatureUnit: "°C",
      temperatureLimit: 120,
      vibration: 2.2,
      vibrationLimit: 4.5,
      pressure: 85,
      pressureLimit: 110,
      historicalData: [
        { time: "00:00", temperature: 88, vibration: 2.0, pressure: 85 },
        { time: "01:00", temperature: 90, vibration: 2.1, pressure: 84 },
        { time: "02:00", temperature: 92, vibration: 2.1, pressure: 85 },
        { time: "03:00", temperature: 93, vibration: 2.2, pressure: 86 },
        { time: "04:00", temperature: 95, vibration: 2.2, pressure: 85 }
      ]
    }
  },
  {
    id: "hsm-03",
    name: "Hot Strip Mill Finishing Stand F5 Descaling Header Valve #2",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 21500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 55,
      temperatureUnit: "°C",
      temperatureLimit: 80,
      vibration: 1.4,
      vibrationLimit: 3.5,
      pressure: 220,
      pressureLimit: 250,
      historicalData: [
        { time: "00:00", temperature: 51, vibration: 1.1, pressure: 222 },
        { time: "01:00", temperature: 52, vibration: 1.2, pressure: 221 },
        { time: "02:00", temperature: 53, vibration: 1.3, pressure: 220 },
        { time: "03:00", temperature: 54, vibration: 1.3, pressure: 220 },
        { time: "04:00", temperature: 55, vibration: 1.4, pressure: 220 }
      ]
    }
  },
  {
    id: "ld-02",
    name: "LD Converter Slag Splashing Lance Nozzle #5",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 18000,
    processCriticality: "High",
    telemetry: {
      temperature: 1120,
      temperatureUnit: "°C",
      temperatureLimit: 1250,
      vibration: 1.1,
      vibrationLimit: 3.0,
      pressure: 6.2,
      pressureLimit: 8.5,
      historicalData: [
        { time: "00:00", temperature: 1050, vibration: 0.9, pressure: 6.0 },
        { time: "01:00", temperature: 1080, vibration: 0.9, pressure: 6.1 },
        { time: "02:00", temperature: 1100, vibration: 1.0, pressure: 6.2 },
        { time: "03:00", temperature: 1110, vibration: 1.0, pressure: 6.2 },
        { time: "04:00", temperature: 1120, vibration: 1.1, pressure: 6.2 }
      ]
    }
  },
  {
    id: "wrm-01",
    name: "Wire Rod Mill Laying Head Pinch Roll",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 15500,
    processCriticality: "High",
    telemetry: {
      temperature: 72,
      temperatureUnit: "°C",
      temperatureLimit: 90,
      vibration: 1.9,
      vibrationLimit: 4.5,
      pressure: 6.5,
      pressureLimit: 8.0,
      historicalData: [
        { time: "00:00", temperature: 65, vibration: 1.7, pressure: 6.2 },
        { time: "01:00", temperature: 68, vibration: 1.8, pressure: 6.3 },
        { time: "02:00", temperature: 70, vibration: 1.8, pressure: 6.5 },
        { time: "03:00", temperature: 71, vibration: 1.9, pressure: 6.5 },
        { time: "04:00", temperature: 72, vibration: 1.9, pressure: 6.5 }
      ]
    }
  },
  {
    id: "sinter-02",
    name: "Sinter Machine #2 Ignition Furnace Burner Blower",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 9800,
    processCriticality: "High",
    telemetry: {
      temperature: 48,
      temperatureUnit: "°C",
      temperatureLimit: 65,
      vibration: 1.5,
      vibrationLimit: 3.5,
      pressure: 0.8,
      pressureLimit: 1.5,
      historicalData: [
        { time: "00:00", temperature: 44, vibration: 1.3, pressure: 0.8 },
        { time: "01:00", temperature: 45, vibration: 1.4, pressure: 0.8 },
        { time: "02:00", temperature: 46, vibration: 1.4, pressure: 0.8 },
        { time: "03:00", temperature: 47, vibration: 1.5, pressure: 0.8 },
        { time: "04:00", temperature: 48, vibration: 1.5, pressure: 0.8 }
      ]
    }
  },
  {
    id: "crm-02",
    name: "Cold Rolling Mill 4-Stand Tandem Mill Work Roll Spindle",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 24500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 62,
      temperatureUnit: "°C",
      temperatureLimit: 80,
      vibration: 2.1,
      vibrationLimit: 5.0,
      pressure: 150,
      pressureLimit: 180,
      historicalData: [
        { time: "00:00", temperature: 55, vibration: 1.8, pressure: 148 },
        { time: "01:00", temperature: 58, vibration: 1.9, pressure: 149 },
        { time: "02:00", temperature: 60, vibration: 2.0, pressure: 150 },
        { time: "03:00", temperature: 61, vibration: 2.1, pressure: 150 },
        { time: "04:00", temperature: 62, vibration: 2.1, pressure: 150 }
      ]
    }
  },
  {
    id: "ld-03",
    name: "LD Converter BOF Exhaust Gas Recovery ID Fan #1",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 17200,
    processCriticality: "High",
    telemetry: {
      temperature: 84,
      temperatureUnit: "°C",
      temperatureLimit: 105,
      vibration: 3.2,
      vibrationLimit: 5.5,
      pressure: 45,
      pressureLimit: 60,
      historicalData: [
        { time: "00:00", temperature: 78, vibration: 2.8, pressure: 44 },
        { time: "01:00", temperature: 80, vibration: 2.9, pressure: 45 },
        { time: "02:00", temperature: 82, vibration: 3.0, pressure: 45 },
        { time: "03:00", temperature: 83, vibration: 3.1, pressure: 45 },
        { time: "04:00", temperature: 84, vibration: 3.2, pressure: 45 }
      ]
    }
  },
  {
    id: "utl-02",
    name: "Primary Water Treatment Clarifier Feed Pump #2",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 8200,
    processCriticality: "Medium",
    telemetry: {
      temperature: 36,
      temperatureUnit: "°C",
      temperatureLimit: 55,
      vibration: 1.2,
      vibrationLimit: 3.0,
      pressure: 4.5,
      pressureLimit: 6.0,
      historicalData: [
        { time: "00:00", temperature: 32, vibration: 1.0, pressure: 4.3 },
        { time: "01:00", temperature: 33, vibration: 1.1, pressure: 4.4 },
        { time: "02:00", temperature: 34, vibration: 1.1, pressure: 4.4 },
        { time: "03:00", temperature: 35, vibration: 1.2, pressure: 4.5 },
        { time: "04:00", temperature: 36, vibration: 1.2, pressure: 4.5 }
      ]
    }
  },
  {
    id: "oxy-01",
    name: "Oxygen Plant Cryogenic MAC Stand #1",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 19800,
    processCriticality: "Critical",
    telemetry: {
      temperature: 98,
      temperatureUnit: "°C",
      temperatureLimit: 115,
      vibration: 1.8,
      vibrationLimit: 3.5,
      pressure: 8.5,
      pressureLimit: 11.0,
      historicalData: [
        { time: "00:00", temperature: 90, vibration: 1.5, pressure: 8.2 },
        { time: "01:00", temperature: 92, vibration: 1.6, pressure: 8.3 },
        { time: "02:00", temperature: 94, vibration: 1.7, pressure: 8.4 },
        { time: "03:00", temperature: 96, vibration: 1.7, pressure: 8.4 },
        { time: "04:00", temperature: 98, vibration: 1.8, pressure: 8.5 }
      ]
    }
  },
  {
    id: "bf-05",
    name: "Blast Furnace #4 Gas Cleaning Plant Venturi Scrubber",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 14500,
    processCriticality: "High",
    telemetry: {
      temperature: 62,
      temperatureUnit: "°C",
      temperatureLimit: 85,
      vibration: 2.1,
      vibrationLimit: 4.5,
      pressure: 1.2,
      pressureLimit: 2.0,
      historicalData: [
        { time: "00:00", temperature: 58, vibration: 1.9, pressure: 1.1 },
        { time: "01:00", temperature: 59, vibration: 1.9, pressure: 1.1 },
        { time: "02:00", temperature: 60, vibration: 2.0, pressure: 1.2 },
        { time: "03:00", temperature: 61, vibration: 2.0, pressure: 1.2 },
        { time: "04:00", temperature: 62, vibration: 2.1, pressure: 1.2 }
      ]
    }
  },
  {
    id: "bf-06",
    name: "Blast Furnace #4 Hot Blast Stove Combustion Air Fan",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 11200,
    processCriticality: "Medium",
    telemetry: {
      temperature: 74,
      temperatureUnit: "°C",
      temperatureLimit: 95,
      vibration: 2.8,
      vibrationLimit: 5.0,
      pressure: 0.15,
      pressureLimit: 0.3,
      historicalData: [
        { time: "00:00", temperature: 70, vibration: 2.5, pressure: 0.12 },
        { time: "01:00", temperature: 71, vibration: 2.6, pressure: 0.13 },
        { time: "02:00", temperature: 72, vibration: 2.7, pressure: 0.14 },
        { time: "03:00", temperature: 73, vibration: 2.8, pressure: 0.14 },
        { time: "04:00", temperature: 74, vibration: 2.8, pressure: 0.15 }
      ]
    }
  },
  {
    id: "bf-07",
    name: "Blast Furnace #4 Slag Granulation Water Pump",
    area: "Ironmaking",
    status: "Healthy",
    delayCostPerHour: 9800,
    processCriticality: "Medium",
    telemetry: {
      temperature: 52,
      temperatureUnit: "°C",
      temperatureLimit: 70,
      vibration: 1.9,
      vibrationLimit: 3.5,
      pressure: 4.2,
      pressureLimit: 6.0,
      historicalData: [
        { time: "00:00", temperature: 48, vibration: 1.7, pressure: 4.0 },
        { time: "01:00", temperature: 49, vibration: 1.8, pressure: 4.1 },
        { time: "02:00", temperature: 50, vibration: 1.8, pressure: 4.1 },
        { time: "03:00", temperature: 51, vibration: 1.9, pressure: 4.2 },
        { time: "04:00", temperature: 52, vibration: 1.9, pressure: 4.2 }
      ]
    }
  },
  {
    id: "cc-04",
    name: "Continuous Caster Tundish Car Travel Drive",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 16500,
    processCriticality: "High",
    telemetry: {
      temperature: 78,
      temperatureUnit: "°C",
      temperatureLimit: 105,
      vibration: 2.4,
      vibrationLimit: 4.5,
      pressure: 140,
      pressureLimit: 180,
      historicalData: [
        { time: "00:00", temperature: 72, vibration: 2.1, pressure: 135 },
        { time: "01:00", temperature: 74, vibration: 2.2, pressure: 136 },
        { time: "02:00", temperature: 75, vibration: 2.3, pressure: 138 },
        { time: "03:00", temperature: 77, vibration: 2.3, pressure: 140 },
        { time: "04:00", temperature: 78, vibration: 2.4, pressure: 140 }
      ]
    }
  },
  {
    id: "cc-05",
    name: "Continuous Caster Secondary Cooling Spray Booms",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 15200,
    processCriticality: "High",
    telemetry: {
      temperature: 41,
      temperatureUnit: "°C",
      temperatureLimit: 60,
      vibration: 1.1,
      vibrationLimit: 2.5,
      pressure: 12.4,
      pressureLimit: 18.0,
      historicalData: [
        { time: "00:05", temperature: 38, vibration: 0.9, pressure: 12.0 },
        { time: "01:05", temperature: 39, vibration: 1.0, pressure: 12.2 },
        { time: "02:05", temperature: 40, vibration: 1.0, pressure: 12.3 },
        { time: "03:05", temperature: 40, vibration: 1.1, pressure: 12.4 },
        { time: "04:05", temperature: 41, vibration: 1.1, pressure: 12.4 }
      ]
    }
  },
  {
    id: "cc-06",
    name: "Continuous Caster Discharge Roller Table",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 11800,
    processCriticality: "Medium",
    telemetry: {
      temperature: 88,
      temperatureUnit: "°C",
      temperatureLimit: 120,
      vibration: 3.2,
      vibrationLimit: 5.5,
      pressure: 14.5,
      pressureLimit: 20.0,
      historicalData: [
        { time: "00:00", temperature: 82, vibration: 2.8, pressure: 14.0 },
        { time: "01:00", temperature: 84, vibration: 2.9, pressure: 14.2 },
        { time: "02:00", temperature: 85, vibration: 3.0, pressure: 14.3 },
        { time: "03:00", temperature: 87, vibration: 3.1, pressure: 14.5 },
        { time: "04:00", temperature: 88, vibration: 3.2, pressure: 14.5 }
      ]
    }
  },
  {
    id: "hsm-04",
    name: "Hot Strip Mill Descaling Pump No. 3",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 23500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 58,
      temperatureUnit: "°C",
      temperatureLimit: 85,
      vibration: 2.2,
      vibrationLimit: 4.5,
      pressure: 242,
      pressureLimit: 280,
      historicalData: [
        { time: "00:00", temperature: 54, vibration: 1.9, pressure: 240 },
        { time: "01:00", temperature: 55, vibration: 2.0, pressure: 241 },
        { time: "02:00", temperature: 56, vibration: 2.1, pressure: 241 },
        { time: "03:00", temperature: 57, vibration: 2.1, pressure: 242 },
        { time: "04:00", temperature: 58, vibration: 2.2, pressure: 242 }
      ]
    }
  },
  {
    id: "hsm-05",
    name: "Hot Strip Mill Runout Table Cooling Water Spray Sector 4",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 18450,
    processCriticality: "High",
    telemetry: {
      temperature: 44,
      temperatureUnit: "°C",
      temperatureLimit: 65,
      vibration: 1.2,
      vibrationLimit: 3.0,
      pressure: 6.8,
      pressureLimit: 10.0,
      historicalData: [
        { time: "00:00", temperature: 40, vibration: 1.0, pressure: 6.5 },
        { time: "01:00", temperature: 41, vibration: 1.1, pressure: 6.6 },
        { time: "02:00", temperature: 42, vibration: 1.1, pressure: 6.6 },
        { time: "03:00", temperature: 43, vibration: 1.2, pressure: 6.7 },
        { time: "04:00", temperature: 44, vibration: 1.2, pressure: 6.8 }
      ]
    }
  },
  {
    id: "hsm-06",
    name: "Hot Strip Mill Crop Shear Drive Motor",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 22800,
    processCriticality: "High",
    telemetry: {
      temperature: 71,
      temperatureUnit: "°C",
      temperatureLimit: 90,
      vibration: 2.3,
      vibrationLimit: 4.8,
      pressure: 185,
      pressureLimit: 220,
      historicalData: [
        { time: "00:00", temperature: 65, vibration: 2.0, pressure: 180 },
        { time: "01:00", temperature: 67, vibration: 2.1, pressure: 181 },
        { time: "02:00", temperature: 68, vibration: 2.2, pressure: 183 },
        { time: "03:00", temperature: 70, vibration: 2.2, pressure: 185 },
        { time: "04:00", temperature: 71, vibration: 2.3, pressure: 185 }
      ]
    }
  },
  {
    id: "ld-04",
    name: "LD Converter Oxygen Lance Hoist Winch",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 20500,
    processCriticality: "Critical",
    telemetry: {
      temperature: 68,
      temperatureUnit: "°C",
      temperatureLimit: 90,
      vibration: 1.8,
      vibrationLimit: 4.0,
      pressure: 175,
      pressureLimit: 210,
      historicalData: [
        { time: "00:00", temperature: 62, vibration: 1.5, pressure: 170 },
        { time: "01:00", temperature: 64, vibration: 1.6, pressure: 172 },
        { time: "02:00", temperature: 65, vibration: 1.7, pressure: 173 },
        { time: "03:00", temperature: 67, vibration: 1.7, pressure: 175 },
        { time: "04:00", temperature: 68, vibration: 1.8, pressure: 175 }
      ]
    }
  },
  {
    id: "ld-05",
    name: "LD Converter Sub-Lance Measuring System Drive",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 18100,
    processCriticality: "High",
    telemetry: {
      temperature: 61,
      temperatureUnit: "°C",
      temperatureLimit: 85,
      vibration: 1.3,
      vibrationLimit: 3.0,
      pressure: 120,
      pressureLimit: 150,
      historicalData: [
        { time: "00:00", temperature: 55, vibration: 1.1, pressure: 118 },
        { time: "01:00", temperature: 56, vibration: 1.2, pressure: 119 },
        { time: "02:00", temperature: 58, vibration: 1.2, pressure: 120 },
        { time: "03:00", temperature: 60, vibration: 1.3, pressure: 120 },
        { time: "04:00", temperature: 61, vibration: 1.3, pressure: 120 }
      ]
    }
  },
  {
    id: "ld-06",
    name: "LD Converter Scrap Charging Crane Main Hoist",
    area: "Steelmaking",
    status: "Healthy",
    delayCostPerHour: 19400,
    processCriticality: "Critical",
    telemetry: {
      temperature: 55,
      temperatureUnit: "°C",
      temperatureLimit: 80,
      vibration: 1.4,
      vibrationLimit: 3.5,
      pressure: 45,
      pressureLimit: 60,
      historicalData: [
        { time: "00:00", temperature: 50, vibration: 1.2, pressure: 42 },
        { time: "01:00", temperature: 51, vibration: 1.2, pressure: 43 },
        { time: "02:00", temperature: 53, vibration: 1.3, pressure: 44 },
        { time: "03:00", temperature: 54, vibration: 1.3, pressure: 45 },
        { time: "04:00", temperature: 55, vibration: 1.4, pressure: 45 }
      ]
    }
  },
  {
    id: "cogc-04",
    name: "Coke Oven Ammonia Washer Recirculation Pump",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 10400,
    processCriticality: "Medium",
    telemetry: {
      temperature: 48,
      temperatureUnit: "°C",
      temperatureLimit: 70,
      vibration: 1.6,
      vibrationLimit: 3.5,
      pressure: 3.8,
      pressureLimit: 5.5,
      historicalData: [
        { time: "00:00", temperature: 44, vibration: 1.3, pressure: 3.5 },
        { time: "01:00", temperature: 45, vibration: 1.4, pressure: 3.6 },
        { time: "02:00", temperature: 46, vibration: 1.4, pressure: 3.7 },
        { time: "03:00", temperature: 47, vibration: 1.5, pressure: 3.8 },
        { time: "04:00", temperature: 48, vibration: 1.6, pressure: 3.8 }
      ]
    }
  },
  {
    id: "cogc-05",
    name: "Coke Oven Exhaust Gas Suction Main Valve",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 11500,
    processCriticality: "High",
    telemetry: {
      temperature: 82,
      temperatureUnit: "°C",
      temperatureLimit: 110,
      vibration: 1.5,
      vibrationLimit: 3.0,
      pressure: 0.18,
      pressureLimit: 0.35,
      historicalData: [
        { time: "00:00", temperature: 75, vibration: 1.2, pressure: 0.15 },
        { time: "01:00", temperature: 77, vibration: 1.3, pressure: 0.16 },
        { time: "02:00", temperature: 79, vibration: 1.4, pressure: 0.17 },
        { time: "03:00", temperature: 80, vibration: 1.4, pressure: 0.18 },
        { time: "04:00", temperature: 82, vibration: 1.5, pressure: 0.18 }
      ]
    }
  },
  {
    id: "wrm-02",
    name: "Wire Rod Mill Finishing Block Drive Shaft",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 16200,
    processCriticality: "High",
    telemetry: {
      temperature: 78,
      temperatureUnit: "°C",
      temperatureLimit: 95,
      vibration: 2.1,
      vibrationLimit: 4.5,
      pressure: 12.0,
      pressureLimit: 16.0,
      historicalData: [
        { time: "00:00", temperature: 72, vibration: 1.8, pressure: 11.5 },
        { time: "01:00", temperature: 74, vibration: 1.9, pressure: 11.7 },
        { time: "02:00", temperature: 75, vibration: 2.0, pressure: 11.8 },
        { time: "03:00", temperature: 76, vibration: 2.0, pressure: 12.0 },
        { time: "04:00", temperature: 78, vibration: 2.1, pressure: 12.0 }
      ]
    }
  },
  {
    id: "crm-03",
    name: "Cold Rolling Mill Tension Leveler Centering Guide",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 20250,
    processCriticality: "High",
    telemetry: {
      temperature: 55,
      temperatureUnit: "°C",
      temperatureLimit: 75,
      vibration: 1.4,
      vibrationLimit: 3.2,
      pressure: 145,
      pressureLimit: 190,
      historicalData: [
        { time: "00:00", temperature: 50, vibration: 1.1, pressure: 140 },
        { time: "01:00", temperature: 52, vibration: 1.2, pressure: 142 },
        { time: "02:00", temperature: 53, vibration: 1.3, pressure: 143 },
        { time: "03:00", temperature: 54, vibration: 1.3, pressure: 145 },
        { time: "04:00", temperature: 55, vibration: 1.4, pressure: 145 }
      ]
    }
  },
  {
    id: "crm-04",
    name: "Cold Rolling Mill Entry Tension Reel Mandrel",
    area: "Rolling Mill",
    status: "Healthy",
    delayCostPerHour: 22300,
    processCriticality: "Critical",
    telemetry: {
      temperature: 66,
      temperatureUnit: "°C",
      temperatureLimit: 90,
      vibration: 1.9,
      vibrationLimit: 4.5,
      pressure: 210,
      pressureLimit: 250,
      historicalData: [
        { time: "00:00", temperature: 60, vibration: 1.6, pressure: 205 },
        { time: "01:00", temperature: 62, vibration: 1.7, pressure: 207 },
        { time: "02:00", temperature: 63, vibration: 1.8, pressure: 208 },
        { time: "03:00", temperature: 65, vibration: 1.8, pressure: 210 },
        { time: "04:00", temperature: 66, vibration: 1.9, pressure: 210 }
      ]
    }
  },
  {
    id: "utl-03",
    name: "Boiler House High-Pressure Deaerator Feedwater Pump",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 9100,
    processCriticality: "High",
    telemetry: {
      temperature: 110,
      temperatureUnit: "°C",
      temperatureLimit: 140,
      vibration: 1.7,
      vibrationLimit: 4.0,
      pressure: 8.4,
      pressureLimit: 12.0,
      historicalData: [
        { time: "00:00", temperature: 102, vibration: 1.4, pressure: 8.0 },
        { time: "01:00", temperature: 104, vibration: 1.5, pressure: 8.1 },
        { time: "02:00", temperature: 106, vibration: 1.5, pressure: 8.2 },
        { time: "03:00", temperature: 108, vibration: 1.6, pressure: 8.3 },
        { time: "04:00", temperature: 110, vibration: 1.7, pressure: 8.4 }
      ]
    }
  },
  {
    id: "oxy-02",
    name: "Oxygen Plant Air Suction Filter Baghouse Radial Fan",
    area: "Utilities",
    status: "Healthy",
    delayCostPerHour: 15400,
    processCriticality: "High",
    telemetry: {
      temperature: 52,
      temperatureUnit: "°C",
      temperatureLimit: 75,
      vibration: 2.2,
      vibrationLimit: 4.8,
      pressure: 2.1,
      pressureLimit: 3.5,
      historicalData: [
        { time: "00:00", temperature: 46, vibration: 1.8, pressure: 1.9 },
        { time: "01:00", temperature: 48, vibration: 1.9, pressure: 2.0 },
        { time: "02:00", temperature: 49, vibration: 2.0, pressure: 2.1 },
        { time: "03:00", temperature: 51, vibration: 2.1, pressure: 2.1 },
        { time: "04:00", temperature: 52, vibration: 2.2, pressure: 2.1 }
      ]
    }
  }
];

const INITIAL_ALERTS: ControlRoomAlert[] = [
  {
    id: "alt-001",
    assetId: "bf-04",
    assetName: "Blast Furnace #4 Tuyere System",
    timestamp: "2026-06-08T04:20:00Z",
    severity: "critical",
    message: "TUYERE NO-4 HEAD TEMPERATURE EXCEEDS SAFE RUNNING MARGIN. COOLING NOZZLE FLOW DROPPED BENEATH CRITICAL LIMITS (< 350 L/MIN). BLOCKAGE OR PINCH DETECTED.",
    status: "Unacknowledged",
    delayMinutes: 45
  },
  {
    id: "alt-002",
    assetId: "cc-02",
    assetName: "Continuous Caster Mould Oscillator #2",
    timestamp: "2026-06-08T04:35:00Z",
    severity: "medium",
    message: "ECCENTRIC BEARINGS VIBRATION EXCEEDED WARNING THRESHOLD (6.8 mm/s vs 5.0 mm/s Limit). REPETITIVE PEAKS IN HORIZONTAL AXIS INDICATE LUBRICATION DEGRADATION OR MECHANICAL PLAY.",
    status: "Unacknowledged",
    delayMinutes: 30
  }
];

const INITIAL_LOGBOOK: LogbookEntry[] = [
  {
    id: "log-101",
    assetId: "bf-04",
    assetName: "Blast Furnace #4 Tuyere System",
    actionTaken: "Cleaned outer sand/slag sediment layer from Tuyere #4 housing, checked flow sensor alignment, restarted auxiliary water pumps.",
    engineerName: "M. Riyaz",
    timestamp: "2026-06-07T14:30:00Z",
    status: "Completed"
  },
  {
    id: "log-102",
    assetId: "cogc-03",
    assetName: "Coke Oven Gas Compressor #3 Main Rotor",
    actionTaken: "Replaced primary intake pressure solenoid valve, calibrated rotor guide clearance settings.",
    engineerName: "T. Sengupta",
    timestamp: "2026-06-06T09:15:00Z",
    status: "Completed"
  }
];

export const INITIAL_KB_DOCUMENTS: KBDocument[] = [
  {
    id: "kb-sop-001",
    category: "SOP",
    title: "SOP-102-BF: Managing Tuyere Gas & Temperature Anomalies",
    lastUpdated: "2025-11-20",
    content: `STANDARD OPERATING PROCEDURE: BLAST FURNACE TUYERE THERMAL ANOMALIES
1. PURPOSE & SCOPE
Ensures safe operating margins when tuyere sleeve or head temperatures spike. Tuyeres inject hot oxygen blast into the hearth and are extremely heat-stressed. Water cooling circuits are critical to prevent burn-throughs, which can cause catastrophic steam-metal explosions.

2. IMMEDIATE ACTIONS FOR SPIKING TEMP (> 1100°C)
a. Verify active cooling water flow rate immediately. Critical threshold is 350 Litres/minute.
b. If flow < 350 L/min, assume water nozzle blockage or mechanical scale obstruction.
c. Perform backpulsing of the supply water line at 1.5x hydraulic operating pressure to dislodge particulates.
d. Reduce oxygen blast volume through the affected tuyere by 15-20% to cool down the assembly.
e. If water flow remains low and temperature crosses 1250°C, emergency shutoff of the blast must occur within 30 minutes to prevent metal melt-through (catastrophic hazard).

3. DIAGNOSTICS & ROOT CAUSES
- Low flow with high temperature indicates supply filter clogging, nozzle blockage, or scale buildup in copper jacket.
- High flow with high temperature indicates carbon blockage or severe hearth slag coating displacement causing local gas path deflection.`
  },
  {
    id: "kb-sop-002",
    category: "SOP",
    title: "SOP-205-CC: Mould Oscillator Mechanical Discrepancy",
    lastUpdated: "2025-08-14",
    content: `STANDARD OPERATING PROCEDURE: CASTING MOULD OSCILLATOR ANOMALIES
1. DESCRIPTION & THRESHOLDS
Mould oscillation is necessary to prevent sticking of the steel skin in the water-cooled copper mould. Normal vibration limit is below 5.0 mm/s. Extreme mechanical wear leads to surface defects on steel billets (oscillation marks, cracking).

2. STEP-BY-STEP TROUBLESHOOTING
a. Extract active spectrum analysis. Check for peaks in horizontal (X) axis vs vertical (Z) axis.
b. Excessive horizontal vibration (peak > 5.0 mm/s) indicates eccentric bearing shaft wobble or hydraulic push-rod slide play.
c. Check oil lubrication pressure. Normal pressure is 180-220 bar. If pressure fluctuates, lubrication nozzles are partially choked.
d. Administer grease injector flush manually. Verify if grease viscosity is contaminated with metal shavings.
e. Inspect work clamping brackets for loose foundation anchor nuts. Tighten to 450 N-m torque.`
  },
  {
    id: "kb-sop-003",
    category: "SOP",
    title: "SOP-301-HSM: Rolling Bearing Thermal Overload Prevention",
    lastUpdated: "2026-01-10",
    content: `STANDARD OPERATING PROCEDURE: HOT STRIP MILL ROLL BEARINGS
1. GUIDELINES
Work rolls operate at high loads. Bearing housings must remain below 85°C. Overheating causes bearing jam-up, which ruins mill rollers (worth $120k apiece) and causes continuous plant-wide delays.

2. CORRECTIVE PROCEDURES
- Initiate supplementary external roll cooling spray immediately.
- Apply lubricant purge cycle. Force fresh synthetic high-temperature lithium-complex grease.
- Monitor wear telemetry. If vibration exceeds 4.5 mm/s, halt roll stand at next changeover to avoid catastrophic seizure.`
  },
  {
    id: "kb-man-001",
    category: "Manual",
    title: "SMS Group Blast Furnace Tuyere Installation and Care Manual",
    lastUpdated: "2023-04-12",
    content: `SMS GROUP COPPERS & BLAST FURNACE INJECTION EQUIPMENT - SECTION 4
4.1 Mechanical Construction:
The Blast Furnace Tuyere consists of a casting-grade high-purity copper body with high thermal conductivity. It is protected by a wear-resistant heat deflector sleeve made of refractory alloy (stellite coating).

4.2 Cooling Water Nozzles:
Water nozzle inlet ports (3/4-inch NPT) are located on the rear flange. They direct cooling water in a toroidal velocity path around the nose tip. Minimum water pressure of 4.5 bar absolute is required. If pressure drops below 3.8 bar, boiling occurs in the jacket, leading to instant hotspot formation, steam blistering, and rapid structural stress cracking. Maximum scrap-damage threshold is 1300°C.`
  },
  {
    id: "kb-man-002",
    category: "Manual",
    title: "SMS Demag Mould Oscillator Maintenance Manual Section 12",
    lastUpdated: "2024-03-30",
    content: `SMS DEMAG CASTING EQUIPMENT SERIES B - HYDRAULIC & MECHANICAL OSCILLATORS
12.3 Eccentric Drive Bearings:
The drive shaft uses custom double-row spherical roller bearings (Model: FAG 22352-TB). Bearing clearances of 0.230 to 0.280 mm are calibrated. Mechanical wear of more than 0.350 mm causes rapid eccentric deflection and extreme vibration spikes (> 5.0 mm/s) in the radial direction.

12.4 Spare Compatibility & Lubrication:
Always grease with Klüberplex BE 31-502. Lead time for procuring replacement FAG 22352 bearings is normally 45-60 days. Standby storage is critical.`
  },
  {
    id: "kb-hist-001",
    category: "Historical_Log",
    title: "Failure Record Archive: BF-4 Tuyere Failure Burn-through (March 2024)",
    lastUpdated: "2024-03-15",
    content: `INCIDENT ID: INC-BF4-2024-03
Date: March 15, 2024
Area: BF-4 Tuyere #11
Symptom: Head temperature rose to 1230°C. Water flow dropped to 290 L/min.
Resolution: Repair team postponed water filter flush due to hot-metal tapping constraints. 45 minutes later, the tuyere nose suffered burn-through. Water entered the hearth, triggering steam blowback and forcing a emergency 12-hour furnace dump.
Delay Cost: $222,000 in lost hot-metal production.
Lessons Learned: NEVER delay backpulsing or filter replacement once cooling water flow falls below 350 L/min.`
  },
  {
    id: "kb-hist-002",
    category: "Historical_Log",
    title: "Failure Record Archive: HSM Stand 1 Bearing Seizure (Oct 2025)",
    lastUpdated: "2025-10-02",
    content: `INCIDENT ID: INC-HSM-2025-10
Date: October 2, 2025
Area: HSM S1 Work Roll
Symptom: Rapid temperature spike from 65°C to 118°C over a 15-minute window during high-throughput rolling. Grease filter check showed fine bronze slivers.
Resolution: Emergency roll stand changeover executed. The bearing rollers split, but catastrophic cage explosion was prevented by speedy load deceleration.
Preventative Measure: Configured predictive rule to immediately flag spikes > 15°C/hr as early warning sign.`
  },
  {
    id: "kb-spare-001",
    category: "Spare_DB",
    title: "Steel Plant Spare Parts Inventory and Procurement Lead Times",
    lastUpdated: "2026-05-15",
    content: `CRITICAL EQUIPMENT SPARE LEVEL CATALOGUE:
1. BF Copper Tuyere Body (Model BF-COP-T4):
   - Current Inventory: 0 units
   - Procurement Lead Time: 30 days
   - Safety Level: 1 unit

2. SMS Oscillator Bearing (Model FAG 22352-TB):
   - Current Inventory: 1 unit
   - Procurement Lead Time: 45 days
   - Safety Level: 1 unit

3. Work Roll Bearing (Model WRB-SL90):
   - Current Inventory: 4 units
   - Procurement Lead Time: 60 days
   - Safety Level: 2 units

4. Compressor Solenoid Valve (Model SV-COGC):
   - Current Inventory: 2 units
   - Procurement Lead Time: 7 days
   - Safety Level: 1 unit`
  }
];

// Helper: safe JSON parsers for client side
function safeGetItem<T>(key: string, backup: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : backup;
  } catch {
    return backup;
  }
}

function safeSetItem<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error("Local storage allocation error:", err);
  }
}

// Client Side Database Manager Cache
export class ClientStore {
  static getAssets(): Asset[] {
    const list = safeGetItem<Asset[]>("ts_mw_assets", INITIAL_ASSETS);
    if (list.length < INITIAL_ASSETS.length) {
      const map = new Map(list.map(a => [a.id, a]));
      INITIAL_ASSETS.forEach(a => {
        if (!map.has(a.id)) {
          list.push(a);
        }
      });
      this.saveAssets(list);
    }
    return list;
  }

  static saveAssets(assetsList: Asset[]) {
    safeSetItem("ts_mw_assets", assetsList);
  }

  static getAlerts(): ControlRoomAlert[] {
    return safeGetItem<ControlRoomAlert[]>("ts_mw_alerts", INITIAL_ALERTS);
  }

  static saveAlerts(alertsList: ControlRoomAlert[]) {
    safeSetItem("ts_mw_alerts", alertsList);
  }

  static getLogbook(): LogbookEntry[] {
    return safeGetItem<LogbookEntry[]>("ts_mw_logbook", INITIAL_LOGBOOK);
  }

  static saveLogbook(logList: LogbookEntry[]) {
    safeSetItem("ts_mw_logbook", logList);
  }

  static getFeedbacks(): EngineerFeedback[] {
    return safeGetItem<EngineerFeedback[]>("ts_mw_feedbacks", []);
  }

  static saveFeedbacks(feedbackList: EngineerFeedback[]) {
    safeSetItem("ts_mw_feedbacks", feedbackList);
  }

  static getKbDocuments(): KBDocument[] {
    return INITIAL_KB_DOCUMENTS;
  }

  // Mutator and State transitions
  static updateAssetTelemetry(assetId: string, sensorUpdate: { temperature?: number; vibration?: number; pressure?: number; flowRate?: number }): { assets: Asset[]; alerts: ControlRoomAlert[] } {
    const assetsList = this.getAssets();
    const alertsList = this.getAlerts();
    const asset = assetsList.find(a => a.id === assetId);

    if (asset) {
      if (sensorUpdate.temperature !== undefined) asset.telemetry.temperature = sensorUpdate.temperature;
      if (sensorUpdate.vibration !== undefined) asset.telemetry.vibration = sensorUpdate.vibration;
      if (sensorUpdate.pressure !== undefined) asset.telemetry.pressure = sensorUpdate.pressure;
      if (sensorUpdate.flowRate !== undefined && asset.telemetry.flowRate !== undefined) {
        asset.telemetry.flowRate = sensorUpdate.flowRate;
      }

      // Re-calculate alerts based on safety thresholds
      let isCritical = false;
      let isWarning = false;

      if (asset.telemetry.temperature > asset.telemetry.temperatureLimit) isCritical = true;
      else if (asset.telemetry.temperature > asset.telemetry.temperatureLimit * 0.9) isWarning = true;

      if (asset.telemetry.vibration > asset.telemetry.vibrationLimit) isCritical = true;
      else if (asset.telemetry.vibration > asset.telemetry.vibrationLimit * 0.8) isWarning = true;

      if (asset.telemetry.flowRate !== undefined && asset.telemetry.flowRateLimit !== undefined) {
        if (asset.telemetry.flowRate < asset.telemetry.flowRateLimit) isCritical = true;
      }

      asset.status = isCritical ? "Critical" : isWarning ? "Warning" : "Healthy";

      // If status became warning/critical and there isn't an pending active alert, spawn it!
      if (asset.status === "Critical" || asset.status === "Warning") {
        const existingAlert = alertsList.find(alt => alt.assetId === assetId && alt.status !== "Resolved");
        if (!existingAlert) {
          const isCrit = asset.status === "Critical";
          const newAlert: ControlRoomAlert = {
            id: `alt-${Math.floor(Math.random() * 900) + 100}`,
            assetId: assetId,
            assetName: asset.name,
            timestamp: new Date().toISOString(),
            severity: isCrit ? "critical" : "medium",
            message: `AUTOMATED SYSTEM TRIGGER: ${asset.name} telemetry exceeded safety tolerances. Temperature: ${asset.telemetry.temperature}${asset.telemetry.temperatureUnit} (Max: ${asset.telemetry.temperatureLimit}), Vib: ${asset.telemetry.vibration} mm/s (Max: ${asset.telemetry.vibrationLimit}). Flow Rate: ${asset.telemetry.flowRate !== undefined ? `${asset.telemetry.flowRate} L/min` : "N/A"}. Ref: SOP-${asset.id === "bf-04" ? "102-BF" : "205-CC"}.`,
            status: "Unacknowledged",
            delayMinutes: isCrit ? 45 : 20
          };
          alertsList.unshift(newAlert);
        }
      }
    }

    this.saveAssets(assetsList);
    this.saveAlerts(alertsList);
    return { assets: assetsList, alerts: alertsList };
  }

  static acknowledgeAlert(alertId: string, newStatus: "Investigating" | "Resolved"): { assets: Asset[]; alerts: ControlRoomAlert[] } {
    const alertsList = this.getAlerts();
    const assetsList = this.getAssets();
    const alert = alertsList.find(a => a.id === alertId);

    if (alert) {
      alert.status = newStatus;

      // If resolved, reset telemetry to nominal
      if (newStatus === "Resolved") {
        const asset = assetsList.find(a => a.id === alert.assetId);
        if (asset) {
          if (asset.id === "bf-04") {
            asset.telemetry.temperature = 980;
            asset.telemetry.vibration = 1.3;
            if (asset.telemetry.flowRate !== undefined) asset.telemetry.flowRate = 420;
          } else if (asset.id === "cc-02") {
            asset.telemetry.vibration = 2.4;
            asset.telemetry.temperature = 145;
          } else if (asset.id === "hsm-01") {
            asset.telemetry.temperature = 65;
            asset.telemetry.vibration = 2.0;
          }
          asset.status = "Healthy";
        }
      }
    }

    this.saveAssets(assetsList);
    this.saveAlerts(alertsList);
    return { assets: assetsList, alerts: alertsList };
  }

  static addLogbookEntry(assetId: string, actionTaken: string, engineerName: string, alertId?: string): { assets: Asset[]; alerts: ControlRoomAlert[]; logbook: LogbookEntry[] } {
    const assetsList = this.getAssets();
    const loglist = this.getLogbook();
    const asset = assetsList.find(a => a.id === assetId);

    if (!asset) {
      return { assets: assetsList, alerts: this.getAlerts(), logbook: loglist };
    }

    const newLogItem: LogbookEntry = {
      id: `log-${Date.now()}`,
      assetId,
      assetName: asset.name,
      actionTaken,
      engineerName,
      timestamp: new Date().toISOString(),
      alertId,
      status: "Completed"
    };

    loglist.unshift(newLogItem);
    this.saveLogbook(loglist);

    // If an alert was linked, resolve it
    let finalAlerts = this.getAlerts();
    if (alertId) {
      const res = this.acknowledgeAlert(alertId, "Resolved");
      return { assets: res.assets, alerts: res.alerts, logbook: loglist };
    }

    return { assets: assetsList, alerts: finalAlerts, logbook: loglist };
  }

  static addFeedback(assetId: string, rating: "helpful" | "unhelpful", correctionNote?: string): EngineerFeedback[] {
    const list = this.getFeedbacks();
    const newFeedback: EngineerFeedback = {
      id: `fb-${Date.now()}`,
      diagnosticId: "diag-current",
      assetId,
      userId: "user-eng",
      userEmail: "engineer@tatasteel.com",
      rating,
      correctionNote,
      timestamp: new Date().toISOString()
    };
    list.push(newFeedback);
    this.saveFeedbacks(list);
    return list;
  }
}
