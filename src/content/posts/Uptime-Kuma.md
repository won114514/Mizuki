---
title: Uptime Kuma 部署指南
published: 2025-08-19T10:58:17
description: 'Uptime-Kuma 是一个用于监控网站和服务状态的开源工具。它可以帮助你实时监控你的网站是否正常运行，以及在网站出现问题时及时收到通知。'
image: 'https://eopfapi.xiaowon.cn/pic?img=ua&Uptime-Kuma'
tags: ['Uptime-Kuma', '网站监控']
category: 云服务使用

draft: false 
lang: 'zh-CN'
---
# Uptime Kuma 部署指南

> 一款开源的服务器/网站监控工具，提供类似 Uptime Robot 的功能

## 目录

+   服务器面板部署
    +   宝塔面板安装
    +   1Panel面板安装
+   Docker通用部署
    +   基础Docker部署
    +   Docker Compose部署
    +   反向代理配置
+   初始配置指南
+   维护与升级
+   常见问题
+   安全建议
* * *
## 服务器面板部署

### 宝塔面板安装


1. 登录宝塔面板
2. 进入软件商店
3. 搜索 Uptime Kuma
4. 点击安装
5. 设置安装路径
6. 确认安装
7. 安装完成

**具体步骤：**

1.  登录宝塔面板（`https://服务器IP:面板端口`）
2.  左侧导航栏点击「软件商店」
3.  搜索框中输入 "Uptime Kuma"
4.  找到应用后点击「安装」
5.  设置安装路径（默认路径即可）
6.  点击「提交」开始安装
7.  安装完成后，通过 `http://服务器IP:3001` 访问


> **注意**：如果安装后无法访问，请检查宝塔防火墙是否放行3001端口

* * *

### 1Panel面板安装

1. 登录1Panel
2. 进入应用商店
3. 搜索 Uptime Kuma
4. 点击安装
5. 配置容器参数
6. 确认部署
7. 访问服务

**操作流程：**
1.  登录1Panel面板（通常为 `http://服务器IP:10080`）
2.  左侧菜单选择「应用商店」
3.  搜索 "Uptime Kuma"
4.  点击「安装」按钮
5.  配置容器参数：
    +   容器名称：`uptime-kuma`
    +   端口映射：3001:3001
    +   持久化存储：建议挂载 `/app/data` 目录
6.  点击「确认」开始部署
7.  部署完成后，通过 `http://服务器IP:3001` 访问
* * *
## Docker通用部署

### 基础Docker部署

```bash
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```
如果您想要限制对本地主机的暴露（而不向其他用户公开端口或使用反向代理），您可以像这样公开端口：
```bash
docker run -d --restart=always -p 127.0.0.1:3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```


**参数说明：**

+   `-p 3001:3001`：将容器内3001端口映射到宿主机

+   `-v /path/to/data:/app/data`：持久化数据存储

+   `--restart=always`：容器随Docker自动启动
* * *

### Docker Compose部署

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: uptime-kuma
    volumes:
      - ./uptime-kuma-data:/app/data
    ports:
      - "3001:3001"
    restart: always
