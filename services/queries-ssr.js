import { createClient } from "@/supabase/server";

export async function GET__getUser() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();
	return { data, error };
}

export async function GET__getProfileByUserId() {
	const supabase = await createClient();
	let { data: profile, error } = await supabase.from("profiles").select("*");
	return { profile, error };
}
