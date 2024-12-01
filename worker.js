// Cloudflare Worker Script to make request to the Riot Games API
// By: BangingHeads


// Edited by Yimikami for Lolchi (https://github.com/Yimikami/lolchi)

// Your Riot Games API Key
const API_KEY = 'YOUR API KEY';

// Time in seconds to cache responses
// You may want lower or higher depending on how real time you need info
const CACHE_TIME = 600;

// Array of origins allowed, use ["*"] for all origins
// or full domain https://www.google.com
const ALLOWED_ORIGINS = ["*"];

// Don't modify below unless you know what you are doing

// Creates URL Query string from Object p1=1&p2=2
const createQueryParams = params => 
      Object.keys(params)
            .map(k => `${k}=${encodeURI(params[k])}`)
            .join('&');

async function handleRequest(request) {
  const url = new URL(request.url);



  // Reject unauthorized origins to avoid wasting API Calls
  if (request.headers.get('Origin') !== null && request.headers.get('Origin') !== url.origin && !ALLOWED_ORIGINS.includes(request.headers.get('Origin')) && !ALLOWED_ORIGINS.includes("*")) {
    return new Response("{'error': 'Origin not allowed'}", null);
  }

  // Determine the endpoint based on the path
  let endpoint = '';
  const pathSegments = url.pathname.split('/');

  if (pathSegments.length > 3) {
    switch (pathSegments[2]) {
      case 'account':
        endpoint = `/riot/account/v1/accounts/by-riot-id/${pathSegments[4]}/${pathSegments[5]}`;
        break;
      case 'summoner':
        endpoint = `/lol/summoner/v4/summoners/by-puuid/${pathSegments[4]}`;
        break;
      case 'ranked':
        endpoint = `/lol/league/v4/entries/by-summoner/${pathSegments[4]}`;
        break;
      case 'matches':
        endpoint = `/lol/match/v5/matches/by-puuid/${pathSegments[4]}/ids`;
        break;
      case 'match':
        endpoint = `/lol/match/v5/matches/${pathSegments[4]}`;
        break;
      case 'spectator':
        endpoint = `/lol/spectator/v5/active-games/by-summoner/${pathSegments[4]}`;
        break;
    }
  }

  if (endpoint === '') {
    return new Response('{"error": "Invalid endpoint"}', { status: 400 });
  }

  // Extract the region from the path segments
  let region = pathSegments[3];

  if (!region || region === '') {
    return new Response('{"error": "Missing region"}', { status: 400 });
  }

  // Construct the full URL with the region
  let fullUrl = `https://${region}.api.riotgames.com${endpoint}`;


  // Add leftover get parameters
  const getParams = {};
  for (const [key, value] of url.searchParams) {
    if (!['region'].includes(key)) {
      getParams[key] = value;
    }
  }
  let reqParams = createQueryParams(getParams);

  if (reqParams !== "") {
    fullUrl = `${fullUrl}?${reqParams}`;
  }

  const riotRequest = new Request(fullUrl, request);
  riotRequest.headers.set('X-Riot-Token', API_KEY);
  let response = await fetch(riotRequest, {
    cf: {
      cacheTtl: CACHE_TIME,
      cacheEverything: true,
    }
  });

  // Recreate the response so we can modify the headers
  response = new Response(response.body, response);

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', request.headers.get('Origin'));

  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append('Vary', 'Origin');

  return response;
}

// Handle Pre-flight OPTIONS calls for CORS
function handleOptions(request) {
  let headers = request.headers;
  let origin = "";
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    if (ALLOWED_ORIGINS.includes(headers.get('Origin')) || ALLOWED_ORIGINS.includes("*")) {
      origin = headers.get('Origin');
    }
    // Handle CORS pre-flight request.
    let respHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, OPTIONS',
      },
    });
  }
}

// Handle incoming requests
addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      event.respondWith(handleOptions(request));
    } else if (request.method === 'GET' || request.method === 'HEAD') {
      // Handle requests to the API server
      event.respondWith(handleRequest(request));
    } else {
      event.respondWith(
        new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      );
    }
  } else {
    event.respondWith(handleRequest(request));
  }
});
