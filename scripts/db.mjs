/**
 * Ferramenta de apoio (usa SUPABASE_DB_PASSWORD do .env).
 *   node scripts/db.mjs --file caminho.sql      # aplica um .sql dentro de transação
 *   node scripts/db.mjs --query "SELECT ..."     # roda uma query e imprime linhas
 *   node scripts/db.mjs --as <auth_uid> --query "SELECT ..."  # simula usuário logado (role authenticated + JWT sub)
 *   node scripts/db.mjs --anon --query "SELECT ..."           # simula role anon
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const env = Object.fromEntries(
    (existsSync(join(root, ".env")) ? readFileSync(join(root, ".env"), "utf8") : "")
        .split("\n").filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const ref = new URL(env.VITE_SUPABASE_URL).hostname.split(".")[0];
const pw = env.SUPABASE_DB_PASSWORD;
const pooler = `postgresql://postgres.${ref}:${encodeURIComponent(pw)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
const direct = `postgresql://postgres:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`;

const args = process.argv.slice(2);
function opt(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
const file = opt("--file");
const query = opt("--query");
const asUid = opt("--as");
const anon = args.includes("--anon");

async function connect() {
    try { const c = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } }); await c.connect(); return c; }
    catch { const c = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } }); await c.connect(); return c; }
}

async function main() {
    const c = await connect();
    try {
        if (file) {
            const sql = readFileSync(join(root, file), "utf8");
            await c.query("BEGIN");
            try { await c.query(sql); await c.query("COMMIT"); console.log(`✓ aplicado: ${file}`); }
            catch (e) { await c.query("ROLLBACK"); throw e; }
            return;
        }
        if (query) {
            // Simulação de papel: precisa rodar tudo na mesma transação com SET LOCAL.
            if (asUid || anon) {
                await c.query("BEGIN");
                const role = anon ? "anon" : "authenticated";
                await c.query(`SET LOCAL role ${role}`);
                if (asUid) {
                    await c.query(`SELECT set_config('request.jwt.claims', $1, true)`,
                        [JSON.stringify({ sub: asUid, role: "authenticated" })]);
                    await c.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [asUid]);
                }
                try {
                    const r = await c.query(query);
                    console.log(JSON.stringify(r.rows, null, 2));
                    await c.query("ROLLBACK"); // leitura de teste, não persiste
                } catch (e) { await c.query("ROLLBACK"); console.error("ERRO (esperado?):", e.message); }
                return;
            }
            const r = await c.query(query);
            console.log(JSON.stringify(r.rows, null, 2));
            return;
        }
        console.error("Use --file ou --query. Veja o cabeçalho do arquivo.");
        process.exit(1);
    } finally { await c.end(); }
}
main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
