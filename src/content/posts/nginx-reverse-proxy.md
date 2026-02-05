---
title: Nginx反向代理 教程|文档
published: 2025-09-23T21:46:59
description: 'Nginx反向代理 教程|文档 反向代理是重要的功能，nginx提供了反向代理功能，本文将详细介绍nginx反向代理的配置方法。'
image: 'https://eopfapi.xiaowon.cn/pic?img=ua&nginx-reverse-proxy'
tags: ['Nginx', '反向代理', '教程', '文档']
category: 云服务使用
draft: false 
lang: 'zh-CN'
---
# Nginx 反向代理配置文档

## 1. 概述

Nginx 是一款高性能的 HTTP 和反向代理服务器，常用于负载均衡、缓存、安全防护等场景。反向代理是指客户端请求发送到代理服务器，由代理服务器将请求转发给后端真实服务器，并将响应结果返回给客户端，客户端并不知道后端服务器的存在。

### 1.1 正向代理 vs 反向代理

| 类型       | 代理对象 | 客户端是否感知 | 典型用途               |
|------------|----------|----------------|------------------------|
| 正向代理   | 客户端   | 知道           | 翻墙、访问控制         |
| **反向代理** | 服务器   | **不知道**     | **负载均衡、安全、缓存** |

---

## 2. 基础配置语法

### 2.1 基本结构

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

upstream backend_server {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}
```

---

## 3. 关键指令详解

### 3.1 `proxy_pass`

定义后端服务器地址。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000/;  # 注意结尾斜杠
}
```

> ⚠️ 注意：`proxy_pass` 后是否带 `/` 会影响 URL 路径转发行为。

### 3.2 `proxy_set_header`

设置转发给后端的请求头。

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### 3.3 `proxy_redirect`

修改后端返回的 `Location` 和 `Refresh` 头。

```nginx
proxy_redirect off;
# 或
proxy_redirect http://backend/ /;
```

### 3.4 `proxy_buffering`

启用/禁用响应缓冲（默认开启）。

```nginx
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

### 3.5 `proxy_connect_timeout`, `proxy_read_timeout`

设置超时时间（单位：秒）。

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## 4. 实用配置示例

### 4.1 单后端服务器代理

```nginx
server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.2 负载均衡配置（Upstream）

```nginx
upstream backend {
    server 10.0.0.1:8080 weight=3;   # 权重3
    server 10.0.0.2:8080 weight=1;
    server 10.0.0.3:8080 backup;     # 备用服务器
}

server {
    listen 80;
    server_name loadbalance.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 负载均衡策略：

- `轮询（默认）`：按顺序分配
- `weight`：权重分配
- `ip_hash`：根据客户端IP分配（会话保持）
- `least_conn`：最少连接优先
- `hash $request_uri consistent`：一致性哈希

### 4.3 WebSocket 代理支持

```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### 4.4 HTTPS 反向代理

```nginx
server {
    listen 443 ssl http2;
    server_name secure.example.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;  # 告知后端是HTTPS
    }
}
```

### 4.5 缓存配置（可选）

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_pass http://backend;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

---

## 5. 安全与优化建议

### 5.1 隐藏 Nginx 版本号

```nginx
server_tokens off;
```

### 5.2 限制请求大小和速率

```nginx
client_max_body_size 10M;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://backend;
}
```

### 5.3 启用 Gzip 压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 5.4 设置合理的超时与缓冲

```nginx
proxy_connect_timeout 5s;
proxy_send_timeout 10s;
proxy_read_timeout 30s;
proxy_buffering on;
proxy_buffer_size 16k;
proxy_buffers 4 64k;
```

---

## 6. 调试与日志

### 6.1 自定义日志格式

```nginx
log_format upstream_time '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $body_bytes_sent '
                         '"$http_referer" "$http_user_agent" '
                         'rt=$request_time uct="$upstream_connect_time" uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/access.log upstream_time;
```

### 6.2 调试代理问题

在 `location` 块中添加：

```nginx
add_header X-Upstream $upstream_addr;
add_header X-Upstream-Status $upstream_status;
add_header X-Upstream-Response-Time $upstream_response_time;
```

---

## 7. 重载配置

修改配置后执行：

```bash
# 测试配置语法
nginx -t

# 重载配置（不中断服务）
nginx -s reload

# 或使用系统服务
systemctl reload nginx
```

---

## 8. 常见问题排查

### ❌ 502 Bad Gateway
- 后端服务未启动
- `proxy_pass` 地址错误
- 防火墙/安全组阻止连接

### ❌ 504 Gateway Timeout
- 后端处理超时 → 增大 `proxy_read_timeout`
- 网络延迟过高

### ❌ WebSocket 连接失败
- 未设置 `proxy_http_version 1.1` 和 `Upgrade/Connection` 头

### ❌ 静态资源 404
- 检查 `proxy_pass` 路径是否匹配
- 检查后端应用路由配置

---

## 9. 完整示例配置文件

```nginx
# /etc/nginx/sites-available/myapp

upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name myapp.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myapp.example.com;

    ssl_certificate /etc/letsencrypt/live/myapp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.example.com/privkey.pem;

    access_log /var/log/nginx/myapp.access.log;
    error_log /var/log/nginx/myapp.error.log;

    client_max_body_size 20M;

    location / {
        proxy_pass http://app_servers;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 30s;

        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 4 64k;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源缓存（可选）
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 10. 参考资料

- [Nginx 官方文档 - ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Nginx 负载均衡指南](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
- [Mozilla SSL 配置生成器](https://ssl-config.mozilla.org/)

---

✅ 本配置文档适用于 Nginx 1.18+ 版本，建议在生产环境前进行充分测试。