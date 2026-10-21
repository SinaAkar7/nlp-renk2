import zipfile
import struct
import math
import json
import os

print("Starting Word2Vec Turkish model extraction...")

zip_path = 'public/assets/aistudio/word2vecTRmodel100_e0db92f0.zip'
if not os.path.exists(zip_path):
    raise FileNotFoundError(f"{zip_path} not found")

# Turkish color list with approximate HEX representation
color_hex_map = {
    'kırmızı': '#EF4444', 'al': '#DC2626', 'kızıl': '#B91C1C', 'mavi': '#3B82F6', 'gök': '#60A5FA',
    'yeşil': '#10B981', 'sarı': '#EAB308', 'mor': '#A855F7', 'turuncu': '#F97316', 'pembe': '#EC4899',
    'siyah': '#18181B', 'kara': '#09090B', 'beyaz': '#F8FAFC', 'ak': '#F1F5F9', 'gri': '#71717A',
    'kahverengi': '#78350F', 'lacivert': '#1E3A8A', 'turkuaz': '#06B6D4', 'bordo': '#881337',
    'bej': '#D6C7A1', 'eflatun': '#9333EA', 'haki': '#57534E', 'zümrüt': '#059669', 'yakut': '#BE123C',
    'kehribar': '#D97706', 'somon': '#FB7185', 'hardal': '#CA8A04', 'vişne': '#9F1239', 'leylak': '#C084FC',
    'füme': '#475569', 'fildişi': '#FEF3C7', 'safran': '#F59E0B', 'taba': '#92400E', 'nefti': '#064E3B',
    'mercan': '#F43F5E', 'kestane': '#451A03', 'altın': '#EAB308', 'gümüş': '#94A3B8', 'bronz': '#B45309',
    'platin': '#E2E8F0', 'şampanya': '#FDE68A', 'macenta': '#D946EF', 'siyan': '#06B6D4', 'lila': '#DDD6FE',
    'amber': '#F59E0B', 'fuşya': '#E11D48', 'tarçın': '#78350F', 'erguvan': '#7E22CE', 'camgöbeği': '#38BDF8',
    'krem': '#FEF9C3', 'antrasit': '#334155', 'vizon': '#78716C', 'bakır': '#B45309', 'kemik': '#FAF5FF',
    'saman': '#FDE047', 'zeytuni': '#4D7C0F', 'devetüyü': '#D4B996', 'petrol': '#0F766E', 'kurşuni': '#64748B',
    'hardaliye': '#A16207', 'kum': '#E7D7C1', 'pas': '#9A3412', 'limon': '#FACC15', 'portakal': '#FB923C',
    'menekşe': '#6D28D9', 'nane': '#6EE7B7', 'mint': '#6EE7B7', 'yavruağzı': '#FCA5A5', 'çivit': '#4338CA',
    'hazel': '#8D6E63', 'indigo': '#3949AB', 'lavanta': '#B39DDB', 'zümrüt yeşili': '#059669'
}

