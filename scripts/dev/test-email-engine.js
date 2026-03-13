async function testEmailEngine() {
    console.log("Starting Email Engine Automation Test...");
    const configuredBase = (process.env.TEST_EMAIL_ENGINE_API_BASE || process.env.BASE_URL || "").trim();
    if (!configuredBase) {
        throw new Error("Set TEST_EMAIL_ENGINE_API_BASE or BASE_URL before running this script.");
    }
    const API_BASE = `${configuredBase.replace(/\/+$/, "")}/api`;
    
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
