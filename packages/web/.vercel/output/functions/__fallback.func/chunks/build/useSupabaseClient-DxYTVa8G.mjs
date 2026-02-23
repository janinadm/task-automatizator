import { u as useNuxtApp } from './server.mjs';

const useSupabaseClient = () => {
  return useNuxtApp().$supabase.client;
};

export { useSupabaseClient as u };
//# sourceMappingURL=useSupabaseClient-DxYTVa8G.mjs.map
