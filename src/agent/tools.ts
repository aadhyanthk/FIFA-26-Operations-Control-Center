export const TOOL_DEFINITIONS = [
  // Stadium Operations
  {
    type: 'function',
    function: {
      name: "open_gate",
      description: "Open a stadium gate for fan entry/exit",
      parameters: {
        type: "object",
        properties: {
          gate_id: { type: "string", description: "'A'|'B'|'C'|'D'|'E'|'F'" }
        },
        required: ["gate_id"]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "close_gate",
      description: "Close a stadium gate",
      parameters: {
        type: "object",
        properties: { gate_id: { type: "string" } },
        required: ["gate_id"]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "adjust_gate_lanes",
      description: "Change number of active security lanes at a gate",
      parameters: {
        type: "object",
        properties: {
          gate_id: { type: "string" },
          lanes: { type: "number", description: "1-4" }
        },
        required: ["gate_id", "lanes"]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "reroute_gate",
      description: "Reroute a percentage of fans from one gate to another to balance queues",
      parameters: {
        type: "object",
        properties: {
          from_gate: { type: "string", description: "Gate ID ('A'|'B'|'C'|'D'|'E'|'F')" },
          to_gate: { type: "string", description: "Gate ID ('A'|'B'|'C'|'D'|'E'|'F')" },
          percentage: { type: "number", description: "Percentage of queue to reroute (1-100)" }
        },
        required: ["from_gate", "to_gate", "percentage"]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "dispatch_security",
      description: "Deploy a security team to a location",
      parameters: {
        type: "object",
        properties: {
          team_id: { type: "string" },
          location: { type: "string" },
          reason: { type: "string" }
        },
        required: ["location", "reason"]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "dispatch_medical",
      description: "Send a medical team to an incident location",
      parameters: {
        type: "object",
        properties: {
          team_id: { type: "string" },
          location: { type: "string" },
          incident_type: { type: "string" }
        },
        required: ["location", "incident_type"]
      }
    }
  }
  // Add other tools as per GEMINI.md
];
