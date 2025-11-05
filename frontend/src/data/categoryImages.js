const categoryImages = {
  'Крупы': '/images/categories/крупы.png',
  'Макаронные изделия': '/images/categories/макароны.png',
  'Молочные продукты': '/images/categories/молоко.png',
  'Мясные продукты': '/images/categories/мясо.png',
  'Сахар и подсластители': '/images/categories/сахар.png',
  'Хлебобулочные': '/images/categories/хлебобулочные.png',
  'Яйца': '/images/categories/яйца.png'
};

export function getCategoryImage(name) {
  return categoryImages[name] || '/images/categories/placeholder.svg';
}

export default categoryImages;
