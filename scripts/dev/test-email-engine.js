async function testEmailEngine() {
    console.log("Starting Email Engine Automation Test...");
    const API_BASE = "http://localhost:3001/api";
    
    // 1. Trigger the run-automations endpoint
    console.log("Triggering /api/run-automations...");
    try {
        const res = await fetch(`${API_BASE}/run-automations`, { method: 'POST' });
        const data = await res.json();
        console.log("Automations Result:", data);
    } catch(err) {
        console.error("Error triggering automations:", err);
    }
}

testEmailEngine();
