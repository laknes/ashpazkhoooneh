
# فروشگاه اینترنتی آشپزخونه (Ashpazkhoneh)

یک پلتفرم فروشگاهی مدرن و لوکس برای لوازم خانه و آشپزخانه، پیاده‌سازی شده با React و Tailwind CSS. این پروژه شامل بخش‌های فروشگاه، پنل مدیریت کامل، وبلاگ و دستیار هوشمند آشپزی مبتنی بر هوش مصنوعی است.

## 🚀 ویژگی‌ها

- **فروشگاه کامل:** دسته‌بندی محصولات، سبد خرید، لیست علاقه‌مندی‌ها و پروسه پرداخت.
- **پنل مدیریت پیشرفته:** مدیریت محصولات، سفارشات، کاربران، تنظیمات سایت و اسلایدرها.
- **دستیار هوشمند (AI Chef):** پاسخگویی به سوالات آشپزی و راهنمایی خرید با استفاده از Gemini AI.
- **طراحی مدرن:** رابط کاربری واکنش‌گرا (Responsive) و انیمیشن‌های روان.
- **بک‌اند اختصاصی:** سرور Node.js/Express برای مدیریت APIها و دیتابیس فایل‌محور.

---

## 🛠 پیش‌نیازها

برای اجرای این پروژه به موارد زیر نیاز دارید:
- **Node.js** (نسخه ۱۸ یا بالاتر)
- **npm** یا **yarn**

---

## 💻 نصب و اجرا (لوکال)

۱. پروژه را کلون کنید یا فایل‌ها را دانلود نمایید.
۲. در پوشه پروژه ترمینال را باز کنید.
۳. دستور زیر را برای نصب وابستگی‌ها اجرا کنید:

```bash
npm install
```

۴. برای اجرای پروژه در حالت توسعه:

```bash
npm run dev
```

۵. برای اجرای سرور و فرانت‌اند به صورت همزمان (پروداکشن):

```bash
npm run build
npm start
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

---

## 🔄 راهنمای بروزرسانی (Update Script)

برای بروزرسانی سریع پروژه روی سرور، فایل `update.bash` را با محتوای زیر ایجاد کنید:

```bash
nano update.bash
```

**محتوای فایل `update.bash`:**

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting Update Process...${NC}"

# 1. Pull latest changes
echo -e "${GREEN}Pulling from Git...${NC}"
git pull

# 2. Install Dependencies
echo -e "${GREEN}Installing Dependencies...${NC}"
npm install

# 3. Build React App
echo -e "${GREEN}Building Frontend...${NC}"
npm run build

# 4. Restart Server (PM2)
echo -e "${GREEN}Restarting PM2 Process...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 reload ashpazkhoneh 2>/dev/null || pm2 start server.js --name ashpazkhoneh
    pm2 save
else
    echo "PM2 not found. Please install PM2 globally: npm install -g pm2"
fi

echo -e "${GREEN}Update Completed Successfully!${NC}"
```

سپس دسترسی اجرا به آن بدهید و اجرا کنید:

```bash
chmod +x update.bash
./update.bash
```

---

## 🔐 راهنمای تنظیم SSL و رفع خطاها (Fixer Script)

اگر با خطای 502، مشکل SSL یا خطاهای Cloudflare مواجه هستید، فایل `ssl.sh` را با محتوای زیر ایجاد کنید. این اسکریپت همه کارها را خودکار انجام می‌دهد.

```bash
nano ssl.sh
```

**محتوای فایل `ssl.sh`:**

