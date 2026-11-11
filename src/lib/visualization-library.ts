import before from '@/assets/example-before.asset.json';
import after from '@/assets/example-after.asset.json';
import oak from '@/assets/product-oak.asset.json';
import glass from '@/assets/product-glass.asset.json';
import floating from '@/assets/product-floating-original-v2.asset.json';
import spiral from '@/assets/product-spiral.asset.json';
import supportA from '@/assets/product-support-a-v2.asset.json';
import supportB from '@/assets/product-support-b-v2.asset.json';
import supportC from '@/assets/product-support-c-v2.asset.json';
export const exampleRoom = before.url;
export const exampleResult = after.url;
export const products = [
  { id: 'floating', name: 'Floating walnut · glass', type: 'Complete stair', image: floating.url },
  { id: 'spiral', name: 'Spiral · metal side panel', type: 'Complete stair', image: spiral.url },
  { id: 'oak', name: 'Oak · folded steel', type: 'Complete stair', image: oak.url },
  { id: 'glass', name: 'Glass · white stringer', type: 'Complete stair', image: glass.url },
  { id: 'support-a', name: 'Stepped support · upper side', type: 'Support component', image: supportA.url },
  { id: 'support-b', name: 'Stepped support · side', type: 'Support component', image: supportB.url },
  { id: 'support-c', name: 'Stepped steel support', type: 'Support component', image: supportC.url },
];
