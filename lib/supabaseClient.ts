
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
// You can find these in your Supabase project settings under "API"
const supabaseUrl = 'https://cufxoyqdkgdahmkaytgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZnhveXFka2dkYWhta2F5dGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzM2ODUsImV4cCI6MjA3ODIwOTY4NX0.If9LeR_8Tx66j2pn0u8PUcpXr6wu2mOaNVpacct_69Q';

 if (!supabaseUrl || supabaseUrl === 'https://cufxoyqdkgdahmkaytgr.supabase.co') {
   console.error("Supabase URL is not configured. Please add it to lib/supabaseClient.ts");
//   alert("Supabase is not configured. Please check the console for instructions.");
 }

 if (!supabaseAnonKey || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZnhveXFka2dkYWhta2F5dGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzM2ODUsImV4cCI6MjA3ODIwOTY4NX0.If9LeR_8Tx66j2pn0u8PUcpXr6wu2mOaNVpacct_69Q') {
     console.error("Supabase Anon Key is not configured. Please add it to lib/supabaseClient.ts");
//     alert("Supabase is not configured. Please check the console for instructions.");
 }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