categories = {
    'renk': list(color_hex_map.keys()) + ['renk', 'renkler', 'ton', 'tonu', 'renkli', 'renksiz'],
    'hayvan': [
        'kedi', 'köpek', 'at', 'kuş', 'balık', 'aslan', 'kaplan', 'fil', 'kartal', 'ayı', 'kurt', 'tilki',
        'tavşan', 'geyik', 'maymun', 'zürafa', 'deve', 'koyun', 'keçi', 'inek', 'boğa', 'manda', 'eşek',
        'domuz', 'tavuk', 'horoz', 'hindi', 'ördek', 'kaz', 'güvercin', 'karga', 'papağan', 'serçe',
        'leylek', 'baykuş', 'şahin', 'doğan', 'akbaba', 'kuğu', 'pelikan', 'martı', 'flamingo', 'yılan',
        'timsah', 'kaplumbağa', 'kertenkele', 'bukalemun', 'kurbağa', 'balina', 'yunus', 'köpekbalığı',
        'ahtapot', 'kalamar', 'yengeç', 'ıstakoz', 'karides', 'denizanası', 'arı', 'karınca', 'sinek',
        'sivrisinek', 'kelebek', 'böcek', 'örümcek', 'akrep', 'tırtıl', 'solucan', 'fare', 'sıçan',
        'sincap', 'kirpi', 'köstebek', 'yarasa', 'kanguru', 'koala', 'panda', 'jaguar', 'leopar', 'çita',
        'zebra', 'hipopotam', 'gergedan', 'ayı', 'kutup', 'fok', 'penguen'
    ],
    'yiyecek': [
        'elma', 'armut', 'muz', 'mandalina', 'çilek', 'kiraz', 'erik', 'şeftali', 'kayısı', 'karpuz',
        'kavun', 'üzüm', 'incir', 'nar', 'dut', 'ayva', 'kivi', 'ananas', 'avokado', 'mango', 'domates',
        'salatalık', 'biber', 'patlıcan', 'kabak', 'patates', 'soğan', 'sarımsak', 'havuç', 'turp',
        'marul', 'ıspanak', 'pırasa', 'lahana', 'karnabahar', 'brokoli', 'bezelye', 'fasulye', 'nohut',
        'mercimek', 'pirinç', 'bulgur', 'buğday', 'mısır', 'ekmek', 'simit', 'poğaça', 'börek',
        'makarna', 'pizza', 'hamburger', 'çorba', 'pilav', 'köfte', 'kebap', 'döner', 'et', 'sucuk',
        'sosis', 'salam', 'peynir', 'yoğurt', 'süt', 'tereyağı', 'yumurta', 'zeytin', 'bal', 'reçel',
        'helva', 'tatlı', 'baklava', 'pasta', 'kek', 'kurabiye', 'çikolata', 'dondurma', 'fındık',
        'fıstık', 'ceviz', 'badem', 'leblebi', 'çekirdek', 'çay', 'kahve', 'su', 'ayran', 'şeker', 'tuz'
    ],
    'taşıt': [
        'araba', 'otomobil', 'otobüs', 'minibüs', 'kamyon', 'kamyonet', 'tır', 'taksi', 'ambulans',
        'itfaiye', 'motosiklet', 'motor', 'bisiklet', 'scooter', 'tren', 'tramvay', 'metro', 'metrobüs',
        'vapur', 'gemi', 'feribot', 'tekne', 'kayık', 'sandal', 'yat', 'yelkenli', 'bot', 'denizaltı',
        'uçak', 'helikopter', 'zeplin', 'balon', 'roket', 'traktör', 'dozer', 'vinç', 'araç', 'vasıta'
    ],
    'eşya': [
        'masa', 'sandalye', 'koltuk', 'kanepe', 'sehpa', 'dolap', 'gardırop', 'yatak', 'baza', 'komodin',
        'çekmece', 'halı', 'kilim', 'perde', 'ayna', 'lamba', 'avize', 'tablo', 'vazo', 'saksı', 'kapı',
        'pencere', 'duvar', 'tavan', 'zemin', 'anahtar', 'kilit', 'telefon', 'bilgisayar', 'tablet',
        'laptop', 'televizyon', 'radyo', 'kulaklık', 'hoparlör', 'kamera', 'fotoğraf', 'şarj', 'pil',
        'kablo', 'priz', 'fener', 'saat', 'gözlük', 'cüzdan', 'çanta', 'valiz', 'bavul', 'şemsiye',
        'tarak', 'fırça', 'sabun', 'şampuan', 'havlu', 'makas', 'bıçak', 'çatal', 'kaşık', 'tabak',
        'kase', 'bardak', 'kupa', 'fincan', 'sürahi', 'şişe', 'kavanoz', 'tencere', 'tava', 'çaydanlık',
        'cezve', 'tepsi', 'rende', 'fırın', 'ocak', 'buzdolabı', 'bulaşık', 'çamaşır', 'süpürge', 'ütü',
        'kalem', 'defter', 'kitap', 'silgi', 'cetvel', 'pergel', 'zımba', 'ataş', 'bant', 'yapıştırıcı',
        'dosya', 'klasör', 'zarf', 'kağıt', 'karton', 'gazete', 'dergi', 'çekiç', 'çivi', 'vida',
        'tornavida', 'pense', 'testere', 'matkap', 'metre', 'kürek', 'kova', 'sünger', 'çöp'
    ],
    'giyim': [
        'gömlek', 'tişört', 'kazak', 'hırka', 'yelek', 'ceket', 'mont', 'palto', 'kaban', 'yağmurluk',
        'pantolon', 'kot', 'şort', 'etek', 'elbise', 'takım', 'pijama', 'eşofman', 'tayt', 'çorap',
        'ayakkabı', 'bot', 'çizme', 'terlik', 'sandalet', 'şapka', 'bere', 'atkı', 'eldiven', 'kemer',
        'kravat', 'papyon', 'küpe', 'kolye', 'bilezik', 'yüzük', 'broş', 'kıyafet', 'giysi'
    ],
    'doğa': [
        'dağ', 'tepe', 'ova', 'vadi', 'kanyon', 'orman', 'ağaç', 'fidan', 'çimen', 'ot', 'çiçek', 'gül',
        'lale', 'papatya', 'yaprak', 'dal', 'kök', 'tohum', 'deniz', 'okyanus', 'göl', 'nehir', 'ırmak',
        'dere', 'şelale', 'ada', 'kıyı', 'sahil', 'kumsal', 'plaj', 'kaya', 'taş', 'çakıl', 'kum',
        'toprak', 'mağara', 'volkan', 'gökyüzü', 'güneş', 'ay', 'yıldız', 'bulut', 'sis', 'duman',
        'hava', 'rüzgar', 'fırtına', 'yağmur', 'kar', 'dolu', 'gökkuşağı', 'şimşek', 'yıldırım', 'deprem'
    ],
    'mekan': [
        'ev', 'apartman', 'villa', 'köşk', 'saray', 'kale', 'kule', 'çadır', 'okul', 'üniversite',
        'kütüphane', 'müze', 'tiyatro', 'sinema', 'stadyum', 'hastane', 'eczane', 'banka', 'otel',
        'restoran', 'kafe', 'pastane', 'fırın', 'market', 'bakkal', 'dükkan', 'çarşı', 'pazar',
        'fabrika', 'depo', 'garaj', 'liman', 'havaalanı', 'istasyon', 'durak', 'sokak', 'cadde',
        'bulvar', 'meydan', 'park', 'bahçe', 'yol', 'köprü', 'tünel', 'şehir', 'kent', 'köy', 'mahalle'
    ],
    'insan': [
        'insan', 'kişi', 'adam', 'kadın', 'çocuk', 'bebek', 'genç', 'yaşlı', 'anne', 'baba', 'oğul',
        'kız', 'kardeş', 'abi', 'abla', 'dede', 'nine', 'amca', 'dayı', 'hala', 'teyze', 'kuzen',
        'arkadaş', 'komşu', 'doktor', 'hemşire', 'dişçi', 'öğretmen', 'profesör', 'öğrenci', 'mühendis',
        'mimar', 'avukat', 'hakim', 'polis', 'asker', 'itfaiyeci', 'pilot', 'kaptan', 'şoför', 'garson',
        'aşçı', 'terzi', 'berber', 'kuaför', 'marangoz', 'elektrikçi', 'boyacı', 'tamirci', 'çiftçi',
        'yazar', 'şair', 'gazeteci', 'sanatçı', 'ressam', 'müzisyen', 'şarkıcı', 'oyuncu', 'sporcu',
        'futbolcu', 'başkan', 'müdür', 'memur', 'işçi', 'sekreter'
    ],
    'soyut': [
        'zaman', 'hayat', 'ömür', 'sevgi', 'aşk', 'mutluluk', 'huzur', 'korku', 'öfke', 'hüzün',
        'umut', 'rüya', 'düşünce', 'fikir', 'akıl', 'zeka', 'bilgi', 'hafıza', 'başarı', 'güç',
        'kuvvet', 'barış', 'özgürlük', 'adalet', 'hak', 'hukuk', 'kanun', 'düzen', 'sanat', 'müzik',
        'şiir', 'edebiyat', 'bilim', 'felsefe', 'tarih', 'gelecek', 'geçmiş', 'anlam', 'hedef', 'amaç'
    ],
    'eylem': [
        'koşmak', 'yürümek', 'oturmak', 'kalkmak', 'uyumak', 'uyanmak', 'yemek', 'içmek', 'okumak',
        'yazmak', 'çizmek', 'boyamak', 'dinlemek', 'izlemek', 'bakmak', 'görmek', 'duymak', 'hissetmek',
        'düşünmek', 'anlamak', 'öğrenmek', 'öğretmek', 'sevmek', 'istemek', 'aramak', 'bulmak', 'almak',
        'vermek', 'satmak', 'açmak', 'kapatmak', 'başlamak', 'bitirmek', 'çalışmak', 'oynamak', 'gülmek',
        'ağlamak', 'konuşmak', 'söylemek', 'sormak', 'gitmek', 'gelmek', 'dönmek', 'uçmak', 'yüzmek'
    ]
}

