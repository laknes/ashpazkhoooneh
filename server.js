
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

// Constants for initial seeding (Moved from db.ts/constants.ts conceptually)
const INITIAL_DATA = {
  products: [], // Will be populated if empty
  orders: [],
  users: [
    { id: 1, name: 'مدیر کل', phone: '09123456789', password: 'admin', role: 'ADMIN', email: 'admin@ashpazkhoneh.com', province: 'تهران', city: 'تهران', address: 'دفتر مرکزی', postalCode: '1234567890' }
  ],
  posts: [],
  categories: [],
  settings: {},
  reviews: [],
  coupons: [],
  wishlist: []
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images

// Active Users Tracking
const activeUsers = new Map();

// Cleanup active users every 30 seconds (remove those not seen in last 60s)
setInterval(() => {
  const now = Date.now();
  for (const [id, lastSeen] of activeUsers.entries()) {
    if (now - lastSeen > 60000) {
      activeUsers.delete(id);
    }
  }
}, 30000);

// Database Helper
const getDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const saveDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API ROUTES ---

// Heartbeat for Active Users
app.post('/api/heartbeat', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    activeUsers.set(sessionId, Date.now());
  }
  res.json({ success: true });
});

app.get('/api/stats/active-users', (req, res) => {
  res.json({ count: activeUsers.size });
});

// --- Backup & Restore ---

// Download Backup
app.get('/api/backup', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.download(DB_FILE, `ashpazkhoneh-backup-${timestamp}.json`);
  } else {
    res.status(404).json({ error: 'Database file not found' });
  }
});

// Restore Backup
app.post('/api/restore', (req, res) => {
  try {
    const data = req.body;
    
    // Basic validation to ensure it's likely our DB format
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Optional: Check for critical keys
    if (!data.products && !data.users && !data.settings) {
         return res.status(400).json({ error: 'Invalid backup file: Missing critical data' });
    }
    
    // Ensure structure matches
    const safeData = {
        products: data.products || [],
        orders: data.orders || [],
        users: data.users || [],
        posts: data.posts || [],
        categories: data.categories || [],
        settings: data.settings || {},
        reviews: data.reviews || [],
        coupons: data.coupons || [],
        wishlist: data.wishlist || []
    };

    saveDb(safeData);
    console.log('Database restored from backup');
    
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err) {
    console.error('Restore failed:', err);
    res.status(500).json({ error: 'Failed to restore database', details: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  const db = getDb();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const newProduct = { ...req.body, id: Date.now() };
  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  db.products = db.products.filter(p => p.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = getDb();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = getDb();
  const newOrder = { ...req.body, id: `ORD-${Date.now()}` };
  db.orders.push(newOrder);
  saveDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const order = db.orders.find(o => o.id === id);
  if (order) {
    order.status = req.body.status;
    saveDb(db);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  const db = getDb();
  res.json(db.categories || []);
});

app.post('/api/categories', (req, res) => {
  const db = getDb();
  const newCat = { ...req.body, id: Date.now() };
  db.categories.push(newCat);
  saveDb(db);
  res.json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
    const db = getDb();
    const id = parseInt(req.params.id);
    const index = db.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
      saveDb(db);
      res.json(db.categories[index]);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    const db = getDb();
    const id = parseInt(req.params.id);
    db.categories = db.categories.filter(c => c.id !== id);
    saveDb(db);
    res.json({ success: true });
});

// Settings
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json(db.settings || {});
});

app.post('/api/settings', (req, res) => {
  const db = getDb();
  db.settings = req.body;
  saveDb(db);
  res.json(db.settings);
});

// Cloudinary
app.post('/api/upload', async (req, res) => {
    const db = getDb();
    const config = db.settings?.cloudinary;

    // Check if Cloudinary is enabled and configured
    if (!config || !config.enabled || !config.cloudName || !config.apiKey || !config.apiSecret) {
        return res.status(400).json({ error: 'Cloudinary not configured' });
    }

    try {
        cloudinary.config({
            cloud_name: config.cloudName,
            api_key: config.apiKey,
            api_secret: config.apiSecret
        });

        const fileStr = req.body.image; // Expecting base64 string
        if (!fileStr) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: 'ashpazkhoneh'
        });
        
        // Auto-optimize URL
        let url = uploadResponse.secure_url;
        // Inject q_auto,f_auto if standard upload path
        if (url.includes('/upload/') && !url.includes('/q_auto,f_auto/')) {
            url = url.replace('/upload/', '/upload/q_auto,f_auto/');
        }

        res.json({ url });
    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        res.status(500).json({ error: 'Upload failed', details: err.message });
    }
});

app.post('/api/test-cloudinary', async (req, res) => {
    const { cloudName, apiKey, apiSecret } = req.body;

    if (!cloudName || !apiKey || !apiSecret) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        const result = await cloudinary.api.ping();
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// Users & Auth (Simplified)
app.get('/api/users', (req, res) => {
    const db = getDb();
    res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
    const db = getDb();
    const newUser = { ...req.body, id: Date.now() };
    db.users.push(newUser);
    saveDb(db);
    res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const db = getDb();
    const id = parseInt(req.params.id);
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...req.body };
        saveDb(db);
        res.json(db.users[index]);
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

app.post('/api/login', (req, res) => {
    const db = getDb();
    const { login, password } = req.body;
    const user = db.users.find(u => (u.phone === login || u.email === login) && (!password || u.password === password));
    
    if (user) {
        res.json(user);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Posts
app.get('/api/posts', (req, res) => {
    const db = getDb();
    res.json(db.posts || []);
});

app.post('/api/posts', (req, res) => {
    const db = getDb();
    const newPost = { ...req.body, id: Date.now() };
    db.posts.push(newPost);
    saveDb(db);
    res.json(newPost);
});

// Seed Data Endpoint (for initialization)
app.post('/api/seed', (req, res) => {
    const db = getDb();
    if (!db.products || db.products.length === 0) {
        db.products = req.body.products || [];
        db.categories = req.body.categories || [];
        db.posts = req.body.posts || [];
        db.settings = req.body.settings || {};
        saveDb(db);
        res.json({ success: true, message: 'Database seeded' });
    } else {
        res.json({ success: false, message: 'Database already has data' });
    }
});

// Serve React App
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
