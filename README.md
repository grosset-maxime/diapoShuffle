diapoShuffle
============

## Install

```
git clone https://github.com/grosset-maxime/diapoShuffle.git
```

Create and update `config/config.inc.php`.

Create and update `config/local.inc.php`.

## Mise en prod:

```
git fetch origin

git reset --hard origin/master
```

## Restart nginx

```
synoservicecfg --restart nginx
```

## nginx log

```
sudo tail -f /var/log/nginx/error.log
```

```
sudo tail -f /var/log/httpd/user-error_log
```
