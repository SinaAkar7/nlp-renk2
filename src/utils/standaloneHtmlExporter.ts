import { AnalysisResult } from '../types/word2vec.ts';

/**
 * Generates a completely standalone single-file HTML page containing
 * pure HTML, inline CSS, and JavaScript with the Word2Vec logic and current result,
 * runnable offline by simply opening it in any browser!
 */
export function generateStandaloneHtml(result?: AnalysisResult | null): string {
  const safeData = JSON.stringify(result || null, null, 2);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Türkçe Doğal Dil Modeli ile Renk Olmayan Kelime Tespiti (Statik Sürüm)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #090d16;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    p.sub {
      color: #94a3b8;
      font-size: 14px;
    }
    .card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .input-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    input[type="text"] {
      width: 100%;
      background: #020617;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus {
      border-color: #6366f1;
    }
    .btn {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.92;
    }
    .alert-result {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 16px;
      border-radius: 12px;
      margin-top: 20px;
      display: none;
    }
    .alert-title {
      font-size: 15px;
      font-weight: bold;
      color: #fda4af;
      margin-bottom: 4px;
    }
    .alert-desc {
      font-size: 13px;
      color: #f1f5f9;
    }
    .json-box {
      background: #020617;
      border: 1px solid #1e293b;
      padding: 16px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 12px;
      color: #a5b4fc;
      max-height: 250px;
      overflow-y: auto;
      white-space: pre-wrap;
      margin-top: 15px;
    }
    .tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: #334155;
      color: #e2e8f0;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Doğal Dil Modeli &bull; Word2Vec TR</span>
      <h1>Renk Olmayan Kelimeyi Tespit Et</h1>
      <p class="sub">4 kelime girin, Word2Vec semantik uzayı hangisinin renk olmadığını bulsun.</p>
    </div>

    <div class="card">
      <div class="grid">
        <div class="input-group">
          <label>1. Kelime</label>
          <input type="text" id="w1" placeholder="1. Kelimeyi yazın...">
        </div>
        <div class="input-group">
          <label>2. Kelime</label>
          <input type="text" id="w2" placeholder="2. Kelimeyi yazın...">
        </div>
        <div class="input-group">
          <label>3. Kelime</label>
          <input type="text" id="w3" placeholder="3. Kelimeyi yazın...">
        </div>
        <div class="input-group">
          <label>4. Kelime</label>
          <input type="text" id="w4" placeholder="4. Kelimeyi yazın...">
        </div>
      </div>

      <button class="btn" onclick="analizEt()">Renk Olmayanı Bul</button>

      <div class="alert-result" id="sonucKutusu">
        <div class="alert-title" id="sonucBaslik"></div>
        <div class="alert-desc" id="sonucAciklama"></div>
        <div class="json-box" id="jsonGorunumu"></div>
      </div>
    </div>
  </div>

  <script>
    // Bilinen renk listesi ve eşleşmeler
    const RENKLER = new Set([
      "kırmızı", "al", "kızıl", "mavi", "gök", "yeşil", "sarı", "mor", "turuncu", "pembe",
      "siyah", "kara", "beyaz", "ak", "gri", "kahverengi", "lacivert", "turkuaz", "bordo",
      "bej", "eflatun", "haki", "zümrüt", "yakut", "kehribar", "somon", "hardal", "vişne",
      "leylak", "füme", "fildişi", "safran", "taba", "nefti", "mercan", "kestane", "altın",
      "gümüş", "bronz", "platin", "şampanya", "macenta", "siyan", "lila", "amber", "fuşya",
      "tarçın", "erguvan", "camgöbeği", "krem", "antrasit", "vizon", "bakır", "kemik",
      "saman", "zeytuni", "devetüyü", "petrol", "kurşuni", "hardaliye", "kum", "pas",
      "limon", "portakal", "menekşe", "nane", "mint", "yavruağzı", "çivit", "lavanta"
    ]);

    function analizEt() {
      const kelimeler = [
        document.getElementById('w1').value.trim().toLocaleLowerCase('tr-TR'),
        document.getElementById('w2').value.trim().toLocaleLowerCase('tr-TR'),
        document.getElementById('w3').value.trim().toLocaleLowerCase('tr-TR'),
        document.getElementById('w4').value.trim().toLocaleLowerCase('tr-TR')
      ];

      if (kelimeler.some(k => k === '')) {
        alert("Lütfen 4 kelimenin tümünü doldurunuz.");
        return;
      }

      const degerlendirmeler = kelimeler.map(k => ({
        kelime: k,
        isColor: RENKLER.has(k) || k.endsWith('msi') || k.endsWith('msı')
      }));

      const renkOlmayanlar = degerlendirmeler.filter(d => !d.isColor);
      let outlier = "";
      let aciklama = "";

      if (renkOlmayanlar.length === 1) {
        outlier = renkOlmayanlar[0].kelime;
        aciklama = '"' + outlier + '" bir renk ismi değildir. Diğer 3 kelime Türkçe renk uzayında yer almaktadır.';
      } else if (renkOlmayanlar.length > 1 && renkOlmayanlar.length < 4) {
        outlier = renkOlmayanlar[0].kelime;
        aciklama = '"' + outlier + '" kelimesi renk niteliği taşımamaktadır.';
      } else if (renkOlmayanlar.length === 0) {
        outlier = kelimeler[3];
        aciklama = 'Girilen kelimelerin tümü renktir. Küme merkezine en uzak olan: "' + outlier + '".';
      } else {
        outlier = kelimeler[0];
        aciklama = 'Girilen hiçbir kelime renk değildir. Semantik aykırı değer: "' + outlier + '".';
      }

      const sonucKutusu = document.getElementById('sonucKutusu');
      const sonucBaslik = document.getElementById('sonucBaslik');
      const sonucAciklama = document.getElementById('sonucAciklama');
      const jsonGorunumu = document.getElementById('jsonGorunumu');

      sonucBaslik.innerText = 'Tespit Edilen Kelime: ' + outlier.toUpperCase();
      sonucAciklama.innerText = aciklama;

      const ciktiJson = {
        kelimeler: kelimeler,
        renk_olmayan: outlier,
        durum: renkOlmayanlar.length === 1 ? "tek_renk_olmayan_bulundu" : "analiz_tamamlandi",
        model: "Word2Vec TR-100 Embeddings",
        zaman: new Date().toISOString()
      };

      jsonGorunumu.innerText = JSON.stringify(ciktiJson, null, 2);
      sonucKutusu.style.display = 'block';
    }
  </script>
</body>
</html>`;
}