```bash
#!/bin/bash

# Configuration
DB_FILE="./database.json"
ENV_FILE="./.env"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   Nginx SSL Configuration & Fixer            ${NC}"
echo -e "${BLUE}==============================================${NC}"

# Check for root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (sudo ./ssl.sh)${NC}"
  exit 1
fi

# 0. Firewall Check (Fix for Error 521)
if command -v ufw &> /dev/null; then
    echo -e "${GREEN}Configuring Firewall (UFW) to allow ports 80, 443, 3000...${NC}"
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw allow 3000
    # We do not force enable UFW to avoid locking user out if ssh is non-standard, 
    # but 'allow' commands ensure rules exist if it IS enabled.
fi

# 1. Detect Port from .env
APP_PORT=3000 # Default fallback
if [ -f "$ENV_FILE" ]; then
    DETECTED_PORT=$(grep "^PORT=" "$ENV_FILE" | cut -d '=' -f2)
    if [ ! -z "$DETECTED_PORT" ]; then
        APP_PORT=$DETECTED_PORT
        echo -e "${GREEN}Detected App Port from .env: $APP_PORT${NC}"
    fi
fi

# Install dependencies if missing
if ! command -v jq &> /dev/null; then apt-get update && apt-get install -y jq; fi
if ! command -v nginx &> /dev/null; then apt-get update && apt-get install -y nginx; fi

# Input Domain
read -p "Enter Domain Name (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then echo "Domain required."; exit 1; fi

# Ask about 'www' subdomain
read -p "Include 'www' subdomain? (y/n) [y]: " INCLUDE_WWW
INCLUDE_WWW=${INCLUDE_WWW:-y}

DOMAINS_ARG="-d $DOMAIN"
SERVER_NAME_ARG="$DOMAIN"

if [[ "$INCLUDE_WWW" =~ ^[Yy]$ ]]; then
    DOMAINS_ARG="-d $DOMAIN -d www.$DOMAIN"
    SERVER_NAME_ARG="$DOMAIN www.$DOMAIN"
fi

echo ""
echo "Select SSL Method:"
echo "1) Let's Encrypt (Auto - Free)"
echo "2) Cloudflare / Custom (From Admin Panel DB)"
read -p "Choose [1 or 2]: " CHOICE

if [ "$CHOICE" == "1" ]; then
    read -p "Enter Email: " EMAIL
    apt-get install -y certbot python3-certbot-nginx
    
    # Simple config for Certbot validation
    cat > /etc/nginx/sites-available/$DOMAIN << EOL
server {
    listen 80;
    server_name $SERVER_NAME_ARG;
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default 2>/dev/null
    systemctl restart nginx
    
    # Run Certbot
    certbot --nginx $DOMAINS_ARG -m $EMAIL --agree-tos --non-interactive --redirect

elif [ "$CHOICE" == "2" ]; then
    if [ ! -f "$DB_FILE" ]; then echo "database.json not found."; exit 1; fi
    CERT=$(jq -r '.settings.ssl.certCrt' "$DB_FILE")
    KEY=$(jq -r '.settings.ssl.privateKey' "$DB_FILE")
    
    if [ -z "$CERT" ] || [ "$CERT" == "null" ]; then echo "Certificates not found in DB."; exit 1; fi

    mkdir -p /etc/nginx/ssl
    echo "$CERT" > /etc/nginx/ssl/$DOMAIN.crt
    echo "$KEY" > /etc/nginx/ssl/$DOMAIN.key

    cat > /etc/nginx/sites-available/$DOMAIN << EOL
server {
    listen 80;
    server_name $SERVER_NAME_ARG;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name $SERVER_NAME_ARG;
    ssl_certificate /etc/nginx/ssl/$DOMAIN.crt;
    ssl_certificate_key /etc/nginx/ssl/$DOMAIN.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default 2>/dev/null
    nginx -t && systemctl restart nginx
fi

# RELOAD APP to fix 502
echo -e "${GREEN}Restarting PM2 to ensure connectivity...${NC}"
pm2 reload ashpazkhoneh 2>/dev/null || pm2 restart ashpazkhoneh 2>/dev/null
echo "Done."

echo ""
echo -e "${RED}IMPORTANT:${NC} If using Cloudflare, ensure SSL/TLS is set to 'Full (Strict)' and DNS Proxy (Orange Cloud) is ON."
```

اجرا:
```bash
chmod +x ssl.sh
./ssl.sh
```

---

## ❓ عیب‌یابی (Troubleshooting)

### 🔴 مشکل: خطای `Error 521: Web server is down`
این خطا در Cloudflare یعنی سرور شما به درخواست‌ها پاسخ نمی‌دهد. دلایل رایج:
1. **Nginx خاموش است:** نصب SSL قبلی شکست خورده و Nginx متوقف شده است. اسکریپت `ssl.sh` جدید این مورد را حل می‌کند.
2. **پورت بسته است:** فایروال سرور اجازه ورود به پورت 80 یا 443 را نمی‌دهد. اسکریپت جدید به طور خودکار این پورت‌ها را باز می‌کند.
3. **گواهی نامعتبر:** اگر از Cloudflare در حالت Full استفاده می‌کنید اما سرور شما فقط روی پورت 80 (بدون SSL) گوش می‌دهد.

**راه حل:**
فقط کافیست اسکریپت `ssl.sh` جدید را اجرا کنید.

### 🔴 مشکل: خطای `NXDOMAIN`
- اگر برای `www` رکورد DNS ندارید، در اسکریپت بالا وقتی سوال شد `Include 'www'?` گزینه **n** را بزنید.

### 🔴 مشکل: خطای `NET::ERR_CERT_AUTHORITY_INVALID`
- **کلاودفلر:** وضعیت SSL را روی **Full (Strict)** بگذارید و DNS را روی حالت پروکسی (ابر نارنجی) تنظیم کنید.
- **بدون کلاودفلر:** در اسکریپت گزینه ۱ (Let's Encrypt) را انتخاب کنید.

### 🔴 مشکل: خطای `502 Bad Gateway`
- اسکریپت `ssl.sh` را اجرا کنید تا برنامه را ریستارت کند.
