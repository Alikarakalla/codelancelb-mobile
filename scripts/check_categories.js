const https = require('https');

https.get('https://sadekabdelsater.com/api/v1/categories?limit=100', {
    headers: { 'X-API-Key': 'sk_FSpr2GMoJ9MUrQ1jFNbM8hjpLAhAINC3ggfcBzCOI7Elglem' }
}, (resp) => {
    let data = '';

    resp.on('data', (chunk) => { data += chunk; });

    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            const categories = Array.isArray(json) ? json : json.data;

            function find(cats, path = '') {
                cats.forEach(c => {
                    const currentPath = path ? `${path} > ${c.name}` : c.name;
                    const lower = c.name.toLowerCase();

                    if (lower.includes('men') || lower.includes('perfume') || lower.includes('fragrance')) {
                        console.log(`MATCH: "${c.name}" (ID: ${c.id}) @ ${currentPath}`);
                    }

                    if (c.sub_categories) find(c.sub_categories, currentPath);
                    if (c.sub_sub_categories) find(c.sub_sub_categories, currentPath);
                });
            }

            console.log(`Total Root Categories: ${categories.length}`);
            console.log('--- Searching for Men/Perfume/Fragrance ---');
            find(categories);
            console.log('--- Root Category Names ---');
            console.log(categories.map(c => c.name).join(', '));

        } catch (e) { console.error(e); }
    });
}).on("error", (err) => { console.log("Error: " + err.message); });
