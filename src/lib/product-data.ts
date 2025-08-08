import { Product } from './cart-context';

export const product: Product = {
  id: 'vintage-cargo-pants',
  name: 'ساتر العورة (Awrah Cover)',
  price: 200,
  originalPrice: 300,
  image: '/IMG_8581-removebg-preview.png',
  description: 'في عالمٍ تتغيّر فيه مفاهيم اللباس، يأتي "سكوربيون إكس" ليقدّم "ساتر العورة" ويُعيد تعريف الأناقة الرجالية من منظورٍ واعٍ ومحترم. هذا التصميم صُمم خصيصًا للرجل الذي يعتزّ بهويته، ويحرص على الالتزام بالستر والوقار دون أن يتخلى عن الذوق الرفيع.',
  sizes: ['S', 'M', 'L', 'XL', 'XXL']
};

export const productFeatures = [
  {
    title: 'Premium Denim',
    description: 'Made from high-quality denim fabric with vintage wash treatment for a lived-in look and superior comfort.'
  },
  {
    title: 'Utility Design',
    description: 'Multiple cargo pockets provide practical storage while adding to the classic utility aesthetic.'
  },
  {
    title: 'Comfortable Fit',
    description: 'Relaxed straight-leg cut ensures all-day comfort and easy movement.'
  },
  {
    title: 'Durable Construction',
    description: 'Reinforced stitching and quality hardware ensure long-lasting wear.'
  },
  {
    title: 'Versatile Style',
    description: 'Easy to dress up or down, perfect for casual outings or streetwear looks.'
  },
  {
    title: 'Size Range',
    description: 'Available in a wide range of sizes with various length options for the perfect fit.'
  }
];

export const reviews = [
  {
    id: '1',
    name: 'Youssef El Amrani',
    rating: 5,
    date: '2023-11-15',
    comment: 'These cargo pants are exactly what I was looking for! The vintage wash looks great and the fit is perfect. Love all the pockets for everyday carry.'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    rating: 4,
    date: '2023-10-28',
    comment: 'Really comfortable and stylish pants. The denim quality is excellent and they look great with both casual and semi-dressy outfits.'
  },
  {
    id: '3',
    name: 'Omar Benali',
    rating: 5,
    date: '2023-12-03',
    comment: 'The attention to detail on these pants is impressive. The vintage wash gives them character and the cargo pockets are actually functional.'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    rating: 4,
    date: '2023-11-20',
    comment: 'Great quality cargo pants. The denim is sturdy but still comfortable. Would love to see more color options in the future.'
  }
];