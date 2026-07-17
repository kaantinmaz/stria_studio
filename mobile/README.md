# Stria Studio Mobile

Stria Studio müşterileri için Expo ve Expo Router tabanlı mobil uygulama.

## Geliştirme

Bağımlılıkları yükleyip geliştirme sunucusunu başlatın:

```bash
npm install
npx expo start
```

Varsayılan API adresi `http://127.0.0.1:8002`'dir. Farklı bir backend için public ortam değişkenini ayarlayın:

```bash
EXPO_PUBLIC_API_URL=https://admin.striastudio.com.tr npx expo start
```

API adresine `/api/app` eklemeyin; uygulama sözleşme yollarını kendisi ekler. Fiziksel cihazda geliştirme yaparken `127.0.0.1` yerine bilgisayarınızın yerel ağ adresini kullanın.

## Kontroller

```bash
npx tsc --noEmit
npx expo export --platform web
```
