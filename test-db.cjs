const { neon } = require("@neondatabase/serverless");
const sql = neon("postgresql://neondb_owner:npg_mV4SdZPjug0C@ep-shy-union-apm7ueqr.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require");
sql.query("SELECT 1").then(r => { console.log("DB connected:", JSON.stringify(r)); process.exit(0); }).catch(e => { console.log("DB error:", e.message); process.exit(1); })
