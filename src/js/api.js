// Shopify Storefront API Config
var STORE_NAME = 'frido-mothersday';
var API_TOKEN = '5066c93ec2ad8e04e39e35e859728f33';
var API_URL = `https://${STORE_NAME}.myshopify.com/api/2024-01/graphql.json`;

var REQUEST_BODY = JSON.stringify({
    query: '{ products(first: 6) { edges { node { id title description vendor priceRange { minVariantPrice { amount } } compareAtPriceRange { minVariantPrice { amount } } images(first: 1) { edges { node { url } } } variants(first: 10) { edges { node { id title availableForSale } } } } } } }'
});

async function fetchProducts() {
    var query = '{ products(first: 6) { edges { node { id title description vendor priceRange { minVariantPrice { amount } } compareAtPriceRange { minVariantPrice { amount } } images(first: 1) { edges { node { url } } } variants(first: 10) { edges { node { id title availableForSale } } } } } } }';

    try {
        var response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': API_TOKEN
        },
        body: REQUEST_BODY
    });

        var data = await response.json();

        if (data.errors) {
            document.getElementById('products-grid').innerHTML =
                '<p style="color:red;">API Error. Check console.</p>';
            console.error(data.errors);
            return [];
        }

        var products = [];
        for (var i = 0; i < data.data.products.edges.length; i++) {
            products.push(data.data.products.edges[i].node);
        }
        return products;
    } catch (err) {
        document.getElementById('products-grid').innerHTML =
            '<p style="color:red;">Network error. Check storeName and token.</p>';
        console.error(err);
        return [];
    }
}
