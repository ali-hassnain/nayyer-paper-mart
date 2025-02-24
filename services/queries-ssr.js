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

// export async function GET__getProfileByHandle(handle) {
//   const supabase = await createClient();
//   const { data: profile, error } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("username_handle", handle)
//     .single();
//   return { profile, error };
// }

// export async function GET__getPhotos(
//   rangeStart = 0,
//   rangeEnd = 8,
//   filters = {}
// ) {
//   const supabase = await createClient();
//   let query = supabase
//     .from("photos")
//     .select("*, author(*)", { count: "exact" })
//     .range(rangeStart, rangeEnd)
//     .order("created_at", { ascending: false });
//   if (filters && typeof filters === "object") {
//     for (const [key, value] of Object.entries(filters)) {
//       if (Array.isArray(value)) {
//         const [operator, filterValue] = value;
//         query = query[operator](key, filterValue);
//       } else {
//         query = query.eq(key, value);
//       }
//     }
//   }
//   const { data: photos, count, error } = await query;
//   return { photos, count, error };
// }

// export async function GET__getPhotoById(id) {
//   const supabase = await createClient();
//   const { data: photo, error } = await supabase
//     .from("photos")
//     .select("*, author(*)")
//     .eq("id", id)
//     .single();
//   return { photo, error };
// }

// export async function GET__getUserLikeStatusForPhoto(userId, photoId) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("likes")
//     .select("*")
//     .eq("user", userId)
//     .eq("photo", photoId)
//     .single();
//   if (error && error.code !== "PGRST116") {
//     return { data: `User like not found`, error };
//   }
//   return { data, error };
// }
