/**
 * SOMENTE LEITURA: dump de colunas das tabelas críticas + corpo das funções helper.
 * Requer SUPABASE_DB_PASSWORD no .env.
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

const TABLES = ["titulares","usuarios_app","titular_modulos","dependentes","recordacoes","parceiros","parceiro_modulos","parceiro_notificacoes","config_sistema","assinaturas","login_logs"];
const FUNCS = ["mi_can_access","mp_can_access","mp_parceiro_pode_acessar","mp_parceiro_do_usuario","mp_parceiro_do_contexto","get_parceiro_id","mi_user_titular_ids"];

async function connect() {
    try { const c = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } }); await c.connect(); return c; }
    catch { const c = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } }); await c.connect(); return c; }
}

async function main() {
    const c = await connect();
    try {
        console.log("=== COLUNAS DAS TABELAS CRÍTICAS ===");
        const cols = await c.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name = ANY($1)
            ORDER BY table_name, ordinal_position;`, [TABLES]);
        let t = "";
        for (const r of cols.rows) {
            if (r.table_name !== t) { console.log(`\n── public.${r.table_name} ──`); t = r.table_name; }
            console.log(`  ${r.column_name} : ${r.data_type}${r.is_nullable === "NO" ? " NOT NULL" : ""}`);
        }

        console.log("\n\n=== FUNÇÕES HELPER (definição) ===");
        const fns = await c.query(`
            SELECT p.proname, pg_get_functiondef(p.oid) AS def, p.prosecdef AS security_definer
            FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
            WHERE n.nspname='public' AND p.proname = ANY($1)
            ORDER BY p.proname;`, [FUNCS]);
        for (const r of fns.rows) {
            console.log(`\n── ${r.proname}  ${r.security_definer ? "[SECURITY DEFINER]" : "[invoker]"} ──`);
            console.log(r.def);
        }
    } finally { await c.end(); }
}
main().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
