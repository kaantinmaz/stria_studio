# Stria Studio Mobile

Stria Studio müşterileri için Expo ve Expo Router tabanlı mobil uygulama.

## Geliştirme

Bağımlılıkları yükleyip geliştirme sunucusunu başlatın:

```bash
npm install
npx expo start
```

Varsayılan API adresi `https://admin.striastudio.com.tr`'dir (production). Yerel backend'e karşı geliştirmek için public ortam değişkenini ayarlayın:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.X:8002 npx expo start
```

API adresine `/api/app` eklemeyin; uygulama sözleşme yollarını kendisi ekler.

## Kontroller

```bash
npx tsc --noEmit
npx expo export --platform web
```
