export function GET(request: Request) {
    console.log('!!!!')
    return Response.json({hello: 'world'})
}