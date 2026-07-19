/**
 * @file operationsConstants.ts
 * @description Central registry for all domain-specific constants, thresholds,
 * and tuning parameters used across the FIFA 26 Operations Control Center
 * simulation engines and AI agent. No engine or agent file should contain
 * inline magic numbers — every numeric literal with domain meaning belongs here.
 */

export const OCC_CONSTANTS = {
  // ---------------------------------------------------------------------------
  // ALERT THRESHOLDS
  // ---------------------------------------------------------------------------
  THRESHOLDS: {
    CRITICAL_DENSITY: 0.90,
    WARNING_DENSITY: 0.75,
    CRITICAL_WAIT_TIME_MINS: 20,
    WARNING_WAIT_TIME_MINS: 10,
    CRITICAL_TRAIN_DELAY: 30,
    SEVERE_WEATHER_RAIN: 0.5,
    HEATWAVE_TEMP: 35,
  },

  // ---------------------------------------------------------------------------
  // WEATHER ENGINE
  // ---------------------------------------------------------------------------
  WEATHER: {
    /** Degrees Celsius per second the temperature interpolates toward its target */
    TEMP_INTERPOLATION_RATE: 0.1,
    /** Rain intensity units per second the value interpolates toward its target */
    RAIN_INTERPOLATION_RATE: 0.005,
    /** Probability per tick that wind speed performs a random walk step */
    WIND_RANDOM_WALK_CHANCE: 0.05,
    /** Probability per tick that humidity performs a random walk step */
    HUMIDITY_RANDOM_WALK_CHANCE: 0.05,
    /** Maximum allowable wind speed in km/h */
    MAX_WIND_SPEED: 60,
    /** Maximum allowable humidity percentage */
    MAX_HUMIDITY: 95,
    /** Minimum allowable humidity percentage */
    MIN_HUMIDITY: 30,
    /** Probability per second of a spontaneous rain squall forming */
    RAIN_SQUALL_CHANCE: 0.0005,
    /** Probability per second of a spontaneous heatwave forming */
    HEATWAVE_CHANCE: 0.0002,
    /** Rain intensity target during a squall event */
    SQUALL_RAIN_TARGET: 0.8,
    /** Minimum wind speed (km/h) enforced during a squall */
    SQUALL_MIN_WIND: 30,
    /** Temperature target (°C) during a heatwave advisory */
    HEATWAVE_TEMP_TARGET: 39,
    /** Probability per tick that an active weather event subsides */
    EVENT_SUBSIDE_CHANCE: 0.002,
    /** Temperature target (°C) when a weather event subsides */
    SUBSIDE_TEMP_TARGET: 25,
    /** Normal temperature drift range (± degrees) */
    TEMP_DRIFT_CHANCE: 0.01,
    TEMP_DRIFT_RANGE: 1.0,
    /** Rain intensity reduction step during natural clearing */
    RAIN_CLEAR_STEP: 0.1,
    RAIN_CLEAR_CHANCE: 0.01,
    /** Normal temperature bounds */
    TEMP_MIN: 18,
    TEMP_MAX: 32,
  },

  // ---------------------------------------------------------------------------
  // TRANSPORT & ARRIVAL ENGINES
  // ---------------------------------------------------------------------------
  TRANSPORT: {
    PEAK_ARRIVAL_RATE: 15,     // passengers/second, 1–0.5 hours out
    BASE_ARRIVAL_RATE: 2,      // passengers/second, 2–1.5 hours out
    MID_ARRIVAL_RATE: 5,       // passengers/second, 1.5–1 hours out
    PRE_PEAK_ARRIVAL_RATE: 10, // passengers/second, 30–15 minutes out
    LATE_ARRIVAL_RATE: 6,      // passengers/second, 15 mins–kickoff
    AFTERKICKOFF_RATE: 2,      // passengers/second, 0–30 mins after kickoff
    /** Noise factor lower bound for arrival randomness */
    ARRIVAL_NOISE_MIN: 0.8,
    /** Noise factor upper bound for arrival randomness */
    ARRIVAL_NOISE_MAX: 0.4,
    /** Boost factor on arrivals when active incidents create chaos */
    INCIDENT_ARRIVAL_BOOST: 1.2,
    TRAIN_BATCH_SIZE_MIN: 200,
    TRAIN_BATCH_SIZE_RANGE: 300,
    /** Probability per second of a scheduled train arriving in the arrival window */
    TRAIN_ARRIVAL_PROBABILITY_PER_SEC: 1 / 300,
    BUS_BATCH_SIZE: 50,
  },

  // ---------------------------------------------------------------------------
  // GATE ENGINE
  // ---------------------------------------------------------------------------
  GATE: {
    /** Number of lanes used as the denominator for the lane throughput ratio */
    STANDARD_LANE_DIVISOR: 4,
    /** Throughput penalty factor applied when rain intensity > SEVERE_WEATHER_RAIN */
    RAIN_THROUGHPUT_PENALTY: 0.85,
    /** Throughput factor when scanner is in 'degraded' state */
    SCANNER_DEGRADED_FACTOR: 0.75,
    /** Throughput factor when scanner is in 'offline' state */
    SCANNER_OFFLINE_FACTOR: 0.50,
    /** Throughput penalty when an active incident is at the gate */
    GATE_INCIDENT_FACTOR: 0.50,
    /**
     * Queue pressure multiplier: the higher the queue relative to this
     * divisor, the larger the surge boost on processing speed.
     */
    PRESSURE_QUEUE_DIVISOR: 2000,
    /** Base surge multiplier applied on top of pressure */
    SURGE_MULTIPLIER: 3,
    /** Minimum dispersal rate (fans/second) when a gate is closed */
    DISPERSAL_RATE_MIN: 5,
    /** Maximum dispersal rate (fans/second) when a gate is closed */
    DISPERSAL_RATE_MAX: 500,
    /** Fraction of queue that disperses per second from a closed gate */
    DISPERSAL_QUEUE_FRACTION: 0.05,
    /** Minimum dispersal walk time (seconds) after being rerouted */
    DISPERSAL_TRANSIT_MIN: 120,
    /** Extra random seconds added to dispersal walk time */
    DISPERSAL_TRANSIT_RANGE: 180,
  },

  // ---------------------------------------------------------------------------
  // CROWD ENGINE
  // ---------------------------------------------------------------------------
  CROWD: {
    /** Fraction of zone max capacity that flows per second from concourse to seating */
    SEATING_FLOW_RATE: 0.02,
    /** Fraction of zone max capacity that flows per second during exodus */
    EXODUS_FLOW_RATE: 0.05,
    /** Target occupancy fraction of seats during halftime (60% remain seated) */
    HALFTIME_SEATED_FRACTION: 0.6,
  },

  // ---------------------------------------------------------------------------
  // MEDICAL ENGINE
  // ---------------------------------------------------------------------------
  MEDICAL: {
    /** Base medical incidents per second across the whole stadium */
    BASE_INCIDENT_RATE: 2 / 3600,
    /** Multiplier on incident rate during peak heat conditions */
    HEAT_RATE_MULTIPLIER: 1.4,
    /** Multiplier on incident rate during heavy rain */
    RAIN_RATE_MULTIPLIER: 1.25,
    /** Multiplier during halftime rush (more standing, moving) */
    HALFTIME_RATE_MULTIPLIER: 1.2,
    /** Multiplier when any zone is at high density */
    HIGH_DENSITY_MULTIPLIER: 1.15,
    /** Resolve time (seconds) per incident severity */
    RESOLVE_TIME: {
      low: 60,
      medium: 120,
      high: 180,
      critical: 300,
    },
  },

  // ---------------------------------------------------------------------------
  // SECURITY ENGINE
  // ---------------------------------------------------------------------------
  SECURITY: {
    /** Base security incidents per second */
    BASE_INCIDENT_RATE: 1 / 3600,
    /** Late-game tension multiplier (after 60 minutes of play) */
    LATE_GAME_MULTIPLIER: 1.3,
    /** Multiplier when a scanner is offline */
    FAILED_SCANNER_MULTIPLIER: 1.15,
    /** General alcohol zone multiplier applied to all incidents */
    ALCOHOL_ZONE_MULTIPLIER: 1.2,
    /** Probability that a security incident spawns in an alcohol zone */
    ALCOHOL_ZONE_SELECTION_CHANCE: 0.6,
    /** Probability per tick that a scanner loses some health */
    SCANNER_DEGRADE_CHANCE: 0.0005,
    /** Max health points lost per degradation event */
    SCANNER_DEGRADE_MAX_POINTS: 10,
    /** Scanner health below which status becomes 'offline' */
    SCANNER_OFFLINE_THRESHOLD: 20,
    /** Scanner health below which status becomes 'degraded' */
    SCANNER_DEGRADED_THRESHOLD: 50,
    RESOLVE_TIME: {
      low: 120,
      medium: 300,
      high: 450,
      critical: 600,
    },
  },

  // ---------------------------------------------------------------------------
  // CLEANING ENGINE
  // ---------------------------------------------------------------------------
  CLEANING: {
    /** Litter accumulation rate per unit of zone density per tick */
    BASE_LITTER_RATE: 0.0005,
    /** Extra litter multiplier for zones adjacent to food courts */
    FOOD_ADJACENT_LITTER_MULTIPLIER: 1.5,
    /** Litter level above which a warning incident is generated */
    LITTER_WARNING_THRESHOLD: 0.7,
    /** Litter level above which severity escalates to 'high' */
    LITTER_HIGH_THRESHOLD: 0.9,
    /** Restroom usage increase rate per unit of zone density */
    RESTROOM_USAGE_RATE: 0.1,
    /** Restroom usage level above which status becomes 'needs_attention' */
    RESTROOM_ATTENTION_THRESHOLD: 60,
    /** Restroom usage level above which status becomes 'critical' */
    RESTROOM_CRITICAL_THRESHOLD: 100,
    RESOLVE_TIME: {
      low: 60,
      medium: 120,
      high: 240,
      critical: 300,
    },
    FOOD_ADJACENT_ZONES: [
      'East Club',
      'West Club',
      'North Concourse',
      'East Concourse',
      'South Concourse',
      'West Concourse',
    ] as const,
  },

  // ---------------------------------------------------------------------------
  // FOOD ENGINE
  // ---------------------------------------------------------------------------
  FOOD: {
    /** Probability per second that operational equipment fails */
    EQUIPMENT_FAIL_CHANCE: 0.0001,
    /** Base vendor processing rate (fans/second) under normal conditions */
    NORMAL_PROCESSING_RATE: 2.0,
    /** Processing rate during an equipment failure */
    FAILED_PROCESSING_RATE: 1.0,
    /** Rate at which fans leave a queue due to failed equipment */
    EQUIPMENT_FAIL_ABANDON_RATE: 0.5,
    /** Headcount above which a 'crowded food court' incident fires */
    CROWDED_THRESHOLD: 1000,
    /** Headcount above which fans start voluntarily walking to a shorter queue */
    LOAD_BALANCE_THRESHOLD: 500,
    /** Headcount below which a food court is considered a candidate to receive overflow */
    LOAD_BALANCE_CANDIDATE_MAX: 150,
    /** Rate (fraction of excess per second) at which overflow fans leave */
    LOAD_BALANCE_RATE: 0.10,
    /** Stock level below which a low-stock alert fires */
    LOW_STOCK_THRESHOLD: 20,
    /** Revenue generated per fan served */
    REVENUE_PER_FAN: 15,
    /** Drink depletion multiplier under high temperature */
    HOT_WEATHER_DRINK_MULTIPLIER: 1.3,
    /** Hot weather temperature threshold */
    HOT_WEATHER_TEMP_THRESHOLD: 30,
    /** Depletion rate of food/drink per fan processed */
    STOCK_DEPLETION_PER_FAN: 0.05,
    /** Match-phase demand multipliers */
    PHASE_MULTIPLIER: {
      halftime: 3.0,
      preGame: 1.5,
      activePlay: 0.5,
    },
    /** Min/max walk time (seconds) for fans going to another food court */
    TRANSIT_TIME_MIN: 180,
    TRANSIT_TIME_RANGE: 120,
  },

  // ---------------------------------------------------------------------------
  // AI AGENT
  // ---------------------------------------------------------------------------
  AGENT: {
    /** Maximum number of tool calls per execution plan */
    MAX_TOOL_CALLS: 3,
    /** Maximum character length of sanitized context inputs */
    MAX_CONTEXT_LENGTH: 500,
    /** Maximum number of plan-generation retries if the LLM returns no actions */
    RETRY_LIMIT: 2,
    /** Delay in milliseconds between executing successive plan actions */
    ACTION_EXECUTION_DELAY_MS: 600,
  },

  // ---------------------------------------------------------------------------
  // TIME LANDMARKS (seconds from kickoff)
  // ---------------------------------------------------------------------------
  TIME: {
    KICKOFF: 0,
    HOURS_2_OUT: -7200,
    HOURS_1_5_OUT: -5400,
    HOURS_1_OUT: -3600,
    MINS_30_OUT: -1800,
    MINS_15_OUT: -900,
    MINS_30_AFTER: 1800,
    HALFTIME_START: 2700,
    HALFTIME_END: 3600,
    SECOND_HALF_END: 6300,
    LATE_GAME_START: 3600, // 60 minutes of play
  },
};
