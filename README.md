# Frido Shopify Product Grid

This task displays products from the Shopify Storefront API in a responsive product grid.

## Features

- Fetches products from Shopify
- Shows product image, title, description, discount, original price and sale price
- Opens a size modal using product variants
- Shows the selected size on the card
- Error pop up if size not selected and clicked Add to Cart
- Works on desktop, tablet and mobile

## Files

- `index.html` - main page
- `src/components/card.html` - single reusable product card template
- `src/js/api.js` - fetch product details from Shopify StoreFront API
- `src/js/app.js` - product display and modal logic
- `src/css/style.css` - page and card styling
- `src/css/modal.css` - modal styling
- `assets/cover.jpg` - header bg image

### Sample API Response
 
Below is a sample response from the Storefront API (fetched from Postman):
 
```json
{
    "data": {
        "products": {
            "edges": [
                {
                    "node": {
                        "id": "gid://shopify/Product/9716097482982",
                        "title": "Frido Women's Arch Comfort Sandals",
                        "vendor": "Frido",
                        "description": "Built-In Arch Support",
                        "priceRange": {
                            "minVariantPrice": {
                                "amount": "1999.0"
                            }
                        },
                        "compareAtPriceRange": {
                            "minVariantPrice": {
                                "amount": "3000.0"
                            }
                        },
                        "images": {
                            "edges": [
                                {
                                    "node": {
                                        "url": "https://cdn.shopify.com/s/files/1/0804/5333/7318/files/ACS-01A_fffb79a9-76b8-4629-893a-6868375e763c_jpg.webp?v=1778082883"
                                    }
                                }
                            ]
                        },
                        "variants": {
                            "edges": [
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706273510",
                                        "title": "3",
                                        "availableForSale": true
                                    }
                                },
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706306278",
                                        "title": "4",
                                        "availableForSale": true
                                    }
                                },
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706339046",
                                        "title": "5",
                                        "availableForSale": true
                                    }
                                },
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706371814",
                                        "title": "6",
                                        "availableForSale": true
                                    }
                                },
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706404582",
                                        "title": "7",
                                        "availableForSale": true
                                    }
                                },
                                {
                                    "node": {
                                        "id": "gid://shopify/ProductVariant/47632706437350",
                                        "title": "8",
                                        "availableForSale": true
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }
    },
    "extensions": {
        "cost": {
            "requestedQueryCost": 55
        }
    }
}
```