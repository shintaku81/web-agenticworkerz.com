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
ssh -i ~/.ssh/id_ed25519 awz-admin@192.168.68.210
cd /opt/agenticworkerz && docker compose up -d
