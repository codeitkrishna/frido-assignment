const CONFIG = {
    storeName: 'frido-mothersday',
    token: '5066c93ec2ad8e04e39e35e859728f33'
};

let cardTemplate = null;
let selectedSize = null;
let currentPrice = 0;

async function loadCardTemplate() {
    const response = await fetch('card.html');
    const html = await response.text();

    const parser = new DOMParser();
    const page = parser.parseFromString(html, 'text/html');

    cardTemplate = page.querySelector('.product-card');
}

async function fetchProducts() {
    const url = `https://${CONFIG.storeName}.myshopify.com/api/2024-01/graphql.json`;

    const query = `{
        products(first: 6) {
            edges {
                node {
                    id
                    title
                    vendor
                    priceRange {
                        minVariantPrice { amount }
                    }
                    compareAtPriceRange {
                        minVariantPrice { amount }
                    }
                    images(first: 1) {
                        edges {
                            node { url }
                        }
                    }
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                availableForSale
                            }
                        }
                    }
                }
            }
        }
    }`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': CONFIG.token
            },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Shopify error:', data.errors);
            showError('Could not load products. Check your storeName and token in script.js');
            return [];
        }

        const productEdges = data.data.products.edges;
        const products = [];

        for (let i = 0; i < productEdges.length; i++) {
            products.push(productEdges[i].node);
        }

        return products;
    } catch (error) {
        console.error('Network error:', error);
        showError('Network error. Check your storeName and token in script.js');
        return [];
    }
}

function buildCard(product) {
    const card = cardTemplate.cloneNode(true);

    const price = parseFloat(product.priceRange.minVariantPrice.amount);

    let comparePrice = price;
    if (product.compareAtPriceRange && product.compareAtPriceRange.minVariantPrice) {
        comparePrice = parseFloat(product.compareAtPriceRange.minVariantPrice.amount);
    }

    let image = '';
    if (product.images.edges.length > 0) {
        image = product.images.edges[0].node.url;
    }

    let discount = 0;
    if (comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    const variants = product.variants.edges;

    const imageElement = card.querySelector('[data-field="image"]');
    const titleElement = card.querySelector('[data-field="title"]');
    const vendorElement = card.querySelector('[data-field="vendor"]');
    const originalPriceElement = card.querySelector('[data-field="original-price"]');
    const salePriceElement = card.querySelector('[data-field="sale-price"]');
    const badgeElement = card.querySelector('[data-field="badge"]');
    const cartButton = card.querySelector('[data-field="cart-btn"]');

    imageElement.src = image;
    imageElement.alt = product.title;
    titleElement.textContent = product.title;
    vendorElement.textContent = product.vendor;
    originalPriceElement.textContent = `₹${Math.round(comparePrice)}`;
    salePriceElement.textContent = `₹${Math.round(price)}`;

    if (discount > 0) {
        badgeElement.textContent = `${discount}% OFF`;
    } else {
        badgeElement.style.display = 'none';
    }

    cartButton.addEventListener('click', function () {
        openSizeModal(variants, price);
    });

    return card;
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const card = buildCard(product);
        grid.appendChild(card);
    }
}

function showError(message) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `<p style="color:red; padding:20px;">${message}</p>`;
}
function showErrorSize(message) {
    const grid = document.getElementById('error-msg');
    grid.innerHTML = `<p style="color:red; padding:20px;">${message}</p>`;
}

function clearErrorSize() {
    const grid = document.getElementById('error-msg');
    grid.innerHTML = '';
}

function openSizeModal(variants, price) {
    currentPrice = price;
    selectedSize = null;
    clearErrorSize();

    const sizeList = document.getElementById('size-list');
    sizeList.innerHTML = '';

    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i].node;
        const button = document.createElement('button');

        button.className = 'size-btn';
        button.textContent = variant.title;
        button.disabled = !variant.availableForSale;

        button.addEventListener('click', function () {
            const isAlreadySelected = button.classList.contains('selected');
            const allButtons = sizeList.querySelectorAll('.size-btn');

            for (let j = 0; j < allButtons.length; j++) {
                allButtons[j].classList.remove('selected');
            }

            if (isAlreadySelected) {
                selectedSize = null;
                return;
            }

            button.classList.add('selected');
            selectedSize = variant.title;
            clearErrorSize();
        });

        sizeList.appendChild(button);
    }

    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    selectedSize = null;
    clearErrorSize();
}

function addToCart() {
    if (!selectedSize) {
        showErrorSize('Please select a size first');
        return;
    }

    console.log('=== ADD TO CART ===');
    console.log('Size:', selectedSize);
    console.log('Price: ₹' + Math.round(currentPrice));
    console.log('===================');

    const addButton = document.getElementById('add-btn');
    addButton.textContent = 'ADDED ✓';
    addButton.style.background = '#10B981';
    addButton.style.color = 'white';

    setTimeout(function () {
        closeModal();
        addButton.textContent = 'ADD TO CART';
        addButton.style.background = '';
        addButton.style.color = '';
    }, 2000);
}

document.getElementById('modal').addEventListener('click', function (event) {
    if (event.target === this) {
        closeModal();
    }
});

async function init() {
    await loadCardTemplate();

    const products = await fetchProducts();

    if (products.length > 0) {
        renderProducts(products);
    }
}

init();
