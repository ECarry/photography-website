addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  if (!path.startsWith('/img/')) {
    return new Response('Not found', { status: 404 })
  }

  // Find the start of the image URL (which should be https://)
  const imageUrlStartIndex = path.indexOf('https://')
  if (imageUrlStartIndex === -1) {
    return new Response('Invalid image URL', { status: 400 })
  }

  // Extract params and image URL
  const params = path.substring(5, imageUrlStartIndex - 1) // from after /img/ to before /https://
  const imageUrl = path.substring(imageUrlStartIndex)

  const cfUrl = `https://gallery.tahmidul612.com/cdn-cgi/image/${params}/${imageUrl}`

  const imageRequest = new Request(cfUrl, {
    headers: request.headers
  })

  return fetch(imageRequest)
}
