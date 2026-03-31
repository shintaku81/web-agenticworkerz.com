# Strapi Setup

- Host: 192.168.68.210:1337
- Admin: http://192.168.68.210:1337/admin（初回アクセスで管理者アカウント作成）
- DB: PostgreSQL on 192.168.68.210
- Docker Compose: /opt/agenticworkerz/docker-compose.yml

## コンテンツタイプ（管理画面から作成）
- Article: title, slug, excerpt, content(richtext), category, tags, author, publishedAt
- Event: title, slug, description, date, location, capacity, registrationUrl
- CTA: label, href, variant(primary/secondary)
- Category: name, slug
- Tag: name, slug
- Author: name, role, bio, avatar

## 起動
```bash
ssh -i ~/.ssh/id_ed25519 awz-admin@192.168.68.210
cd /opt/agenticworkerz && docker compose up -d
```

## 初回セットアップ手順

### 1. Docker / Docker Compose の確認・インストール
```bash
docker --version && docker compose version
```
なければ apt でインストール:
```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

### 2. ディレクトリ作成
```bash
sudo mkdir -p /opt/agenticworkerz/strapi
sudo mkdir -p /opt/agenticworkerz/strapi/data
sudo mkdir -p /opt/agenticworkerz/postgres-data
sudo chown -R $USER:$USER /opt/agenticworkerz
```

### 3. docker-compose.yml を作成（/opt/agenticworkerz/docker-compose.yml）
```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: strapi_db
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi_secret_2026
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  strapi:
    image: node:20-alpine
    working_dir: /srv/app
    volumes:
      - ./strapi:/srv/app
    ports:
      - "1337:1337"
    environment:
      HOST: 0.0.0.0
      PORT: 1337
      APP_KEYS: toBeModified1,toBeModified2
      API_TOKEN_SALT: tobemodified
      ADMIN_JWT_SECRET: tobemodified
      TRANSFER_TOKEN_SALT: tobemodified
      JWT_SECRET: tobemodified
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi_db
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: strapi_secret_2026
      NODE_ENV: development
    depends_on:
      - postgres
    command: sh -c "if [ ! -f package.json ]; then npx create-strapi-app@latest . --no-run --dbclient=postgres --dbhost=postgres --dbport=5432 --dbname=strapi_db --dbusername=strapi --dbpassword=strapi_secret_2026; fi && npm run develop"
    restart: unless-stopped
```

### 4. Strapi を起動
```bash
cd /opt/agenticworkerz
docker compose up -d postgres
sleep 10
docker compose up -d strapi
```

### 5. 起動確認
ログで "Welcome to Strapi" が出るまで待つ（最大5分）:
```bash
docker compose logs -f strapi
```
API レスポンス確認:
```bash
curl http://localhost:1337/api/articles
```
