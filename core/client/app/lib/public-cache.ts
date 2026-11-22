// How long the public site keeps the backend's answers in Next's data cache.
//
// Every request that reaches the backend after it has been idle wakes the API
// (it scales to zero) and its Azure SQL free database, which then stays on for
// an hour and spends about 1,800 of the 100,000 free vCore-seconds a month,
// however short the visit. With a 60s window, visitors and crawlers spread over
// the day woke it several times a day and used up the month's allowance by
// the 17th. The dashboard expires these entries by tag when content or a post
// changes (lib/content-proxy.ts, api/posts), so edits still show up on the next
// visit; the window is only a safety net. Only 200 responses are cached: if the
// backend is down, the last good copy keeps being served.
export const PUBLIC_CACHE_SECONDS = 60 * 60 * 24 * 7;

// Tag of every public post read (the list and each article).
export const POSTS_TAG = "posts";
