// template and state variables
var cardTemplate = '';
var productVariants = {};
var currentCardId = null;

// load card template
async function loadTemplate() {
    const res = await fetch('src/components/card.html');
    if (!res.ok) {
        throw new Error('Could not load card template: ' + res.status);
    }
    const html = await res.text();
    cardTemplate = html;
}

// build one card from template
function buildCard(product) {
    let price = Math.round(parseFloat(product.priceRange.minVariantPrice.amount));
    let comparePrice = price;
    if (product.compareAtPriceRange && product.compareAtPriceRange.minVariantPrice) {
        comparePrice = Math.round(parseFloat(product.compareAtPriceRange.minVariantPrice.amount));
    }

    let image = '';
    if (product.images.edges.length > 0) {
        image = product.images.edges[0].node.url;
    }

    let discount = 0;
    if (comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    let shortId = product.id.split('/').pop();
    productVariants[shortId] = product.variants.edges;

    let html = cardTemplate;
    html = html.replace(/{{id}}/g, shortId);
    html = html.replace(/{{title}}/g, product.title);
    html = html.replace(/{{description}}/g, product.description);
    html = html.replace(/{{image}}/g, image);
    html = html.replace(/{{salePrice}}/g, price);
    html = html.replace(/{{comparePrice}}/g, comparePrice);
    html = html.replace(/{{discount}}/g, discount);

    return html;
}

// render all products
function renderProducts(products) {
    let grid = document.getElementById('products-grid');
    let allCards = '';

    for (let i = 0; i < products.length; i++) {
        allCards += buildCard(products[i]);
    }

    grid.innerHTML = allCards;

    // hide 0% discount badges
    let badges = document.querySelectorAll('.discount-badge');
    for (let j = 0; j < badges.length; j++) {
        if (badges[j].textContent.indexOf('0%') === 0) {
            badges[j].style.display = 'none';
        }
    }
}

function showError(message) {
    document.getElementById('products-grid').innerHTML = '<p style="color:red; padding:20px;">' + message + '</p>';
}

// size modal
function openSizeModal(cardId) {
    currentCardId = cardId;
    let variants = productVariants[cardId];
    let sizeList = document.getElementById('size-list');
    let currentSize = document.getElementById('size-' + cardId).textContent;

    sizeList.innerHTML = '';

    for (let i = 0; i < variants.length; i++) {
        let v = variants[i].node;
        let btn = document.createElement('button');
        btn.className = 'size-btn';
        btn.textContent = v.title;

        if (!v.availableForSale) {
            btn.disabled = true;
        }

        if (currentSize === 'Size: ' + v.title) {
            btn.classList.add('selected');
        }

        btn.onclick = function() {
            document.getElementById('size-' + currentCardId).textContent = 'Size: ' + v.title;
            document.getElementById('size-' + currentCardId).classList.add('has-size');
            closeModal();
        };

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

function clearSize(cardId) {
    document.getElementById('size-' + cardId).textContent = 'Size: -';
    document.getElementById('size-' + cardId).classList.remove('has-size');
}

// add to cart
function addToCart(cardId, price) {
    let sizeText = document.getElementById('size-' + cardId).textContent;

    if (sizeText === 'Size: -') {
        document.getElementById('error-popup').style.display = 'flex';
        return;
    }

    let size = sizeText.replace('Size: ', '');

    console.log('Added to Cart - ');
    console.log('Size:', size);
    console.log('Price: ₹' + price);

    let btn = document.getElementById('cartbtn-' + cardId);
    btn.textContent = 'Added ✓';
    btn.style.background = '#10B981';
    btn.style.color = 'white';

    setTimeout(function () {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
        btn.style.color = '';
        clearSize(cardId);
    }, 2000);
}

// init
(async function init() {
    await loadTemplate();
    let products = await fetchProducts();
    if (products.length > 0) {
        renderProducts(products);
    } else {
        showError('No products found. Check API config in api.js');
    }
})();