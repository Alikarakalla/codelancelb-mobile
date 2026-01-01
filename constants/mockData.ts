import { Product, CartItem } from '@/types/schema';

// --- REUSABLE MOCK DATA HELPERS ---
const MOCK_REVIEWS = [
    { id: 1, product_id: 0, user_id: 1, rating: 5, review: 'Absolutely love this! Great quality.', status: 'approved' as const, created_at: '2025-10-15' },
    { id: 2, product_id: 0, user_id: 2, rating: 4, review: 'Good value for money, fast delivery.', status: 'approved' as const, created_at: '2025-10-18' },
    { id: 3, product_id: 0, user_id: 3, rating: 5, review: 'Exceeded my expectations. Highly recommended.', status: 'approved' as const, created_at: '2025-10-20' },
];

export const MOCK_PRODUCT: Product = {
    id: 39,
    category_id: 7,
    sub_category_id: 3,
    brand_id: 16,
    name: 'Nike Air Zoom Pegasus',
    name_en: 'Nike Air Zoom Pegasus',
    name_ar: 'نايك اير زوم بيغاسوس',
    slug: 'nike-air-zoom-pegasus',
    sku: 'NK-AZP-001',
    main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9vh8_FEOM8zW9tttArSgyap4smxiXkhWliOd0iZWAsHGHz-Q7Oz-coTMFA42G3b0JM19XdqzTfpMGjBB91e1zTaom8lvkL_x7GNGQpGjXwTTFeBKOqky7qyJtYFjgKNoEIa8rMLuIZbqf7AQ-5-yavreuyLa4BxPr-1Xzu1pVIP5afUWDui11eioyeC_6TfM3Sn7MdCnuiL4kxGqGsMfRwoLFgBIPIf5_DjPS1zxC4rJSrEkWU5USm0KBToazwoHzO7RNexXd57pE',
    short_description_en: 'Premium running shoe with responsive cushioning.',
    description_en: 'The Nike Air Zoom Pegasus returns to put a spring in your step. Responsive foam delivers the same bounce as its predecessor. Mesh in the upper provides the comfort and durability you desire with a fit that nods back to the classic Peg.',
    is_visible: true,
    is_featured: true,
    has_variants: true,
    stock_quantity: 160,
    track_inventory: true,
    price: 120.00,
    compare_at_price: 150.00,
    options: [
        { id: 58, product_id: 39, name: 'Color', values: ['Black', 'White'], sort_order: 0 },
        { id: 59, product_id: 39, name: 'Size', values: ['S', 'M'], sort_order: 1 }
    ],
    variants: [
        {
            id: 94, product_id: 39, slug: 'black-s', color: 'Black', size: 'S', stock_quantity: 20, is_visible: true, prevent_listing: false, is_default: true, price: 120.00,
            image_path: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5c3e7d5a-8b8a-4951-876a-360520677840/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png',
            gallery: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5c3e7d5a-8b8a-4951-876a-360520677840/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png']
        },
        {
            id: 95, product_id: 39, slug: 'black-m', color: 'Black', size: 'M', stock_quantity: 30, is_visible: true, prevent_listing: false, is_default: false, price: 120.00,
            image_path: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b18751db-0431-4148-9366-4c4839556201/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png',
            gallery: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b18751db-0431-4148-9366-4c4839556201/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png']
        },
        {
            id: 96, product_id: 39, slug: 'white-s', color: 'White', size: 'S', stock_quantity: 50, is_visible: true, prevent_listing: false, is_default: false, price: 120.00,
            image_path: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5fd4897f-4422-478a-9f5b-6f8d38078a63/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png',
            gallery: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5fd4897f-4422-478a-9f5b-6f8d38078a63/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png']
        },
        {
            id: 97, product_id: 39, slug: 'white-m', color: 'White', size: 'M', stock_quantity: 60, is_visible: true, prevent_listing: false, is_default: false, price: 120.00,
            image_path: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5fd4897f-4422-478a-9f5b-6f8d38078a63/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png',
            gallery: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/5fd4897f-4422-478a-9f5b-6f8d38078a63/air-zoom-pegasus-39-road-running-shoes-d4dvtm.png']
        }
    ],
    images: [
        { id: 1, product_id: 39, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9vh8_FEOM8zW9tttArSgyap4smxiXkhWliOd0iZWAsHGHz-Q7Oz-coTMFA42G3b0JM19XdqzTfpMGjBB91e1zTaom8lvkL_x7GNGQpGjXwTTFeBKOqky7qyJtYFjgKNoEIa8rMLuIZbqf7AQ-5-yavreuyLa4BxPr-1Xzu1pVIP5afUWDui11eioyeC_6TfM3Sn7MdCnuiL4kxGqGsMfRwoLFgBIPIf5_DjPS1zxC4rJSrEkWU5USm0KBToazwoHzO7RNexXd57pE', sort_order: 0 },
        { id: 2, product_id: 39, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR', sort_order: 1 }
    ],
    reviews: MOCK_REVIEWS.map(r => ({ ...r, product_id: 39 })),
    brand: { id: 16, name: 'Nike', name_en: 'Nike', name_ar: 'نايك', slug: 'nike', is_active: true }
};

export const MOCK_PRODUCTS: Product[] = [
    MOCK_PRODUCT,
    {
        ...MOCK_PRODUCT,
        id: 40,
        name: 'Cotton Crew T-Shirt',
        name_en: 'Cotton Crew T-Shirt',
        slug: 'cotton-crew-t-shirt',
        price: 35.00,
        compare_at_price: null,
        main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR',
        brand: { id: 17, name: 'Levi\'s', name_en: 'Levi\'s', name_ar: 'ليفايز', slug: 'levis', is_active: true },
        options: [
            { id: 101, product_id: 40, name: 'Color', values: ['White', 'Navy'], sort_order: 0 },
            { id: 102, product_id: 40, name: 'Size', values: ['S', 'M', 'L'], sort_order: 1 }
        ],
        variants: [
            { id: 201, product_id: 40, slug: 'white-m', color: 'White', size: 'M', stock_quantity: 50, price: 35.00, image_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR', is_visible: true, prevent_listing: false, is_default: true },
            { id: 202, product_id: 40, slug: 'navy-m', color: 'Navy', size: 'M', stock_quantity: 40, price: 35.00, image_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR', is_visible: true, prevent_listing: false, is_default: false }
        ],
        reviews: MOCK_REVIEWS.map(r => ({ ...r, product_id: 40 })),
        images: [{ id: 3, product_id: 40, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR', sort_order: 0 }]
    },
    {
        ...MOCK_PRODUCT,
        id: 41,
        name: 'Classic Leather Wallet',
        name_en: 'Classic Leather Wallet',
        slug: 'classic-leather-wallet',
        price: 45.00,
        compare_at_price: 60.00,
        main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ58jGCTdce-7fv-mOzmKbZ1IftyrHPC47AqauveDwjrBKL6_B_AoXv3QKjPp_mvj2XdiSyvBz11zbvMbTlyvYlZYGaQJG3c_pJu7Q2xip7mSpsKp2-FPmvF0c3qe-QwJambIdnKk7aa_LEoUXYU1s_64nNS83MfhXXCpntKBGmgqqX68ioIC6DECVoGnEQia3lm5qPm68bXit9xp2eWVnCxbD1nuJrxbqGVd1vBXEkmMLVjAmoS22i1__FNt9G0-6h4W_zs0OIkEt',
        brand: { id: 18, name: 'Coach', name_en: 'Coach', name_ar: 'كوتش', slug: 'coach', is_active: true },
        options: [
            { id: 103, product_id: 41, name: 'Color', values: ['Brown', 'Black'], sort_order: 0 }
        ],
        variants: [
            { id: 203, product_id: 41, slug: 'brown-os', color: 'Brown', size: null, stock_quantity: 100, price: 45.00, image_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ58jGCTdce-7fv-mOzmKbZ1IftyrHPC47AqauveDwjrBKL6_B_AoXv3QKjPp_mvj2XdiSyvBz11zbvMbTlyvYlZYGaQJG3c_pJu7Q2xip7mSpsKp2-FPmvF0c3qe-QwJambIdnKk7aa_LEoUXYU1s_64nNS83MfhXXCpntKBGmgqqX68ioIC6DECVoGnEQia3lm5qPm68bXit9xp2eWVnCxbD1nuJrxbqGVd1vBXEkmMLVjAmoS22i1__FNt9G0-6h4W_zs0OIkEt', is_visible: true, prevent_listing: false, is_default: true }
        ],
        reviews: [],
        images: [{ id: 4, product_id: 41, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ58jGCTdce-7fv-mOzmKbZ1IftyrHPC47AqauveDwjrBKL6_B_AoXv3QKjPp_mvj2XdiSyvBz11zbvMbTlyvYlZYGaQJG3c_pJu7Q2xip7mSpsKp2-FPmvF0c3qe-QwJambIdnKk7aa_LEoUXYU1s_64nNS83MfhXXCpntKBGmgqqX68ioIC6DECVoGnEQia3lm5qPm68bXit9xp2eWVnCxbD1nuJrxbqGVd1vBXEkmMLVjAmoS22i1__FNt9G0-6h4W_zs0OIkEt', sort_order: 0 }]
    },
    {
        ...MOCK_PRODUCT,
        id: 42,
        name: 'Slim Fit Dark Wash Jeans',
        name_en: 'Slim Fit Dark Wash Jeans',
        slug: 'slim-fit-jeans',
        price: 60.00,
        compare_at_price: 75.00,
        main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTB3pdo6Ke6HWQKhXCNZyJ6CzK1s2BJT8hy5nVxUYp0d3EvLL107E-SW1K4N0aOGfDcs0V2PVr0vVQB6GN4-LDZR63z-fQmGpc_OCuoGtLASjYcFx6ivB6q5b8ILvFJZoRolSOR38UXcBlwpGm5-zsPpUI6jCmpzGjM49UHAmlFpJOFCZOKAXYHrImQnowyJ7-QORrLAytGg8fqrTn_I5PXlg36yKXrHV6p5EiRFv60vdrYmdQ4Kh4vwrf8xxlzsi5dzpc3oDEoPof',
        brand: { id: 19, name: 'Zara', name_en: 'Zara', name_ar: 'زارا', slug: 'zara', is_active: true },
        reviews: MOCK_REVIEWS.map(r => ({ ...r, product_id: 42 })),
        images: [{ id: 5, product_id: 42, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTB3pdo6Ke6HWQKhXCNZyJ6CzK1s2BJT8hy5nVxUYp0d3EvLL107E-SW1K4N0aOGfDcs0V2PVr0vVQB6GN4-LDZR63z-fQmGpc_OCuoGtLASjYcFx6ivB6q5b8ILvFJZoRolSOR38UXcBlwpGm5-zsPpUI6jCmpzGjM49UHAmlFpJOFCZOKAXYHrImQnowyJ7-QORrLAytGg8fqrTn_I5PXlg36yKXrHV6p5EiRFv60vdrYmdQ4Kh4vwrf8xxlzsi5dzpc3oDEoPof', sort_order: 0 }]
    },
    {
        ...MOCK_PRODUCT,
        id: 43,
        name: 'Summer Floral Midi Dress',
        name_en: 'Summer Floral Midi Dress',
        slug: 'summer-floral-dress',
        price: 55.00,
        compare_at_price: null,
        main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbxapjRJgl4QP1jW10QU9YrupLLBYgRvXGX7YCSZ1-V1kxcBtjE9IG75igiBdEcQphodWZ93uwCjDyH722AlaDj1W5jaEWteyzyBv9p0ASR1f9ykpCFl7DDq5VtdHJBSZap0NbA2xUhOcQq66X0PnAmX_glnyyIdkLm6RRHRXkr5FuwFwy_0VRFJ6bK7kWsWnMCn4Q_7gtxZh5YNtgZlMJ-sWLtnIVK2W8Sk4Mb-3bW49cs2iT6IdjZkJ876kYYDXnml7fobC3HUe',
        brand: { id: 20, name: 'H&M', name_en: 'H&M', name_ar: 'اتش اند ام', slug: 'h-m', is_active: true },
        images: [{ id: 6, product_id: 43, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbxapjRJgl4QP1jW10QU9YrupLLBYgRvXGX7YCSZ1-V1kxcBtjE9IG75igiBdEcQphodWZ93uwCjDyH722AlaDj1W5jaEWteyzyBv9p0ASR1f9ykpCFl7DDq5VtdHJBSZap0NbA2xUhOcQq66X0PnAmX_glnyyIdkLm6RRHRXkr5FuwFwy_0VRFJ6bK7kWsWnMCn4Q_7gtxZh5YNtgZlMJ-sWLtnIVK2W8Sk4Mb-3bW49cs2iT6IdjZkJ876kYYDXnml7fobC3HUe', sort_order: 0 }]
    },
    {
        ...MOCK_PRODUCT,
        id: 44,
        name: 'Old Skool Canvas Sneakers',
        name_en: 'Old Skool Canvas Sneakers',
        slug: 'old-skool-sneakers',
        price: 40.00,
        compare_at_price: null,
        main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_jM_fZyuXvlXSzivlpAuDCJn2BNbMiTVEP9-EAxLd-vUBzr4nth8xd5WN49Ks_klHu_aLHP3H_YdEjzzLIx3l7vffN_3Lc1kRHq-B3LyVj2d8d8V3OPA1sMg3ntfXOX6Pp825Hk15fxO5VidrakfOvYybCLaJBhHjGx7eUGXB-XLo7RcWF2CcQ7El-y_lknaolllERze_M3DNxEzqUkmrVQCY6-j8QlfkoFjlRyVZ6OLaTX__xYJwA0neWGrKBz8t7BBWvRsjoWJ9',
        brand: { id: 21, name: 'Vans', name_en: 'Vans', name_ar: 'فانز', slug: 'vans', is_active: true },
        options: [
            { id: 104, product_id: 44, name: 'Size', values: ['8', '9', '10'], sort_order: 0 }
        ],
        variants: [
            { id: 204, product_id: 44, slug: 'vans-9', color: null, size: '9', stock_quantity: 20, price: 40.00, image_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_jM_fZyuXvlXSzivlpAuDCJn2BNbMiTVEP9-EAxLd-vUBzr4nth8xd5WN49Ks_klHu_aLHP3H_YdEjzzLIx3l7vffN_3Lc1kRHq-B3LyVj2d8d8V3OPA1sMg3ntfXOX6Pp825Hk15fxO5VidrakfOvYybCLaJBhHjGx7eUGXB-XLo7RcWF2CcQ7El-y_lknaolllERze_M3DNxEzqUkmrVQCY6-j8QlfkoFjlRyVZ6OLaTX__xYJwA0neWGrKBz8t7BBWvRsjoWJ9', is_visible: true, prevent_listing: false, is_default: true }
        ],
        images: [{ id: 7, product_id: 44, path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_jM_fZyuXvlXSzivlpAuDCJn2BNbMiTVEP9-EAxLd-vUBzr4nth8xd5WN49Ks_klHu_aLHP3H_YdEjzzLIx3l7vffN_3Lc1kRHq-B3LyVj2d8d8V3OPA1sMg3ntfXOX6Pp825Hk15fxO5VidrakfOvYybCLaJBhHjGx7eUGXB-XLo7RcWF2CcQ7El-y_lknaolllERze_M3DNxEzqUkmrVQCY6-j8QlfkoFjlRyVZ6OLaTX__xYJwA0neWGrKBz8t7BBWvRsjoWJ9', sort_order: 0 }]
    }
];

// Mock Cart items mapped to schema
export const MOCK_CART_ITEMS: CartItem[] = [
    {
        id: 1,
        product_id: 39,
        qty: 1,
        price: 120.00,
        options: { "Color": "Red", "Size": "10" },
        product: MOCK_PRODUCT
    },
    {
        id: 2,
        product_id: 40,
        qty: 2,
        price: 35.00,
        options: { "Color": "White", "Size": "M" },
        product: {
            ...MOCK_PRODUCT,
            id: 40,
            name: 'Cotton Crew T-Shirt',
            name_en: 'Cotton Crew T-Shirt',
            price: 35.00,
            main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvj2b9oRgs8whmaazHq6bIlXk-x_6CRObrcyy548oe6nlOsDKGK5Np4FMhljUV6iiFRI_MZ4prK23zQfkCE4kzwaYkD2pdf9pDxjhi6q-kx9EEfCOHaP23fNpE1qUHcwOrU__hOVELhmEo2FdCi3Ca-nXt1VXPuVwijB_lwwoTBQBTHAV6XMOZ6ulUjFUcr5vuEBJNIqc0AdqmuQfiScLkjc8UcQ1M07GN2oJ4AlgoUj3yU_ZJlJ5RBZ4n2ClgOP3vuBwhkdeIfyIR'
        }
    },
    {
        id: 3,
        product_id: 41,
        qty: 1,
        price: 45.00,
        options: { "Color": "Brown" },
        product: {
            ...MOCK_PRODUCT,
            id: 41,
            name: 'Classic Leather Wallet',
            name_en: 'Classic Leather Wallet',
            price: 45.00,
            main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ58jGCTdce-7fv-mOzmKbZ1IftyrHPC47AqauveDwjrBKL6_B_AoXv3QKjPp_mvj2XdiSyvBz11zbvMbTlyvYlZYGaQJG3c_pJu7Q2xip7mSpsKp2-FPmvF0c3qe-QwJambIdnKk7aa_LEoUXYU1s_64nNS83MfhXXCpntKBGmgqqX68ioIC6DECVoGnEQia3lm5qPm68bXit9xp2eWVnCxbD1nuJrxbqGVd1vBXEkmMLVjAmoS22i1__FNt9G0-6h4W_zs0OIkEt'
        }
    }
];
