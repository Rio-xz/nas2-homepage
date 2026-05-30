# NAS 服务入口

这是一个个人使用的纯静态 NAS 服务入口页，可直接双击打开，也可以部署到 Nginx 静态目录。

## 本地打开

进入项目目录后，直接双击 `index.html` 即可在浏览器中打开。

也可以在文件管理器中打开：

```text
index.html
```

## 部署到 Nginx

本仓库根目录就是静态站点目录。可以将仓库内容复制到 Nginx 的静态站点目录，例如：

```text
/usr/share/nginx/html/nas2-homepage
```

然后可以通过下面的地址访问：

```text
http://你的服务器地址/nas2-homepage/
```

如果希望作为站点根目录访问，可以把本仓库中的内容复制到 Nginx 的站点根目录，例如：

```text
/usr/share/nginx/html/
```

一个简单的 Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html/nas2-homepage;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

修改配置后重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 修改入口链接

所有入口链接都写在 `index.html` 中，直接修改对应卡片的 `href` 即可。

当前占位链接：

```html
<a class="service-link service-link--fnos" href="/fnos/">
```

```html
<a class="service-link service-link--overleaf" href="/overleaf/">
```

把 `href` 后面的地址替换成你的实际服务地址即可。
