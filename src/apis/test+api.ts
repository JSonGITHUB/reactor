export function GET(request: Request) {
    console.log('!!!!')
    return new Response(JSON.stringify({ hello: 'world' }), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}