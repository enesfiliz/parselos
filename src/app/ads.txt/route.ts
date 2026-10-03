const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export async function GET() {
  if (!adsenseClient) {
    return new Response(null, { status: 404 });
  }
  const publisherId = adsenseClient.replace(/^ca-/, "");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    },
  );
}
