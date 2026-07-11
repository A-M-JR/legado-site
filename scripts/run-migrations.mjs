/**
 * Aplica migrations pendentes sem apagar dados.
 * Requer SUPABASE_DB_PASSWORD no .env (Dashboard → Settings → Database).
 */
import pg from "pg";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
    const path = join(root, ".env");
    if (!existsSync(path)) return {};
    return Object.fromEntries(
        readFileSync(path, "utf8")
            .split("\n")
            .filter((l) => l.trim() && !l.startsWith("#"))
            .map((l) => {
                const i = l.indexOf("=");
                return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
            })
    );
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const dbPassword = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;

if (!supabaseUrl) {
    console.error("Falta VITE_SUPABASE_URL no .env");
    process.exit(1);
}
if (!dbPassword) {
    console.error(
        "Falta SUPABASE_DB_PASSWORD no .env\n" +
            "Pegue em: Supabase Dashboard → Project Settings → Database → Database password"
    );
    process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const connectionString =
    env.DATABASE_URL ||
    `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

const MIGRATIONS_DIR = join(root, "supabase", "migrations");
const SKIP = new Set(["001_melhor_idade.sql", "002_mi_rede.sql", "003_mi_midias_bucket.sql"]);
const PENDING = ["004_mi_receitas_campos.sql", "006_mi_memoria_publica_fix.sql"];

async function ensureTracking(client) {
    await client.query(`
    CREATE TABLE IF NOT EXISTS _mi_schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function isApplied(client, filename) {
    const { rows } = await client.query(
        "SELECT 1 FROM _mi_schema_migrations WHERE filename = $1",
        [filename]
    );
    return rows.length > 0;
}

async function markApplied(client, filename) {
    await client.query("INSERT INTO _mi_schema_migrations (filename) VALUES ($1)", [filename]);
}

async function run() {
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log("Conectado ao Supabase.");
    } catch (err) {
        if (connectionString.includes("sa-east-1")) {
            const fallback = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
            console.log("Pooler falhou, tentando conexão direta...");
            const client2 = new pg.Client({ connectionString: fallback, ssl: { rejectUnauthorized: false } });
            await client2.connect();
            return runWithClient(client2);
        }
        throw err;
    }

    await runWithClient(client);
}

async function runWithClient(client) {
    try {
        await ensureTracking(client);

        const files = readdirSync(MIGRATIONS_DIR)
            .filter((f) => f.endsWith(".sql"))
            .sort();

        for (const file of files) {
            if (SKIP.has(file)) continue;
            if (!PENDING.includes(file) && file !== "005_mi_memoria_publica.sql") continue;
            if (file === "005_mi_memoria_publica.sql") continue;
            if (await isApplied(client, file)) {
                console.log(`⏭  ${file} (já aplicada)`);
                continue;
            }

            const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
            console.log(`▶  ${file}...`);
            await client.query("BEGIN");
            try {
                await client.query(sql);
                await markApplied(client, file);
                await client.query("COMMIT");
                console.log(`✓  ${file}`);
            } catch (e) {
                await client.query("ROLLBACK");
                throw e;
            }
        }

        console.log("\nMigrations concluídas.");
    } finally {
        await client.end();
    }
}

run().catch((err) => {
    console.error("Erro:", err.message);
    process.exit(1);
});
