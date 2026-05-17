export const buildComplaintPrompt = (description, city, area) => `
You are an AI assistant for a smart city complaint management system.

Analyze this civic complaint and return a structured JSON response.

Complaint Details:
- Description: ${description}
- City: ${city}
- Area: ${area}

Return ONLY a valid JSON object with exactly these fields:
{
  "category": "Road" | "Water" | "Garbage" | "Electrical" | "Drainage" | "Other",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "department": "Road" | "Water" | "Garbage" | "Electrical" | "Drainage",
  "summary": "A short 1-2 sentence official summary of the complaint"
}

Priority guidelines:
- HIGH: Safety hazard, affects many people, urgent (e.g. exposed wires, broken road causing accidents, sewage overflow)
- MEDIUM: Significant inconvenience, needs attention soon (e.g. pothole, water shortage)
- LOW: Minor issue, can be scheduled (e.g. broken streetlight in low traffic area, minor garbage)

Return ONLY the JSON. No explanation, no markdown, no backticks.
`