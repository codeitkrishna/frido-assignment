// Config
var CONFIG = {
    storeName: 'frido-mothersday',
    token: '5066c93ec2ad8e04e39e35e859728f33'
};

var cardTemplate = '';
var productVariants = {};  // { productId: [variants] }

async function loadTemplate() {
    const response = await fetch('card.html');
    const html = await response.text();
    cardTemplate = html;
}

async function fetchProducts() {
    var url = 'https://' + CONFIG.storeName + '.myshopify.com/api/2024-01/graphql.json';

    var query = '{ products(first: 6) { edges { node { id title description vendor priceRange { minVariantPrice { amount } } compareAtPriceRange { minVariantPrice { amount } } images(first: 1) { edges { node { url } } } variants(first: 10) { edges { node { id title availableForSale } } } } } } }';

    try {
        var response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': CONFIG.token
            },
            body: JSON.stringify({ query: query })
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

// build one card from the template
function buildCard(product) {
    var price = Math.round(parseFloat(product.priceRange.minVariantPrice.amount));
    var comparePrice = price;
    if (product.compareAtPriceRange && product.compareAtPriceRange.minVariantPrice) {
        comparePrice = Math.round(parseFloat(product.compareAtPriceRange.minVariantPrice.amount));
    }

    var image = '';
    if (product.images.edges.length > 0) {
        image = product.images.edges[0].node.url;
    }

    var discount = 0;
    if (comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    // short id for use in HTML ids
    var shortId = product.id.split('/').pop();

    // save variants for later
    productVariants[shortId] = product.variants.edges;

    // replace placeholders
    var html = cardTemplate;
    html = html.replace(/{{id}}/g, shortId);
    html = html.replace(/{{title}}/g, product.title);
    html = html.replace(/{{vendor}}/g, product.description || product.vendor);
    html = html.replace(/{{image}}/g, image);
    html = html.replace(/{{salePrice}}/g, price);
    html = html.replace(/{{comparePrice}}/g, comparePrice);
    html = html.replace(/{{discount}}/g, discount);

    return html;
}

// render products into grid
function renderProducts(products) {
    var grid = document.getElementById('products-grid');
    var allCards = '';

    for (var i = 0; i < products.length; i++) {
        allCards += buildCard(products[i]);
    }

    grid.innerHTML = allCards;

    // After rendering, hide badges where discount is 0
    var badges = document.querySelectorAll('.discount-badge');
    for (var j = 0; j < badges.length; j++) {
        if (badges[j].textContent.indexOf('0%') === 0) {
            badges[j].style.display = 'none';
        }
    }
}


// size modal
var currentCardId = null;

function openSizeModal(cardId) {
    currentCardId = cardId;
    var variants = productVariants[cardId];
    var sizeList = document.getElementById('size-list');
    var currentSize = document.getElementById('size-' + cardId).textContent;

    sizeList.innerHTML = '';

    for (var i = 0; i < variants.length; i++) {
        var v = variants[i].node;
        var btn = document.createElement('button');
        btn.className = 'size-btn';
        btn.textContent = v.title;

        if (!v.availableForSale) {
            btn.disabled = true;
        }

        // highlight if size already selected
        if (currentSize === 'Size: ' + v.title) {
            btn.classList.add('selected');
        }

        // use a closure so each button remembers its own size
        btn.onclick = (function (sizeName) {
            return function () {
                document.getElementById('size-' + currentCardId).textContent = 'Size: ' + sizeName;
                document.getElementById('size-' + currentCardId).classList.add('has-size');
                closeModal();
            };
        })(v.title);

        sizeList.appendChild(btn);
    }

    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentCardId = null;
}

// close modal when clicking outside
document.getElementById('modal').onclick = function (e) {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
};

function addToCart(cardId, price) {
    var sizeText = document.getElementById('size-' + cardId).textContent;

    if (sizeText === 'Size: -') {
        alert('Please select a size first!');
        return;
    }

    var size = sizeText.replace('Size: ', '');

    console.log('Added to Cart, ' + ' Size: ' + size + ' Price: ' + price);

    var btn = document.getElementById('cartbtn-' + cardId);
    btn.textContent = 'Added ✓';
    btn.style.background = '#10B981';
    btn.style.color = 'white';

    setTimeout(function () {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);
}

(async function init() {
    await loadTemplate();
    var products = await fetchProducts();
    if (products.length > 0) renderProducts(products);
})();
