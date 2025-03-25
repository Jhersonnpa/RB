export const prerender = false;
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Definida" : "No definida");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan las variables de entorno de Supabase.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST({ request }: { request: Request }) {
  try {
    const userData = await request.json();

    const { ip, city, country } = userData;

    if (!ip || !city || !country) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
    }

     // 🔍 Buscar si la IP ya existe en la tabla
     const { data: existing, error: searchError } = await supabase
     .from("Click_whatsap")
     .select("id, clicks")
     .eq("ip", ip)
     .maybeSingle(); // Retorna un solo registro o null

   if (searchError) throw searchError;

   if (existing) {
     // 🔄 Si la IP existe, actualizar el campo (ejemplo: incrementar "clicks")
     const { data, error } = await supabase
       .from("Click_whatsap")
       .update({ clicks: existing.clicks + 1, last_access: new Date().toISOString() })
       .eq("id", existing.id)
       .select();

     if (error) throw error;

     return new Response(JSON.stringify({ message: "IP actualizada", data }), { status: 200 });
   }

    const { data, error } = await supabase
      .from("Click_whatsap")
      .insert([{ ip, city, country }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error("Error en la API:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
