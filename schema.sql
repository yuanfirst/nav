-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_private INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);


-- 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_bookmarks_category_position 
ON bookmarks(category_id, position);

CREATE INDEX IF NOT EXISTS idx_bookmarks_private 
ON bookmarks(is_private);

CREATE INDEX IF NOT EXISTS idx_categories_position 
ON categories(position);

