let limit = 10;
const productsApiEndpoint = 'https://fakestoreapi.com/products';
let productData = [];
let isRerendered = false;
let categoryEvent;
let loading = false;
let showMobileNavigationMenu = false;
let filterSelections = [];

function getApiQuery(isLoadMore) {
    if (isLoadMore) {
        limit = limit + 10;
        isRerendered = true
        return `${productsApiEndpoint}?limit=${limit}`
    }

    return `${productsApiEndpoint}?limit=${limit}`;
}

const fetchProducts = async (endpoint) => {
    loader(true);
    if (endpoint) {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            loader(false);
            return data;
        } catch (err) {
            loader(false);
            const errorElement = document.getElementById('error');
            errorElement.style.display = 'block';
            errorElement.textContent = `Something went wrong`;
        }
    }
};

window.addEventListener('load', async () => {
    productData = await fetchProducts(getApiQuery());
    populateCategoryFilter(productData);
    renderProductCard(productData);
});

document.body.addEventListener('click', async function (event) {
    if (event.target.id == 'load-more') {
        productData = await fetchProducts(getApiQuery(true));
        populateCategoryFilter(productData);
        renderProductCard(productData);
    };
    if(showMobileNavigationMenu) {
        const navigationIcon = document.getElementById('mobile-navigations');
        showMobileNavigationMenu = !showMobileNavigationMenu;
        navigationIcon.style.display = 'none';
    }
});

function loader(flag) {
    const loaderElement = document.getElementById('loader');
    const container = document.getElementById('card-container-id');

    if(flag) {
        loaderElement.style.display = 'block';
        container.style.justifyContent = 'center';
        container.style.alignContent = 'center';
    }

    if(!flag) {
        loaderElement.style.display = 'none';
        if(window.innerWidth >= 600) {
            container.style.justifyContent = 'unset';
        }
        container.style.alignContent = 'unset';
    }
}

function onSearch(event) {
    let searchQuery = event.target.value;
    let searchErrorElement;
    if(window.innerWidth > 767) {
        searchErrorElement = document.getElementById('search-error');
    } else {
        searchErrorElement = document.getElementById('error');
    }
    if (searchQuery) {
        let filteredProducts = productData?.filter(product => {
            const { title } = product;
            if (title.toLowerCase().includes(searchQuery.toLowerCase())) {
                removeAllNodes();
                return product;
            }
        });
        if (filteredProducts.length) {
            renderProductCard(filteredProducts);
        } else {
            searchErrorElement.style.display = 'block';
            searchErrorElement.textContent = `No products available for '${searchQuery}'`;
        }
    } else {
        removeAllNodes();
        searchErrorElement.style.display = 'none';
        searchErrorElement.textContent = '';
        renderProductCard(productData);
    }
}

function onSort(event) {
    let sortBy = event.target.value;
    if (sortBy) {
        if (sortBy === 'ascending') {
            productData.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'descending') {
            productData.sort((a, b) => b.price - a.price);
        }
        removeAllNodes();
        renderProductCard(productData);
    } else {
        removeAllNodes();
        renderProductCard(productData);
    }
}

function populateCategoryFilter(allproducts) {
    let allCategories = [];
    allproducts.forEach(product => {
        const { category } = product;
        allCategories.push(category);
    });
    allCategories = new Set([...allCategories]);
    const filterCheckboxContainer = document.getElementById('filter-checkbox-container');
    resetCategoryFilter();
    allCategories.forEach(categoryType => {
        const label = document.createElement('label');
        label.textContent = categoryType;
        label.className = 'category-checkbox-label';
        const checkbox = document.createElement('input');
        checkbox.value = `${categoryType.toString().toLowerCase()}`;
        checkbox.type = 'checkbox';
        checkbox.className = "category-checkbox";
        label.appendChild(checkbox);
        filterCheckboxContainer.appendChild(label);
    })
    if (categoryEvent) {
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            if(checkbox.value === categoryEvent) {
                checkbox.checked = true;
            }
        });
    }

    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            updateSelectedValues(checkbox, 'category');
        });
    });
}

function updateSelectedValues(checkbox, basis) {
    if (checkbox.checked) {
        filterSelections.push(checkbox.value);
    } else {
        const index = filterSelections.indexOf(checkbox.value);
        if (index > -1) {
            filterSelections.splice(index, 1);
        }
    }
    
    filterProducts(basis)
}

function hamburgerClick(event) {
    event.stopPropagation();
    const navigationIcon = document.getElementById('mobile-navigations');
    showMobileNavigationMenu = !showMobileNavigationMenu;
    if(showMobileNavigationMenu) {
        navigationIcon.style.display = 'block';
    } else {
        navigationIcon.style.display = 'none';
    }
}


function filterProducts(basis) {
    if (basis === 'category') {
        let filteredProducts = productData?.filter(product => {
            const { category } = product;
            if(filterSelections.length) {
                if (filterSelections.includes(category)) {
                    return product;
                }
            } else {
                return product;
            }
                
        });

        removeAllNodes();
        renderProductCard(filteredProducts);
    } else if (basis === 'price') {
        const minPrice = parseInt(document.getElementById('minPrice').value);
        const maxPrice = parseInt(document.getElementById('maxPrice').value);
        let priceFilteredProducts = [];
        productData.forEach(product => {
            const price = parseFloat(product.price);
            if (price >= minPrice && price <= maxPrice) {
                priceFilteredProducts.push(product);
            }
        });
        removeAllNodes();
        renderProductCard(priceFilteredProducts);
    }
}

function resetCategoryFilter() {
    document.querySelectorAll('.category-checkbox-label').forEach(checkbox => checkbox.remove());
};

function removeAllNodes() {
    const container = document.getElementById('card-container-id');
    const lowerInfoSection = document.getElementById('lower-info-section');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    while (lowerInfoSection.firstChild) {
        lowerInfoSection.removeChild(lowerInfoSection.firstChild);
    }
}

function toggleMenu() {
    document.querySelector(".menu").classList.toggle("active");
}

const renderProductCard = (products) => {
    if (isRerendered) {
        removeAllNodes();
    }
    document.getElementById('resultCount').textContent = `${products.length} results`;
    if (products.length) {
        const cardContainer = document.getElementById('card-container-id');
        const lowerInfoSection = document.getElementById('lower-info-section');
        const loadMoreButton = document.createElement('button');
        loadMoreButton.innerText = "Load More"
        loadMoreButton.className = "load-more-button";
        loadMoreButton.id = "load-more";
        products.forEach(product => {
            const { image, title, description, price } = product;
            let card = productCard(image, title, description, price)
            cardContainer.appendChild(card);
        })

        lowerInfoSection.appendChild(loadMoreButton);
    }
}

function productCard(imageUrl, title, description, price) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = "product-image-container";
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = "product-image";
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;
    card.appendChild(cardTitle);

    const cardDescription = document.createElement('p');
    cardDescription.textContent = description;
    cardDescription.style.wordBreak = "break-word";
    card.appendChild(cardDescription);

    const priceText = document.createElement('strong');
    priceText.textContent = `$${price}`;
    card.appendChild(priceText);

    return card;
}