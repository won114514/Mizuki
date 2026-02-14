---
title: MCY 商城系统 V4 安装教程
published: 2026-02-14T07:27:03
description: '创建一个基于 EasyBot 的 QQ 群机器人，实现MC与QQ群互通'
image: 'https://eopfapi.xiaowon.cn/pic?img=ua&mcy-install'
tags: ["萌次元商城", "MCY", "发卡系统"]
category: 云服务使用
draft: false 
lang: 'zh-CN'
---

# MCY 商城系统 V4 安装教程（CLI 架构）

> **适用对象**：有一定 Linux 服务器运维基础的开发者或站长  
> **系统要求**：仅支持 Linux 环境（不支持虚拟主机或 Windows）  
> **架构类型**：CLI（命令行服务模式），支持多站点部署

---

## 一、环境准备

在开始安装前，请确保你的服务器满足以下最低环境要求：

- **操作系统**：Linux（CentOS、Ubuntu、Debian 等主流发行版均可）
- **Web 服务器**：Nginx（任意版本）
- **数据库**：MySQL ≥ 5.6（推荐 MySQL 5.7 或 MariaDB 10.3+）
- **PHP**：**无需安装 PHP**（CLI 架构为独立二进制服务，不依赖 PHP-FPM）

> 💡 **提示**：如果你使用的是宝塔面板，建议选择「纯 Nginx」环境。

---

## 二、安装流程(以宝塔面板部署作为示例)

### 1. 下载并上传安装包

从官方渠道获取最新安装包 `mcy-latest.zip`，将其上传至服务器。例如，解压到网站根目录：

```bash
mkdir -p /www/wwwroot/mcy-shop
unzip mcy-latest.zip -d /www/wwwroot/mcy-shop
```

### 2. 设置执行权限

进入程序目录，并赋予主脚本可执行权限（**必须为 777**）：

```bash
cd /www/wwwroot/mcy-shop
chmod 777 bin console.sh
```

> ⚠️ 注意：权限不足将导致服务无法启动，切勿修改为 755 或其他。

### 3. 启动安装向导

执行以下命令启动内置 Web 安装服务：

```bash
./bin index.php
```

> 🔥 **重要**：此命令会启动一个临时 HTTP 服务（默认监听 `0.0.0.0:8080` 或随机端口），**SSH 窗口不能关闭**！否则安装进程会被终止。

### 4. 浏览器访问安装页面

根据终端输出的提示，用浏览器访问：

```
http://<你的服务器IP>:<端口号>
```

如果无法访问，请检查：
- 服务器防火墙是否放行该端口（如 `ufw allow 8080`）
- 云服务商安全组是否开放对应端口

按照网页引导完成数据库配置、管理员账号设置等步骤。

### 5. 配置 Nginx 反向代理

安装完成后，系统会提供一个反向代理地址（如 `http://127.0.0.1:9501`）。你需要在 Nginx 中配置反向代理，将域名请求转发给该地址。

#### 宝塔面板配置示例（新版）：
![new_nginx_1.png](..\assets\images\new_nginx_1.png)
1. 添加网站（域名如 `shop.example.com`）
2. 进入「反向代理」 → 「添加反向代理」
3. 目标 URL 填写 CLI 服务地址（如 `http://127.0.0.1:9501`）
4. 保存即可

> 📌 **SSL 证书申请注意**：在旧版宝塔中，申请 Let's Encrypt 证书前需**临时关闭反向代理**，否则验证失败。

### 6. 绑定主站域名

首次访问首页可能会提示“域名未绑定”。此时请登录后台：

```
http://你的域名/admin
```

在【系统设置】→【网站设置】中绑定主站域名，即可正常访问前台。

---

## 三、HTTPS 与 CDN 支持

- **启用 HTTPS**：在后台【系统设置】→【网站设置】中开启「HTTPS」选项。
- **CDN 获取真实 IP**：若使用 CDN 导致用户 IP 显示异常，请在相同位置调整「IP 获取模式」（通常设为 `X-Forwarded-For` 或 `CF-Connecting-IP` 等）。

---

## 四、数据迁移（从旧服务器迁移）

若你正在将现有站点迁移到新服务器，请严格遵循以下规则：

### 迁移前提：
- 数据库信息（地址、账号、密码、库名、表前缀）**必须完全一致**
- 程序路径**必须相同**（如原路径为 `/www/wwwroot/shop`，新服务器也需如此）

### 迁移步骤：
1. 导出原数据库（建议使用 phpMyAdmin 或 `mysqldump`）
2. 将程序文件完整复制到新服务器相同路径
3. 导入数据库到新服务器
4. 在新服务器执行：

```bash
cd /www/wwwroot/shop
chmod 777 bin/console.sh
./console.sh service.install
```

> ⚠️ 若路径或数据库信息不一致，**插件状态和配置数据可能丢失**，但核心功能不受影响。

---

## 五、V3 到 V4 数据迁移（特殊说明）

详细看这里：[V3 到 V4 数据迁移](https://wiki.mcy.im/#/zh-cn/started/cli-install?id=迁移数据)

## 六、常用控制台命令

在程序根目录下，可通过 `mcy` 命令管理服务：

```bash
mcy                    # 查看帮助菜单
mcy service.restart    # 重启服务
mcy service.stop       # 停止服务
mcy service.uninstall  # 卸载服务（彻底移除）
```

---

## 七、结语

MCY V4 的 CLI 架构带来了更高的性能与稳定性，尤其适合高并发商城场景。虽然安装过程略复杂，但一旦配置完成，后续维护非常简便。

希望本文能帮助你顺利完成部署！如有疑问，欢迎在评论区交流。
