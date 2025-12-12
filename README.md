
# فروشگاه اینترنتی آشپزخونه (Ashpazkhoneh)

یک پلتفرم فروشگاهی مدرن و لوکس برای لوازم خانه و آشپزخانه، پیاده‌سازی شده با React و Tailwind CSS. این پروژه شامل بخش‌های فروشگاه، پنل مدیریت کامل، وبلاگ و دستیار هوشمند آشپزی مبتنی بر هوش مصنوعی است.

## 🚀 ویژگی‌ها

- **فروشگاه کامل:** دسته‌بندی محصولات، سبد خرید، لیست علاقه‌مندی‌ها و پروسه پرداخت.
- **پنل مدیریت پیشرفته:** مدیریت محصولات، سفارشات، کاربران، تنظیمات سایت و اسلایدرها.
- **دستیار هوشمند (AI Chef):** پاسخگویی به سوالات آشپزی و راهنمایی خرید با استفاده از Gemini AI.
- **طراحی مدرن:** رابط کاربری واکنش‌گرا (Responsive) و انیمیشن‌های روان.
- **بدون نیاز به Backend (MVP):** استفاده از LocalStorage برای شبیه‌سازی دیتابیس و عملیات CRUD.

---

## 🛠 پیش‌نیازها

برای اجرای این پروژه به موارد زیر نیاز دارید:
- **Node.js** (نسخه ۱۸ یا بالاتر)
- **npm** یا **yarn**

---

## 💻 نصب و اجرا (لوکال)

۱. پروژه را کلون کنید یا فایل‌ها را دانلود نمایید.
۲. در پوشه پروژه ترمینال را باز کنید.
۳. دستور زیر را برای نصب وابستگی‌های اولیه (سرور استاتیک) اجرا کنید:

```bash
npm install
```

۴. برای اجرای پروژه:

```bash
npm start
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

---

## 🌐 راهنمای استقرار روی سرور (نصب اتوماتیک با SSL)

برای راه‌اندازی سریع پروژه روی سرور (VPS)، اسکریپت زیر تمام مراحل نصب، کانفیگ دیتابیس، تنظیم دامنه، دریافت SSL و راه‌اندازی را به صورت خودکار انجام می‌دهد.

۱. در سرور خود یک فایل جدید ایجاد کنید:
```bash
nano install.bash
```

۲. کدهای زیر را در آن کپی کنید:

```bash
#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   Ashpazkhoneh Auto Installer   ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo.${NC}"
  exit
fi

# 1. Gather Configuration
echo ""
echo -e "${GREEN}--- Domain & Network Settings ---${NC}"
read -p "Domain Name (without http/www, e.g., example.com): " DOMAIN_NAME
read -p "Email for SSL Certificate (e.g., info@example.com): " SSL_EMAIL
read -p "App Internal Port [Default: 3000]: " APP_PORT
APP_PORT=${APP_PORT:-3000}

echo ""
echo -e "${GREEN}--- Database Settings ---${NC}"
read -p "Database Name: " DB_NAME
read -p "Database User: " DB_USER
read -s -p "Database Password: " DB_PASS
echo ""

echo ""
echo -e "${GREEN}--- Admin Settings ---${NC}"
read -p "Admin Username: " ADMIN_USER
read -p "Admin Email: " ADMIN_EMAIL
read -s -p "Admin Password: " ADMIN_PASS
echo ""

# 2. Save Configuration to .env
echo ""
echo "Saving configuration..."
cat > .env << EOL
PORT=$APP_PORT
DB_HOST=localhost
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
ADMIN_INIT_USER=$ADMIN_USER
ADMIN_INIT_EMAIL=$ADMIN_EMAIL
ADMIN_INIT_PASS=$ADMIN_PASS
EOL
echo ".env file created."

# 3. System Update & Dependencies
echo ""
echo "Updating system and installing Node.js, Nginx, and Certbot..."
apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx

# 4. Install Process Managers
echo ""
echo "Installing PM2 and Serve..."
npm install -g pm2 serve

# 5. Install Project Dependencies
echo ""
echo "Installing project packages..."
if [ -f "package.json" ]; then
    npm install
else
    echo "package.json not found. Initializing temporary setup..."
    npm init -y
    npm install serve
fi

# 6. Start Application with PM2
echo ""
echo "Starting application on port $APP_PORT..."
pm2 delete ashpazkhoneh 2>/dev/null
pm2 start serve --name "ashpazkhoneh" -- -s . -l $APP_PORT
pm2 save
pm2 startup

# 7. Configure Nginx Reverse Proxy
echo ""
echo "Configuring Nginx..."

# Create Nginx Config
cat > /etc/nginx/sites-available/$DOMAIN_NAME << EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable Site
# Force link creation (-f) to overwrite if exists
ln -sf /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/

# Cleanup default config and broken links
echo "Cleaning up Nginx configuration..."
rm /etc/nginx/sites-enabled/default 2>/dev/null
# CRITICAL FIX: Remove broken symlinks that cause "No such file or directory" errors
find -L /etc/nginx/sites-enabled/ -type l -delete

# Test and Restart Nginx
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "Nginx configured successfully."
else
    echo -e "${RED}Nginx configuration failed.${NC}"
    exit 1
fi

# 8. SSL & HTTPS
echo ""
echo "Obtaining SSL Certificate & Enabling HTTPS..."
echo -e "${BLUE}Note: Ensure your domain ($DOMAIN_NAME) points to this server IP.${NC}"

certbot --nginx --non-interactive --agree-tos --redirect -m $SSL_EMAIL -d $DOMAIN_NAME -d www.$DOMAIN_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}   Installation Complete!   ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo -e "Your site is now secure and accessible at:"
    echo -e "https://$DOMAIN_NAME"
    echo ""
    echo -e "All HTTP traffic is redirected to HTTPS."
else
    echo ""
    echo -e "${RED}SSL Installation Failed.${NC}"
    echo "Please check your DNS settings."
    echo "Your site is temporarily available at http://$DOMAIN_NAME"
fi
```

۳. فایل را ذخیره کرده (`Ctrl+O`, `Enter`) و خارج شوید (`Ctrl+X`).

۴. به اسکریپت دسترسی اجرا بدهید و آن را اجرا کنید:

```bash
chmod +x install.bash
sudo ./install.bash
```

---

## ⚙️ متغیرهای محیطی (Environment Variables)

اسکریپت بالا یک فایل `.env` ایجاد می‌کند. اگرچه نسخه فعلی پروژه (MVP) از `localStorage` استفاده می‌کند، این فایل برای اتصال به Backend واقعی (Node.js/NestJS) در آینده ضروری است.

نمونه فایل `.env` تولید شده:
```env
PORT=3000
DB_NAME=ashpaz_db
DB_USER=root
DB_PASS=secret
ADMIN_INIT_USER=admin
ADMIN_INIT_EMAIL=admin@example.com
ADMIN_INIT_PASS=123456
```

---

## 📂 ساختار پروژه

- `components/`: کامپوننت‌های رابط کاربری
- `pages/`: صفحات اصلی
- `services/`: سرویس‌های شبیه‌سازی دیتابیس و هوش مصنوعی
- `types.ts`: تعاریف تایپ‌های TypeScript
- `constants.ts`: داده‌های ثابت
