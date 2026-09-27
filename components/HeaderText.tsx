import { createClient } from "@/lib/supabase/server";
import { isHeaderStyle, HEADER_STYLE_CLASS, type HeaderStyle } from "@/lib/data/headerStyles";

// Drop-in replacement for the plain <h1 className="font-mono ... text-white">
// wordmark headers used across the marketing/app pages (homepage "XRILL",
// "ABOUT XRILL", "XRILL ANALYTICS", journal/glossary/playbook titles, etc).
// Reads the signed-in user's header_style preference (set on /account,
// profiles.header_style) and renders the matching treatment -- defaults to
// plain white for signed-out visitors and anyone who hasn't picked one, so
// this is a purely additive, opt-in effect. Fetches its own data (one
// extra profiles lookup per page) so swapping a header into this component
// is a one-line change wherever it's used, rather than threading the
// preference through every page's props. The actual style classes live in
// lib/data/headerStyles.ts (HEADER_STYLE_CLASS) so the Account Settings
// picker can preview the exact same treatment.
export default async function HeaderText({
  as: Tag = "h1",
  className = "",
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
}) {
  let style: HeaderStyle = "white";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("header_style")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.header_style && isHeaderStyle(data.header_style)) {
      style = data.header_style;
    }
  }

  return <Tag className={`${className} ${HEADER_STYLE_CLASS[style]}`}>{children}</Tag>;
}
