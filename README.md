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
