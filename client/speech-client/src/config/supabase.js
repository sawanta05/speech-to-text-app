import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oegcvtlrczdnvnkozsra.supabase.co";
const supabaseKey = "sb_publishable_qeBagI9KFKL8VmzIfUhF7Q_dFCti_ft";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);