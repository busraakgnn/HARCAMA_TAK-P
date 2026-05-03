import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

/* COMPONENT TANIMI */
@Component({
  selector: 'app-home', // Bu sayfanın HTML'de kullanılacağı isim
  templateUrl: 'home.page.html', // Bu sayfanın görünümü (HTML)
  styleUrls: ['home.page.scss'], // Bu sayfanın tasarımı (CSS)
  standalone: false // Module yapısı kullanılıyor
})

export class HomePage {

  /* KULLANICIDAN ALINAN VERİLER */
  ad: string = ""; // Kullanıcının girdiği harcama adı tutulur
  fiyat: number | null = null; // Kullanıcının girdiği harcama tutarı tutulur
  kategori: string = ""; // Kullanıcının seçtiği kategori (istek/ihtiyaç)
  tarih: string = new Date().toISOString(); // Varsayılan olarak bugünün tarihi atanır

  /* LİSTELER */
  istekler: any[] = []; // İstek kategorisindeki harcamalar burada tutulur
  ihtiyaclar: any[] = []; // İhtiyaç kategorisindeki harcamalar burada tutulur

  /* TOPLAM DEĞERLER */
  istekToplam: number = 0; // İstek harcamalarının toplamı
  ihtiyacToplam: number = 0; // İhtiyaç harcamalarının toplamı
  genelToplam: number = 0; // Tüm harcamaların toplamı

  /* CONSTRUCTOR (BAŞLANGIÇTA ÇALIŞIR) */
  constructor(
    private alertCtrl: AlertController, // Silme işlemi için onay penceresi oluşturur
    private toastCtrl: ToastController // Kullanıcıya kısa mesaj (toast) gösterir
  ) {
    this.verileriYukle(); // Uygulama açılır açılmaz kayıtlı verileri yükler
  }
  // Bu sayede uygulama kapansa bile veriler kaybolmaz


  /* TARİHİ DÜZENLEME */
  formatliTarih(isoDate: string) {
    if (!isoDate) return ""; // Eğer tarih yoksa boş döner
    const d = new Date(isoDate); // ISO formatındaki tarih Date tipine çevrilir
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  }
  // Bu fonksiyon tarihi daha okunabilir hale getirir (gün.ay.yıl)


  /* TOAST MESAJI GÖSTERME */
  async mesajGoster(mesaj: string, renk: string) {
    const toast = await this.toastCtrl.create({
      message: mesaj, // Kullanıcıya gösterilecek mesaj
      duration: 2000, // 2 saniye görünür
      color: renk, // Mesajın rengi (success, danger vs.)
      position: 'bottom' // Ekranın alt kısmında çıkar
    });
    await toast.present(); // Toast mesajı ekranda gösterilir
  }
  // Bu fonksiyon kullanıcıya bilgi vermek için kullanılır


  /* HARÇAMA EKLEME */
  async ekle() {

    // Kullanıcı boş alan bırakmış mı kontrol edilir
    if (!this.ad || !this.fiyat || !this.kategori) {
      this.mesajGoster('LÜTFEN TÜM ALANLARI DOLDURUN!', 'danger');
      return;
    }

    // Yeni harcama nesnesi oluşturulur
    let yeni = { ad: this.ad, fiyat: this.fiyat, tarih: this.tarih };

    // Seçilen kategoriye göre doğru listeye eklenir
    if (this.kategori === 'istek') {
      this.istekler.push(yeni); // İstek listesine eklenir
    } else {
      this.ihtiyaclar.push(yeni); // İhtiyaç listesine eklenir
    }

    this.verileriKaydet(); // Eklenen veri localStorage'a kaydedilir
    this.mesajGoster('Harcama başarıyla eklendi ✅', 'success');

    // Kullanıcının girdiği alanlar temizlenir
    this.ad = "";
    this.fiyat = null;
  }
  // Bu fonksiyon kullanıcıdan alınan veriyi listeye ekler ve kaydeder


  /* HARÇAMA SİLME (ONAYLI) */
  async onayliSil(harcama: any, tip: string) {

    const alert = await this.alertCtrl.create({
      header: 'Silme Onayı', // Başlık
      message: `${harcama.ad} silinsin mi?`, // Kullanıcıya sorulan soru
      buttons: [
        { text: 'Hayır', role: 'cancel' }, // İptal
        {
          text: 'Evet',
          handler: () => {

            // Hangi listeden silineceği kontrol edilir
            if (tip === 'istek') {
              this.istekler = this.istekler.filter(i => i !== harcama);
            } else {
              this.ihtiyaclar = this.ihtiyaclar.filter(i => i !== harcama);
            }

            this.verileriKaydet(); // Güncellenmiş liste tekrar kaydedilir
            this.mesajGoster('Harcama silindi 🗑️', 'warning');
          }
        }
      ]
    });

    await alert.present(); // Onay kutusu ekranda gösterilir
  }
  // Bu fonksiyon kullanıcıdan onay alarak veri siler


  /* VERİYİ KAYDETME */
  verileriKaydet() {
    localStorage.setItem('isteklerDB_v2', JSON.stringify(this.istekler));
    localStorage.setItem('ihtiyaclarDB_v2', JSON.stringify(this.ihtiyaclar));
    this.hesapla(); // Her kayıttan sonra toplamlar güncellenir
  }
  // Bu fonksiyon verileri tarayıcıda saklar (kalıcı hale getirir)


  /* VERİYİ YÜKLEME */
  verileriYukle() {
    const s1 = localStorage.getItem('isteklerDB_v2');
    const s2 = localStorage.getItem('ihtiyaclarDB_v2');

    if (s1) this.istekler = JSON.parse(s1);
    if (s2) this.ihtiyaclar = JSON.parse(s2);

    this.hesapla(); // Yükledikten sonra toplamları hesaplar
  }
  // Bu fonksiyon kayıtlı verileri geri getirir


  /* TOPLAM HESAPLAMA */
  hesapla() {
    this.istekToplam = this.istekler.reduce((t, i) => t + i.fiyat, 0);
    this.ihtiyacToplam = this.ihtiyaclar.reduce((t, i) => t + i.fiyat, 0);
    this.genelToplam = this.istekToplam + this.ihtiyacToplam;
  }
  // Bu fonksiyon tüm harcamaları toplayarak ekranda gösterir

}