# Build target word set with priority
target_word_to_cat = {}
for cat, wlist in categories.items():
    for w in wlist:
        w_clean = w.strip().lower()
        if w_clean not in target_word_to_cat:
            target_word_to_cat[w_clean] = cat

print(f"Total curated category words: {len(target_word_to_cat)}")

# Open zip and load model
z = zipfile.ZipFile(zip_path)
vectors = {}
word_freq_rank = {}

with z.open('word2vecTRmodel100/trModel100') as f:
    header = f.readline().decode('utf-8').strip()
    vocab_size, dim = map(int, header.split())
    print(f"Model vocab size: {vocab_size}, dimension: {dim}")

    count = 0
    # Also grab top 1500 general most frequent words if clean
    top_general_limit = 1500
    top_general_collected = 0

    while count < vocab_size:
        word_bytes = b''
        while True:
            ch = f.read(1)
            if not ch or ch == b' ': break
            word_bytes += ch
        if not word_bytes: break
        word = word_bytes.decode('utf-8', errors='ignore').strip().lower()
        vec_bytes = f.read(4 * dim)
        
        is_curated = word in target_word_to_cat
        is_clean_turkish = len(word) >= 3 and word.isalpha() and not word.startswith(('http', 'www', 'jpg', 'png', 'svg', 'ref'))

        if is_curated or (top_general_collected < top_general_limit and is_clean_turkish):
            if word not in vectors:
                vec = struct.unpack(f'{dim}f', vec_bytes)
                vectors[word] = vec
                word_freq_rank[word] = count
                if not is_curated:
                    top_general_collected += 1
                    target_word_to_cat[word] = 'genel'

        count += 1
        if count % 100000 == 0:
            print(f"Processed {count}/{vocab_size} words, collected {len(vectors)} vectors...")

