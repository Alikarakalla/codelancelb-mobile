// Converts CMS-supplied URLs (from carousels, banners, category cards) into
// in-app Expo Router targets so taps stay inside the app instead of bouncing
// to Safari. The CMS stores absolute URLs like
//   https://lebazone.shop/lb/en/shop?category=shoes
// or relative paths like
//   /lb/en/product/atletico-madrid-2026-27
// — both of which must round-trip to mobile routes.

export interface InternalRoute {
    pathname: string;
    params?: Record<string, string>;
}

const APP_HOSTS = new Set([
    'lebazone.shop',
    'www.lebazone.shop',
    'staging.lebazone.shop',
]);

// Locale segments that appear before the meaningful path on the web
// (e.g. /lb/en/shop, /us/ar/product/...). Strip them when normalizing.
const LOCALE_LIKE = /^[a-z]{2}$/i;

function stripLeadingLocale(parts: string[]): string[] {
    // Drop up to two leading 2-letter segments (country + language).
    let i = 0;
    while (i < 2 && parts[i] && LOCALE_LIKE.test(parts[i])) {
        i++;
    }
    return parts.slice(i);
}

function paramsFromQuery(search: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!search) return out;
    const trimmed = search.startsWith('?') ? search.slice(1) : search;
    for (const pair of trimmed.split('&')) {
        if (!pair) continue;
        const [rawKey, rawVal = ''] = pair.split('=');
        try {
            out[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
        } catch {
            out[rawKey] = rawVal;
        }
    }
    return out;
}

/**
 * Resolve a CMS URL to an internal Expo Router route, or `null` if it points
 * to an external domain we can't open in-app.
 */
export function resolveInternalUrl(rawUrl: string | null | undefined): InternalRoute | null {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();
    if (!url || url === '#') return null;

    // Quick path: relative URL (`/lb/en/shop`).
    let pathOnly = '';
    let search = '';
    if (url.startsWith('/')) {
        const queryIndex = url.indexOf('?');
        pathOnly = queryIndex === -1 ? url : url.slice(0, queryIndex);
        search = queryIndex === -1 ? '' : url.slice(queryIndex);
    } else if (/^https?:\/\//i.test(url)) {
        try {
            const parsed = new URL(url);
            if (!APP_HOSTS.has(parsed.hostname.toLowerCase())) {
                // External link — caller decides whether to open it via Linking.
                return null;
            }
            pathOnly = parsed.pathname;
            search = parsed.search;
        } catch {
            return null;
        }
    } else {
        // Bare slug or unsupported scheme.
        pathOnly = '/' + url.replace(/^\/+/, '');
    }

    const queryParams = paramsFromQuery(search);
    const parts = stripLeadingLocale(
        pathOnly.split('/').filter(Boolean)
    );
    const root = (parts[0] || '').toLowerCase();
    const next = parts[1];

    switch (root) {
        case '':
            // Root URL — drop user on the home tab.
            return { pathname: '/(tabs)' };

        case 'shop':
        case 'products':
        case 'catalog': {
            const params: Record<string, string> = {};
            // Web ?category=slug and ?brand=slug → mobile filter params (slug-based).
            if (queryParams.category) params.category = queryParams.category;
            if (queryParams.brand) params.brand = queryParams.brand;
            if (queryParams.search) params.search = queryParams.search;
            if (queryParams.sort) params.sort = queryParams.sort;
            return { pathname: '/shop', params };
        }

        case 'category':
        case 'categories':
            // /category/shoes → dedicated category page. If the category has subcategories
            // it'll show them; otherwise the page redirects to a filtered shop view.
            return next
                ? { pathname: '/category/[slug]', params: { slug: next } }
                : { pathname: '/shop' };

        case 'brand':
        case 'brands':
            return next
                ? { pathname: '/shop', params: { brand: next } }
                : { pathname: '/shop' };

        case 'collection':
        case 'collections':
            return next
                ? { pathname: '/collection/[slug]', params: { slug: next } }
                : { pathname: '/shop' };

        case 'product':
            return next
                ? { pathname: '/product/[id]', params: { id: next } }
                : { pathname: '/shop' };

        case 'wishlist':
            return { pathname: '/(tabs)/wishlist' as any };

        case 'cart':
            return { pathname: '/cart' };

        case 'checkout':
            return { pathname: '/checkout' };

        case 'profile':
        case 'account':
            return { pathname: '/(tabs)/profile' as any };

        case 'login':
            return { pathname: '/login' };

        case 'register':
        case 'signup':
            return { pathname: '/signup' };

        default:
            // Unknown internal path — safest fallback is the shop tab so the
            // tap still does *something* useful in-app.
            return { pathname: '/shop' };
    }
}
