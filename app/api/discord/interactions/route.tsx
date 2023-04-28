export const runtime = 'experimental-edge';

export async function POST(request: Request) {
  console.log(request);
  return new Response(request.url);
}