print(f"Total collected vectors: {len(vectors)}")

def dot_prod(v1, v2):
    return sum(a * b for a, b in zip(v1, v2))

def norm(v):
    return math.sqrt(sum(a * a for a in v))

def cos_sim(v1, v2):
    n1 = norm(v1)
    n2 = norm(v2)
    if n1 == 0 or n2 == 0: return 0.0
    return dot_prod(v1, v2) / (n1 * n2)

# Compute canonical color centroid from core Turkish colors
core_turkish_colors = [
    'kırmızı', 'mavi', 'yeşil', 'sarı', 'mor', 'turuncu', 'pembe', 'siyah',
    'beyaz', 'gri', 'kahverengi', 'lacivert', 'turkuaz', 'bordo', 'bej'
]

present_core = [c for c in core_turkish_colors if c in vectors]
print(f"Present core colors: {present_core}")

centroid = [0.0] * dim
for c in present_core:
    for i in range(dim):
        centroid[i] += vectors[c][i] / len(present_core)

renk_vec = vectors.get('renk', centroid)

# Power iteration PCA to 2 components for 2D semantic visualization
print("Computing 2D PCA projection for semantic visualization...")
matrix_words = list(vectors.keys())
matrix_vecs = [vectors[w] for w in matrix_words]
N = len(matrix_vecs)

