// Estos dos valores los obtienes en Supabase:
// Project Settings -> API (o "Connect")
// La "anon key" (publishable) está pensada para ser pública: NO es una contraseña.
// La seguridad real la dan las políticas RLS y el login.
// NUNCA pongas aquí la "service_role key" (esa sí es secreta).

const SUPABASE_URL = "https://jfernnnxrlizojvdqhch.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXJubm54cmxpem9qdmRxaGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODA4NjQsImV4cCI6MjEwNzE1Njg2NH0.XWLowbFLEVfgrPM-O1YIWVf2xONyg2w-opCjmaccBZw";

// Llave PÚBLICA para las notificaciones (Web Push). Es pública a propósito:
// la privada vive solo en los secretos de Supabase (ver supabase/AVISOS.md).
const VAPID_PUBLICA = "BGLxsfcoIpEnZGisiYk4T1cgYR6ybyxWthvOcEbRtm717FGpeDgAwrcDbqWRfSwJYUZggBvtd3k3adqGNJKZLSo";
