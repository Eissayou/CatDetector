

export async function POST(req) {
    const imageBase64 = await req.json();
    console.log(imageBase64);
    return new Response("COCK")
}