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
