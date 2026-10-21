# Türkçe Doğal Dil Modeli ile Renk Olmayan Kelime Tespiti (Word2Vec)

Bu uygulama, kullanıcı tarafından girilen 4 Türkçe kelimeyi doğal dil işleme (NLP) ve **Word2Vec** vektör uzayı analizi kullanarak inceler ve bu kelimeler arasından **hangisinin bir renk ismi olmadığını** tespit eder.

## Özellikler

- **Word2Vec 100 Boyutlu Türkçe Vektör Modeli**: Türkçe Vikipedi ve geniş metin derlemleri üzerinde eğitilmiş 100 boyutlu Word2Vec kelime vektörlerini kullanır.
- **Kosinüs Benzerliği (Cosine Similarity) & Ağırlık Merkezi (Centroid) Tespiti**: Gensim `doesnt_match` algoritması mantığı ile 4 kelimenin anlamsal küme merkezini ve renk uzayına olan mesafesini hesaplar.
- **2B Semantik Vektör Uzayı Görselleştirmesi**: PCA (Temel Bileşen Analizi) indirgemesi ile kelimelerin renk kümesi ve diğer kavramlar arasındaki 2 boyutlu konumunu interaktif grafik üzerinde gösterir.
- **Biçimsel Dilbilgisi ve Kök Analizi**: Türkçe ekleri (çoğul, yönelme, bulunma, türetme ekleri vb.) ve bileşik renk tanımlarını (örn. *açık mavi*, *mavimsi*) tanıyan morfolojik analiz katmanı.
- **Çoklu Çıktı Formatları**:
  - **Görsel Arayüz (HTML & CSS)**: Modern, duyarlı ve temiz kullanıcı arayüzü.
  - **JSON Çıktısı**: Tüm vektör skorlarını, benzerlik oranlarını ve aykırı değer analizini içeren ham JSON görünümü ve kopyalama/indirme desteği.
  - **Tek Dosya HTML Dışa Aktarma**: Harici sunucu gerektirmeden çalışan bağımsız HTML/CSS paketi.
- **%100 İstemci Taraflı (Static) Çalışma**: Herhangi bir arka uç sunucusuna ihtiyaç duymadan doğrudan tarayıcı üzerinde yüksek hızda çalışır.

## Algoritma ve Çalışma Mantığı

1. **Vektör Çıkarımı**: Girilen 4 kelimenin her biri için 100 boyutlu kelime gömme vektörü ($\vec{v}_i$) elde edilir.
2. **Renk Uzayı Benzerliği**: Her kelimenin, temel Türkçe renklerin ağırlık merkezine ($\vec{C}_{\text{renk}}$) olan kosinüs benzerliği hesaplanır:
   $$\text{sim}(w_i, \vec{C}_{\text{renk}}) = \frac{\vec{v}_i \cdot \vec{C}_{\text{renk}}}{\|\vec{v}_i\| \|\vec{C}_{\text{renk}}\|}$$
3. **Küme İçi Aykırılık (Outlier) Analizi**: 4 kelimenin ortalama vektörü ($\vec{\mu}$) hesaplanır ve gruba en uzak (en düşük benzerliğe sahip) kelime belirlenir:
   $$\text{Aykırı Kelime} = \arg\min_{i} \left( \frac{\vec{v}_i \cdot \vec{\mu}}{\|\vec{v}_i\| \|\vec{\mu}\|} \right)$$
4. **Karar ve Güven Skoru**: Renk benzerliği skoru ve küme içi benzerlik harmanlanarak renk olmayan kelime gerekçesiyle birlikte kullanıcıya sunulur.

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim (Production / Static Build) derlemesi oluşturun
npm run build

# Derlenen statik çıktıyı önizleyin
npm run preview
```

## Proje Yapısı

```
├── public/
│   └── data/
│       └── word2vec_tr.json     # 100-boyutlu Türkçe kelime vektörleri ve renk uzayı
├── src/
│   ├── components/              # Vektör grafiği, JSON modalı, skor kartları
│   ├── data/                    # Çekirdek renk sözlüğü ve renk kodları
│   ├── utils/                   # Word2Vec benzerlik ve Türkçe morfoloji motoru
│   ├── App.tsx                  # Ana uygulama bileşeni
│   ├── main.tsx                 # Giriş noktası
│   └── index.css                # Stil dosyası
├── index.html                   # HTML şablonu
├── package.json                 # Paket yapılandırması
├── tsconfig.json                # TypeScript yapılandırması
├── vercel.json                  # Vercel statik barındırma kuralları
└── vite.config.ts               # Vite yapılandırması
```

## Dağıtım (Deployment)

Bu proje tamamen statik bir React + Vite uygulamasıdır. `npm run build` komutu ile oluşturulan `dist` klasörü herhangi bir statik barındırma platformunda (Vercel, GitHub Pages, Netlify vb.) sıfır yapılandırma ile doğrudan çalıştırılabilir.
