/** SOMENTE LEITURA: corpo de RPCs sensíveis. Requer SUPABASE_DB_PASSWORD no .env. */
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
const FUNCS = ["get_usuarios_com_email","alterar_email_usuario","alterar_senha_usuario","mi_get_homenageado_memoria","mp_get_pessoa_publica"];
async function connect(){ try{const c=new pg.Client({connectionString:pooler,ssl:{rejectUnauthorized:false}});await c.connect();return c;}catch{const c=new pg.Client({connectionString:direct,ssl:{rejectUnauthorized:false}});await c.connect();return c;} }
const c = await connect();
try {
    const r = await c.query(`SELECT p.proname, pg_get_functiondef(p.oid) def, p.prosecdef sd
        FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname = ANY($1) ORDER BY p.proname;`, [FUNCS]);
    for (const f of r.rows){ console.log(`\n===== ${f.proname} ${f.sd?"[SECURITY DEFINER]":"[invoker]"} =====`); console.log(f.def); }
} finally { await c.end(); }
