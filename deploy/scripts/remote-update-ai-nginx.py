from pathlib import Path
from shutil import copyfile


CONF = Path("/etc/nginx/nginx.conf")
BACKUP = Path("/etc/nginx/nginx.conf.bak.blog-ai-deploy")

AI_ADMIN_BLOCK = """    location = /ai-admin {
        return 301 /ai-admin/;
    }

    location ^~ /ai-admin/assets/ {
        alias /usr/share/nginx/html/blog-ai-admin/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    location = /ai-admin/index.html {
        alias /usr/share/nginx/html/blog-ai-admin/index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    location /ai-admin/ {
        alias /usr/share/nginx/html/blog-ai-admin/;
        index index.html;
        try_files $uri $uri/ /ai-admin/index.html;
    }

"""

API_AI_BLOCK = """    # AI API（blog-ai-server，默认 3011）
    location ^~ /api-ai/ {
        proxy_pass http://127.0.0.1:3011/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

"""


def main() -> None:
    text = CONF.read_text()
    copyfile(CONF, BACKUP)

    admin_anchor = "    # /admin -> /admin/\n"
    api_anchor = "    # 聊天室 HTTP（chat-room-server，默认 3002）\n"

    if "location /ai-admin/" not in text:
        if admin_anchor not in text:
            raise RuntimeError("admin anchor not found in nginx.conf")
        text = text.replace(admin_anchor, AI_ADMIN_BLOCK + admin_anchor, 1)

    if "location ^~ /api-ai/" not in text:
        if api_anchor not in text:
            raise RuntimeError("api anchor not found in nginx.conf")
        text = text.replace(api_anchor, API_AI_BLOCK + api_anchor, 1)

    CONF.write_text(text)
    print("nginx.conf updated")


if __name__ == "__main__":
    main()
