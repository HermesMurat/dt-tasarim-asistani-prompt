# DT Tasarım Asistanı — Prompt Sürümü

Tiyatro metinlerini inceleyen; dramaturji, sahne tasarımı ve karakter bazlı kostüm raporları hazırlayan bağımsız web uygulaması.

## Özellikler

- PDF, DOCX ve TXT oyun metni okuma
- Ayrıntılı dramaturjik analiz ve raporlama
- Sahne tasarımı ve kostüm tasarımı önerileri
- Her karakter için ayrı kostüm dosyası
- Sahne, kostüm, ışık ve afiş için profesyonel görsel promptları
- Prompt kopyalama, TXT indirme ve tarayıcıda yerel arşivleme
- Koyu tema ve mobil uyumlu arayüz

Bu sürüm doğrudan görsel üretmez. Böylece görsel üretim kotası tüketmez. Hazırlanan promptlar Gemini Canvas veya tercih edilen başka bir görsel üretim aracında kullanılabilir.

## Yerel çalıştırma

Gerekenler: Node.js 20 veya üzeri ve bir Gemini API anahtarı.

1. Bağımlılıkları kurun: `npm install`
2. `.env.local` dosyasında `GEMINI_API_KEY` değerini tanımlayın.
3. Uygulamayı başlatın: `npm run dev`

## Kontrol ve üretim

- Kod kontrolü: `npm run lint`
- Yayın paketi: `npm run build`
- Yayın paketini çalıştırma: `npm start`

API anahtarını GitHub'a yüklemeyin. Anahtarı yalnızca çalıştırdığınız platformun gizli değişkenler bölümünde `GEMINI_API_KEY` adıyla saklayın.

## Render ile yayınlama

Proje kökündeki `render.yaml`, uygulamayı ücretsiz bir Render Web Service olarak kurar. Yayın sırasında `GEMINI_API_KEY` değeri Render'ın gizli ortam değişkenleri bölümüne girilmelidir. Ücretsiz servis 15 dakika kullanılmadığında uyur; sonraki ilk açılış yaklaşık bir dakika sürebilir.