```

构建命令：
```bash
docker compose up -d
```
启动服务：
```bash
docker start 容器名（uptime-kuma）
```
重启服务：
```bash
docker restart 容器名（uptime-kuma）
```
停止服务：
```bash
docker stop 容器名（uptime-kuma）
```

* * *

### 反向代理配置

**Nginx配置示例：**

nginx:
```conf
server {
    listen 80;
    server_name status.example.com; # 替换为你的域名

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**启用HTTPS（使用Let's Encrypt）：**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d status.example.com
```
替换`status.example.com`为实际域名。 Certbot 会自动修改 Nginx 配置文件并启用 HTTPS。
重启Nginx
* * *

## 初始配置指南

1.  **首次访问**：`http://服务器IP:3001` 或配置的域名

2.  **创建管理员账户**：
    +   输入用户名和密码
    +   建议使用强密码
3.  **添加监控项**：
    +   点击右上角 "+" 按钮
    +   选择监控类型：HTTP(s)、TCP、Ping等
    +   输入监控名称和URL/地址
    +   设置心跳间隔和超时时间
4.  **配置通知**：
    +   进入「Settings」>「Notifications」
    +   支持：Telegram、Discord、Slack、Email等
    +   按提示配置通知渠道
5.  **仪表板自定义**：
    +   拖拽组件调整布局
    +   添加状态页公共链接
    +   设置主题颜色

* * *

## 维护与升级

**备份数据：**
```bash
# 备份数据目录
tar -czvf uptime-kuma-backup-$(date +%F).tar.gz /path/to/data
```

**升级版本：**
```bash
# 停止并删除旧容器
docker stop uptime-kuma
docker rm uptime-kuma

# 拉取最新镜像
docker pull louislam/uptime-kuma:latest

# 重新启动容器（使用原参数）
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

* * *

## 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 无法访问3001端口 | 检查防火墙设置：`sudo ufw allow 3001` |
| 数据丢失 | 检查挂载目录权限：`sudo chown -R 1000:1000 /path/to/data` |
| 通知不工作 | 检查通知配置，查看容器日志：`docker logs uptime-kuma` |
| 高内存占用 | 添加环境变量：`-e DISABLE_ANALYTICS=1` |
| 更新后无法启动 | 检查数据目录权限，尝试回滚到旧版本 |

* * *

## 安全建议

1.  **强制HTTPS访问**：
    +   通过反向代理启用SSL
    +   设置HSTS头部
2.  **访问控制**：
    ```conf
    # Nginx IP限制示例
    location / {
        allow 192.168.1.0/24;
        deny all;
        # ...其他代理设置
    }
    ```

3.  **账户安全**：
    +   启用双因素认证（2FA）
    +   使用强密码策略
    +   定期轮换密码
4.  **数据保护**：
    +   定期备份`/app/data`目录
    +   加密备份文件
    +   测试恢复流程
5.  **监控自身健康**：
    ```bash
    # 监控Uptime Kuma服务的简单脚本
    curl -I http://localhost:3001 -s | grep "HTTP/1.1 200"
    if [ $? -ne 0 ]; then
      docker restart uptime-kuma
      echo "Uptime Kuma restarted at $(date)" >> /var/log/uptime-kuma-monitor.log
    fi
    ```
**推荐架构：**
1. **独立部署服务器**：
    - 将Uptime Kuma部署在专用的服务器（或VPS）上，这台服务器不运行任何其他关键业务。
    - 目的：避免因被监控的服务器的故障（如资源耗尽、宕机）导致监控系统同时不可用。
2. **反向代理配置**：
    - 使用Nginx或Caddy作为反向代理，将Uptime Kuma的服务（默认3001端口）暴露到80/443端口。
    - 配置SSL证书（如Let's Encrypt）启用HTTPS，确保通信安全。
    - 反向代理服务器可以与Uptime Kuma在同一台机器，也可以分开（更推荐分开，但考虑到成本，同一台也可接受）。
3. **多节点监控**（可选但推荐）：
    - 如果监控目标分布在不同的地理位置，建议在多个地区部署Uptime Kuma实例，然后通过主实例汇总状态（需要Uptime Kuma企业版或自行开发集成）。
    - 或者使用第三方多地点监控服务作为补充。
4. **数据持久化**：
    - 确保Uptime Kuma的数据目录（`/app/data`）被持久化存储，并定期备份。
    - 备份策略：每天备份数据目录，并传输到另一台服务器或云存储。
5. **监控目标分布**：
    - 被监控的服务应分布在不同的服务器上，避免单一服务器故障导致多个服务同时不可用。
    - 关键服务至少设置两个不同的监控节点（如果有多台监控服务器）。
6. **通知冗余**：
    - 配置至少两种不同的通知方式（如Email + Telegram），避免单一通知渠道失效。
    - 重要通知可以设置多个接收人。
7. **安全措施**：
    - 防火墙设置：只允许反向代理服务器访问Uptime Kuma的3001端口，禁止公网直接访问。
    - 启用双因素认证（2FA）保护Uptime Kuma的管理员账户。
    - 定期更新Uptime Kuma版本。
8. **自监控**：
    - 使用另一个独立的监控服务（如另一台Uptime Kuma实例、Uptime Robot免费版）来监控当前Uptime Kuma的状态页。
    - 或者编写简单的cron脚本，当Uptime Kuma不可用时发送通知（但这种方法有局限性，因为如果服务器完全宕机，cron脚本也无法运行）。
9. **资源隔离**：
    - 如果使用Docker部署，可以为容器设置资源限制（CPU、内存），避免监控服务本身占用过多资源。
10. **日志监控**：
    - 收集Uptime Kuma的日志，并定期检查错误信息。

`推荐将Uptime Kuma部署在独立的服务器上，该服务器不运行其他关键业务。通过Nginx反向代理提供HTTPS访问，并配置防火墙规则仅允许反向代理访问监控服务。被监控的服务应分布在多个服务器上，避免单点故障。同时，配置至少两种通知方式（如邮件和Telegram）确保告警可达。定期备份Uptime Kuma的数据目录，并使用另一台独立的监控服务器或第三方服务来监控Uptime Kuma自身的可用性。`

> 提示：建议将Uptime Kuma部署在与被监控服务不同的服务器上，避免单点故障影响监控功能