# Mean center
vec_means = [sum(row[j] for row in matrix_vecs) / N for j in range(dim)]
centered = [[row[j] - vec_means[j] for j in range(dim)] for row in matrix_vecs]

def get_principal_component(data, iters=20):
    import random
    random.seed(42)
    v = [random.uniform(-1, 1) for _ in range(dim)]
    nv = norm(v)
    v = [x / nv for x in v]
    for _ in range(iters):
        Mv = [sum(row[j] * v[j] for j in range(dim)) for row in data]
        MTMv = [sum(data[i][j] * Mv[i] for i in range(len(data))) for j in range(dim)]
        nm = norm(MTMv)
        if nm > 0:
            v = [x / nm for x in MTMv]
    return v

pc1 = get_principal_component(centered, iters=25)

# Deflate for PC2
def deflate(data, pc):
    out = []
    for row in data:
        proj = dot_prod(row, pc)
        out.append([row[j] - proj * pc[j] for j in range(dim)])
    return out

centered_deflated = deflate(centered, pc1)
pc2 = get_principal_component(centered_deflated, iters=25)

print("PCA components computed successfully!")

# Format output JSON structure
output_data = {
    'metadata': {
        'modelName': 'Word2Vec TR Model 100 (Turkish Wikipedia)',
        'sourceArchive': 'word2vecTRmodel100_e0db92f0.zip',
        'dimension': dim,
        'vocabCount': len(vectors),
        'method': 'Skip-gram / CBOW Cosine Similarity & Centroid Distance',
        'description': '4 kelimeden renk olmayanı tespit etmek için Türkçe Word2Vec kelime vektörleri ve semantik uzay'
    },
    'colorCentroid': [round(x, 4) for x in centroid],
    'renkVector': [round(x, 4) for x in renk_vec],
    'pca': {
        'means': [round(x, 4) for x in vec_means],
        'pc1': [round(x, 4) for x in pc1],
        'pc2': [round(x, 4) for x in pc2]
    },
    'colors': {},
    'vocabulary': {}
}

# Add all colors
for c, hex_code in color_hex_map.items():
    output_data['colors'][c] = {
        'hex': hex_code,
        'isCore': c in core_turkish_colors
    }

# Add words with vector, similarity, 2D coords
for w, vec in vectors.items():
    sim_renk = cos_sim(vec, renk_vec)
    sim_centroid = cos_sim(vec, centroid)
    
    # 2D PCA projection coordinates
    centered_w = [vec[j] - vec_means[j] for j in range(dim)]
    x_2d = dot_prod(centered_w, pc1)
    y_2d = dot_prod(centered_w, pc2)

    cat = target_word_to_cat.get(w, 'genel')
    is_color = (w in color_hex_map) or (cat == 'renk') or (sim_centroid > 0.70)

    # We store 100D vector rounded to 3 decimals to ensure compact file size (< 1.5MB)
    output_data['vocabulary'][w] = {
        'v': [round(val, 3) for val in vec],
        'simRenk': round(sim_renk, 4),
        'simCentroid': round(sim_centroid, 4),
        'isColor': is_color,
        'cat': cat,
        'x': round(x_2d, 2),
        'y': round(y_2d, 2)
    }

output_path = 'public/data/word2vec_tr.json'
with open(output_path, 'w', encoding='utf-8') as out_f:
    json.dump(output_data, out_f, ensure_ascii=False, separators=(',', ':'))

file_size_kb = os.path.getsize(output_path) / 1024
print(f"Successfully generated {output_path}! File size: {file_size_kb:.2f} KB ({file_size_kb/1024:.2f} MB)")
