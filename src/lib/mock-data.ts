export const ROLES = {
  ADMIN: 'administrator',
  STAFF: 'staff',
  MEMBER: 'member',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Legacy User type kept for mock data compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'deactivated';
  savings: number;
  debt: number;
  joinedDate: string;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@blmc.local',
    role: ROLES.ADMIN,
    status: 'active',
    savings: 50000,
    debt: 0,
    joinedDate: '2023-01-01',
  },
  {
    id: '2',
    name: 'Staff Maria',
    email: 'staff@blmc.com',
    role: ROLES.STAFF,
    status: 'active',
    savings: 12000,
    debt: 500,
    joinedDate: '2023-03-15',
  },
  {
    id: '3',
    name: 'Juan Dela Cruz',
    email: 'member@blmc.com',
    role: ROLES.MEMBER,
    status: 'approved',
    savings: 8500,
    debt: 2400,
    joinedDate: '2023-06-20',
  },
  {
    id: '4',
    name: 'New Applicant',
    email: 'applicant@gmail.com',
    role: ROLES.MEMBER,
    status: 'pending',
    savings: 0,
    debt: 0,
    joinedDate: '2024-05-10',
  },
];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'event' | 'info' | 'urgent';
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'General Assembly 2024',
    content: 'Join us for the annual general assembly this coming Sunday at the Municipal Hall.',
    date: '2024-06-15',
    type: 'event',
  },
  {
    id: 'a2',
    title: 'New Loan Program',
    content: 'We are launching a new agricultural loan program with lower interest rates.',
    date: '2024-05-20',
    type: 'info',
  },
  {
    id: 'a3',
    title: 'Office Closure',
    content: 'The office will be closed on June 12 for Independence Day.',
    date: '2024-06-12',
    type: 'urgent',
  },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Antibiotic Powder (1kg)',        description: 'Broad-spectrum antibiotic for livestock.',      price: 450,  stock: 30,  category: 'Medicine' },
  { id: 'p2',  name: 'Broiler Feed (25kg)',             description: 'Complete feed for broiler chickens.',           price: 1180, stock: 80,  category: 'Feeds' },
  { id: 'p3',  name: 'Broiler Starter Chicks (100pcs)', description: 'Day-old broiler starter chicks.',               price: 820,  stock: 200, category: 'Livestock' },
  { id: 'p4',  name: 'Cat Food (5kg)',                  description: 'Premium dry cat food.',                         price: 520,  stock: 40,  category: 'Feeds' },
  { id: 'p5',  name: 'Chicken Feed (Layer 75kg)',       description: 'High-calcium layer feed.',                      price: 1150, stock: 60,  category: 'Feeds' },
  { id: 'p6',  name: 'Disinfectant 5L',                description: 'Farm-grade disinfectant solution.',             price: 420,  stock: 25,  category: 'Supplies' },
  { id: 'p7',  name: 'Dog Feed (5kg)',                  description: 'Balanced nutrition dry dog food.',              price: 548,  stock: 35,  category: 'Feeds' },
  { id: 'p8',  name: 'Egg Trays (10 pcs)',              description: 'Cardboard egg trays.',                          price: 150,  stock: 500, category: 'Supplies' },
  { id: 'p9',  name: 'Fencing Enough (Large)',          description: 'Heavy-duty fencing wire roll.',                 price: 960,  stock: 15,  category: 'Supplies' },
  { id: 'p10', name: 'Fresh Beef (per kg)',             description: 'Fresh beef cuts per kilogram.',                 price: 360,  stock: 20,  category: 'Meat' },
  { id: 'p11', name: 'Fresh Chicken (per kg)',          description: 'Fresh dressed chicken per kilogram.',           price: 180,  stock: 50,  category: 'Meat' },
  { id: 'p12', name: 'Grower Feed (25kg)',              description: 'Grower phase complete feed.',                   price: 1180, stock: 70,  category: 'Feeds' },
  { id: 'p13', name: 'Hog Feed - Broiler (25kg)',       description: 'Broiler phase hog feed.',                       price: 1599, stock: 40,  category: 'Feeds' },
  { id: 'p14', name: 'Hog Feed - Finisher (25kg)',      description: 'Finisher phase hog feed.',                      price: 1220, stock: 35,  category: 'Feeds' },
  { id: 'p15', name: 'Hog Feed - Grower (25kg)',        description: 'Grower phase hog feed.',                        price: 1538, stock: 45,  category: 'Feeds' },
  { id: 'p16', name: 'Hog Feed - Lactating (25kg)',     description: 'Lactating sow feed.',                           price: 1538, stock: 30,  category: 'Feeds' },
  { id: 'p17', name: 'Hog Feed - Pre Starter (5kg)',    description: 'Pre-starter piglet feed.',                      price: 1009, stock: 25,  category: 'Feeds' },
  { id: 'p18', name: 'Hog Feed - Starter Pellet (7kg)', description: 'Starter pellet for piglets.',                   price: 380,  stock: 60,  category: 'Feeds' },
  { id: 'p19', name: 'Layer Chicks (100 pcs)',          description: 'Day-old layer chicks.',                         price: 998,  stock: 150, category: 'Livestock' },
  { id: 'p20', name: 'Layer Feed (11kg)',               description: 'Layer phase complete feed.',                    price: 1250, stock: 55,  category: 'Feeds' },
  { id: 'p21', name: 'Lumpianaw (per pack)',            description: 'Fresh lumpianaw per pack.',                     price: 520,  stock: 30,  category: 'Food' },
  { id: 'p22', name: 'Premixture (for chick recovery)', description: 'Vitamin premix for chick recovery.',            price: 229,  stock: 40,  category: 'Medicine' },
  { id: 'p23', name: 'Rice (50kg)',                     description: 'Premium white rice sack.',                      price: 2293, stock: 20,  category: 'Food' },
  { id: 'p24', name: 'Sardines Sausages (per pack)',    description: 'Canned sardine sausages.',                      price: 160,  stock: 100, category: 'Food' },
  { id: 'p25', name: 'Starter Feed (7kg)',              description: 'Starter feed for chicks.',                      price: 1253, stock: 110, category: 'Feeds' },
  { id: 'p26', name: 'Tocino (per pack)',               description: 'Sweet cured pork tocino.',                      price: 140,  stock: 80,  category: 'Food' },
  { id: 'p27', name: 'UHD TRICES (250g)',               description: 'Ultra-high density rice crackers.',             price: 1308, stock: 50,  category: 'Food' },
  { id: 'p28', name: 'Vitamin Supplement (1L)',         description: 'Liquid vitamins for poultry and swine.',        price: 500,  stock: 45,  category: 'Medicine' },
  { id: 'p29', name: 'Water Bottle (Non-acidic)',       description: 'Non-acidic drinking water bottle.',             price: 5,    stock: 1000,category: 'Supplies' },
];

