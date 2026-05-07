// Template and state
var cardTemplate = '';
var productVariants = {};
var currentCardId = null;

// Load card template
function loadTemplate() {
    return fetch('src/components/card.html')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Could not load card template: ' + res.status);
            }
            return res.text();
        })
        .then(function (html) { cardTemplate = html; });
}

// Build one card from template
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

    var shortId = product.id.split('/').pop();
    productVariants[shortId] = product.variants.edges;

    var html = cardTemplate;
    html = html.replace(/{{id}}/g, shortId);
    html = html.replace(/{{title}}/g, product.title);
    html = html.replace(/{{description}}/g, product.description || product.vendor);
    html = html.replace(/{{image}}/g, image);
    html = html.replace(/{{salePrice}}/g, price);
    html = html.replace(/{{comparePrice}}/g, comparePrice);
    html = html.replace(/{{discount}}/g, discount);

    return html;
}

// Render all products
function renderProducts(products) {
    var grid = document.getElementById('products-grid');
    var allCards = '';

    for (var i = 0; i < products.length; i++) {
        allCards += buildCard(products[i]);
    }

    grid.innerHTML = allCards;

    // Hide 0% badges
    var badges = document.querySelectorAll('.discount-badge');
    for (var j = 0; j < badges.length; j++) {
        if (badges[j].textContent.indexOf('0%') === 0) {
            badges[j].style.display = 'none';
        }
    }
}

function showError(message) {
    document.getElementById('products-grid').innerHTML = '<p style="color:red; padding:20px;">' + message + '</p>';
}

// ─── Size Modal ───
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

        if (currentSize === 'Size: ' + v.title) {
            btn.classList.add('selected');
        }

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

document.getElementById('modal').onclick = function (e) {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
};

function closeErrorPopup() {
    document.getElementById('error-popup').style.display = 'none';
}

// ─── Add to Cart ───
function addToCart(cardId, price) {
    var sizeText = document.getElementById('size-' + cardId).textContent;

    if (sizeText === 'Size: -') {
        document.getElementById('error-popup').style.display = 'flex';
        return;
    }

    var size = sizeText.replace('Size: ', '');

    console.log('--- Added to Cart ---');
    console.log('Size:', size);
    console.log('Price: ₹' + price);
    console.log('---------------------');

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

// ─── Start ───
loadTemplate()
    .then(function () {
        return fetchProducts();  // fetchProducts comes from api.js
    })
    .then(function (products) {
        if (products.length > 0) {
            renderProducts(products);
        } else {
            showError('No products found. Check API config in api.js');
        }
    })
    .catch(function (err) {
        console.error(err);
        showError('Unable to load products. Check console for details.');
    });
