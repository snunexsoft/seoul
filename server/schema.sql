CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      );
CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('post', 'file', 'both')),
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      , slug TEXT);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      , type TEXT DEFAULT "list");
CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        category_id INTEGER,
        board_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, featured_image TEXT, view_count INTEGER DEFAULT 0, slug TEXT, excerpt TEXT, status TEXT DEFAULT 'published', updated_at DATETIME, attachment_filename TEXT, attachment_filepath TEXT, attachment_filesize INTEGER, meta_description TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (board_id) REFERENCES boards(id)
      );
CREATE TABLE files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        filename TEXT,
        filepath TEXT,
        filesize INTEGER,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
CREATE TABLE images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        filepath TEXT,
        post_id INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      );
CREATE TABLE buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dong TEXT NOT NULL,
        name TEXT NOT NULL,
        usage TEXT,
        institute TEXT,
        area DECIMAL(8,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE energy_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        electricity DECIMAL(10,2),
        gas DECIMAL(10,2),
        water DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(building_name, year, month)
      );
CREATE TABLE solar_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        generation DECIMAL(10,2),
        capacity DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(building_name, year, month)
      );
CREATE TABLE hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    button_text TEXT,
    background_image TEXT,
    background_color TEXT,
    text_color TEXT DEFAULT 'white',
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE TABLE greenhouse_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      scope1_emission REAL DEFAULT 0,
      scope2_emission REAL DEFAULT 0,
      total_emission REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
CREATE TABLE menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('page', 'board', 'link')),
      page_id INTEGER,
      board_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, parent_id INTEGER DEFAULT NULL,
      FOREIGN KEY (page_id) REFERENCES posts(id) ON DELETE SET NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL
    );
CREATE INDEX idx_menus_sort_order ON menus(sort_order);
CREATE INDEX idx_menus_is_active ON menus(is_active);
CREATE TABLE history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NULL,
      day INTEGER NULL,
      date_text TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
CREATE INDEX idx_history_year ON history(year);
CREATE INDEX idx_history_sort ON history(year, sort_order);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);
CREATE TABLE link_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      link_url TEXT NOT NULL,
      image_url TEXT,
      main_category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
