/**
 * Consulta SOMENTE LEITURA das políticas de RLS do banco Supabase.
 * Requer SUPABASE_DB_PASSWORD (ou DATABASE_URL) no .env.
 * Dashboard → Project Settings → Database → Database password.
 *
 * Uso:
 *   node scripts/check-rls.mjs           # todos os schemas de usuário
 *   node scripts/check-rls.mjs public    # filtra por schema
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
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
const schemaFilter = process.argv[2] || null;

if (!supabaseUrl && !env.DATABASE_URL) {
    console.error("Falta VITE_SUPABASE_URL no .env");
    process.exit(1);
}
if (!dbPassword && !env.DATABASE_URL) {
    console.error(
        "Falta SUPABASE_DB_PASSWORD no .env\n" +
            "Pegue em: Supabase Dashboard → Project Settings → Database → Database password"
    );
    process.exit(1);
}

const ref = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : null;
const pooler = `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
const direct = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;

async function connect() {
    const first = env.DATABASE_URL || pooler;
    try {
        const c = new pg.Client({ connectionString: first, ssl: { rejectUnauthorized: false } });
        await c.connect();
        return c;
    } catch (err) {
        if (env.DATABASE_URL) throw err;
        console.log("Pooler falhou, tentando conexão direta...");
        const c = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } });
        await c.connect();
        return c;
    }
}

const schemaClause = schemaFilter
    ? `AND n.nspname = '${schemaFilter.replace(/'/g, "''")}'`
    : `AND n.nspname NOT IN ('pg_catalog','information_schema','pg_toast')`;

async function main() {
    const client = await connect();
    console.log("Conectado.\n");
    try {
        // 1) Status RLS por tabela
        const tables = await client.query(`
            SELECT n.nspname AS schema, c.relname AS tabela,
                   c.relrowsecurity AS rls_ligado,
                   c.relforcerowsecurity AS rls_forcado,
                   COALESCE(p.n, 0) AS qtd_policies
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            LEFT JOIN (
                SELECT schemaname, tablename, COUNT(*) n
                FROM pg_policies GROUP BY 1,2
            ) p ON p.schemaname = n.nspname AND p.tablename = c.relname
            WHERE c.relkind = 'r' ${schemaClause}
            ORDER BY 1, 2;
        `);

        console.log("=== STATUS RLS POR TABELA ===");
        for (const r of tables.rows) {
            const flag = r.rls_ligado ? "ON " : "OFF";
            const warn = !r.rls_ligado && Number(r.qtd_policies) === 0 ? "  ⚠ sem RLS e sem policy" : "";
            console.log(
                `[${flag}] ${r.schema}.${r.tabela}  (policies: ${r.qtd_policies}${r.rls_forcado ? ", FORCE" : ""})${warn}`
            );
        }

        // 2) Detalhe das políticas
        const pols = await client.query(`
            SELECT n.nspname AS schema, pol.tablename, pol.policyname,
                   pol.cmd, pol.permissive, pol.roles, pol.qual, pol.with_check
            FROM pg_policies pol
            JOIN pg_namespace n ON n.nspname = pol.schemaname
            WHERE TRUE ${schemaClause}
            ORDER BY 1, 2, 3;
        `);

        console.log(`\n=== POLÍTICAS (${pols.rows.length}) ===`);
        let currentTable = "";
        for (const p of pols.rows) {
            const key = `${p.schema}.${p.tablename}`;
            if (key !== currentTable) {
                console.log(`\n── ${key} ──`);
                currentTable = key;
            }
            console.log(`  • ${p.policyname} [${p.cmd}] ${p.permissive} roles=${p.roles}`);
            if (p.qual) console.log(`      USING: ${p.qual}`);
            if (p.with_check) console.log(`      WITH CHECK: ${p.with_check}`);
        }
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error("Erro:", err.message);
    process.exit(1);
});
