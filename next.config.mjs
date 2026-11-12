/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { optimizePackageImports: ["lucide-react", "recharts"] },
  // بستهٔ دسکتاپ از این خروجی استفاده می‌کند
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["./prisma/**/*"],
  },
};

export default nextConfig;
