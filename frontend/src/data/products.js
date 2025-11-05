export const products = {
  sales: [
    {
      id: 1,
      name: "Хлеб белый нарезной",
      price: 45.90,
      originalPrice: 55.90,
      image: "https://korchma.ru/wa-data/public/shop/products/54/02/254/images/1716/1716.970.jpg",
      rating: 4.5,
      reviews: 128,
      discount: 18
    },
    {
      id: 2,
      name: "Молоко 3.2% 1л",
      price: 68.90,
      originalPrice: 78.90,
      image: "https://taumart.ru/upload/dev2fun.imagecompress/webp/iblock/33e/g47lfidq2xumgq2b03e1s59mgmkdi86b.webp",
      rating: 4.8,
      reviews: 245,
      discount: 13
    },
    {
      id: 3,
      name: "Яйца куриные С1 10шт",
      price: 89.90,
      originalPrice: 105.90,
      image: "https://e3.edimdoma.ru/data/posts/0001/6304/16304-ed4_wide.jpg?1745925245",
      rating: 4.6,
      reviews: 89,
      discount: 15
    },
    {
      id: 4,
      name: "Масло сливочное 82.5%",
      price: 145.90,
      originalPrice: 165.90,
      image: "https://img.vkusvill.ru/pim/images/site_LargeWebP/0034c5b6-de1f-4b6a-a71c-c43de0af1b94.webp?1705070428.9978",
      rating: 4.7,
      reviews: 156,
      discount: 12
    }
  ],
  
  new: [
    {
      id: 5,
      name: "Колбаса варёная Докторская",
      price: 320.90,
      image: "https://storum.ru/image/products/276069.png",
      rating: 4.4,
      reviews: 67,
      isNew: true
    },
    {
      id: 6,
      name: "Сыр твёрдый Российский",
      price: 280.50,
      image: "https://main-cdn.sbermegamarket.ru/big1/hlr-system/189/810/334/141/917/56/100045265297b0.jpg",
      rating: 4.6,
      reviews: 134,
      isNew: true
    },
    {
      id: 7,
      name: "Творог 9% 200г",
      price: 95.90,
      image: "https://tsx.x5static.net/i/800x800-fit/xdelivery/files/8e/f2/0e3454381148c23ee98bbc315032.jpg",
      rating: 4.5,
      reviews: 78,
      isNew: true
    },
    {
      id: 8,
      name: "Йогурт натуральный 150г",
      price: 65.90,
      image: "https://tsx.x5static.net/i/800x800-fit/xdelivery/files/e8/f6/a5f3aee518ff58c0ccd78c4ed7d8.jpg",
      rating: 4.3,
      reviews: 92,
      isNew: true
    }
  ],
  
  popular: [
    {
      id: 9,
      name: "Гречка ядрица 800г",
      price: 115.90,
      image: "https://baron.kz/image/cache/catalog/catalog/bakaleya/krupa-grechnevaya-yadrica-makfa-800-g-1200x800.jpg",
      rating: 4.8,
      reviews: 312,
      isPopular: true
    },
    {
      id: 10,
      name: "Рис круглозерный 1кг",
      price: 89.90,
      image: "https://swlife.ru/image/cache/catalog/product/9e/e2/9ee21afb67ba78ff9df8708341ed4a6f-0x0.webp",
      rating: 4.7,
      reviews: 278,
      isPopular: true
    },
    {
      id: 11,
      name: "Макароны спагетти 500г",
      price: 75.90,
      image: "https://www.miamland.com/bundles/miamland/images/visuel/400/3038350208613-400.webp",
      rating: 4.5,
      reviews: 189,
      isPopular: true
    },
    {
      id: 12,
      name: "Сахар-песок 1кг",
      price: 55.90,
      image: "https://sibprod.info/upload/resize_cache/iblock/6f8/1800_1200_19d1669f6609e6dfcaeac28e5aab5b3be/6f8b9276f69bd008fa13ef3c0f38a64c.jpg",
      rating: 4.6,
      reviews: 156,
      isPopular: true
    }
  ]
};

export const getAllProducts = () => {
  return [...products.sales, ...products.new, ...products.popular];
};
