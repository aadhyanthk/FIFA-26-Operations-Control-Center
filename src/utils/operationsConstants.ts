// Operations Constants & Magic Numbers

export const OCC_CONSTANTS = {
  // Thresholds for alerts
  THRESHOLDS: {
    CRITICAL_DENSITY: 0.90,
    WARNING_DENSITY: 0.75,
    CRITICAL_WAIT_TIME_MINS: 20,
    WARNING_WAIT_TIME_MINS: 10,
    CRITICAL_TRAIN_DELAY: 30,
    SEVERE_WEATHER_RAIN: 0.5,
    HEATWAVE_TEMP: 35,
  },
  
  // Transport & Arrival rates
  TRANSPORT: {
    PEAK_ARRIVAL_RATE: 15,
    BASE_ARRIVAL_RATE: 2,
    LATE_ARRIVAL_RATE: 6,
    TRAIN_BATCH_SIZE: 300,
    BUS_BATCH_SIZE: 50,
  },
  
  // Simulation constraints
  SIMULATION: {
    WEATHER_TICK_RATE: 0.1,
    MAX_WIND_SPEED: 60,
    MAX_HUMIDITY: 95,
  },
  
  // Time limits
  TIME: {
    KICKOFF: 0,
    HOURS_2_OUT: -7200,
    HOURS_1_5_OUT: -5400,
    HOURS_1_OUT: -3600,
    MINS_30_OUT: -1800,
    MINS_15_OUT: -900,
  }
};