export interface PosSale {
  id: string;
  date: string;
  customerName: string;
  items: number;
  payment: 'cash' | 'credit' | 'debit';
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
}

export const MOCK_POS_SALES: PosSale[] = [
  { id: 's1', date: '3/26/2026', customerName: 'Alindato Leonard', items: 1, payment: 'cash', total: 1180, status: 'paid' },
  { id: 's2', date: '3/26/2026', customerName: 'Alindato Leonard', items: 1, payment: 'cash', total: 850,  status: 'paid' },
];

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'deposit' | 'payment' | 'debt_charge';
  description: string;
  amount: number;
  date: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', memberId: '3', memberName: 'Juan Dela Cruz', type: 'deposit', description: 'Monthly savings deposit', amount: 500, date: '2026-05-04' },
  { id: 't2', memberId: '3', memberName: 'Juan Dela Cruz', type: 'debt_charge', description: 'Livestock Feed A purchase', amount: 1250, date: '2026-04-20' },
  { id: 't3', memberId: '2', memberName: 'Staff Maria', type: 'payment', description: 'Loan payment', amount: 300, date: '2026-04-15' },
  { id: 't4', memberId: '3', memberName: 'Juan Dela Cruz', type: 'deposit', description: 'Share capital contribution', amount: 1000, date: '2026-03-10' },
  { id: 't5', memberId: '2', memberName: 'Staff Maria', type: 'deposit', description: 'Monthly savings deposit', amount: 500, date: '2026-03-01' },
];

// Monthly sales data for charts (current year)
export const MOCK_MONTHLY_SALES = [
  { month: 'Jan', sales: 0, requests: 0 },
  { month: 'Feb', sales: 0, requests: 0 },
  { month: 'Mar', sales: 3325, requests: 1 },
  { month: 'Apr', sales: 1550, requests: 0 },
  { month: 'May', sales: 450, requests: 0 },
  { month: 'Jun', sales: 0, requests: 0 },
  { month: 'Jul', sales: 0, requests: 0 },
  { month: 'Aug', sales: 0, requests: 0 },
  { month: 'Sep', sales: 0, requests: 0 },
  { month: 'Oct', sales: 0, requests: 0 },
  { month: 'Nov', sales: 0, requests: 0 },
  { month: 'Dec', sales: 0, requests: 0 },
];