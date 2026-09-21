/** @type {import('next').NextConfig} */
const nextConfig = {
  // Baseline hardening headers. None of this replaces the real auth model
  // (middleware + RLS + server-side role re-checks) -- it just closes off
  // a few generic browser-level attack surfaces (clickjacking, MIME
  // sniffing, leaking full URLs via Referer) that cost nothing to close.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
