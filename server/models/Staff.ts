// Model Staff đơn giản, có thể dùng với ORM hoặc raw SQL
export interface Staff {
  id: number;
  username: string;
  passwordHash: string;
  role: string; // 'admin' | 'staff'
  createdAt: Date;
}

// Nếu dùng ORM (ví dụ: drizzle, sequelize, typeorm), có thể export schema ở đây
// Nếu dùng raw SQL, chỉ cần interface này để type-check 