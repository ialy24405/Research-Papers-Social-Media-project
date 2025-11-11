import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use service role key for server-side operations (like file uploads)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
	? createClient(supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	})
	: null;

// Regular client for client-side operations (if needed)
export const supabase = supabaseUrl && supabaseAnonKey
	? createClient(supabaseUrl, supabaseAnonKey)
	: null;
