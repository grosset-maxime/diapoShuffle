diapoShuffle
============

## Mise en prod:

```
cd /var/services/web/diapoShuffle/

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
