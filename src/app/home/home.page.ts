import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  ad: string = "";
  fiyat: number | null = null;
  kategori: string = "";
  tarih: string = new Date().toISOString();

  istekler: any[] = [];
  ihtiyaclar: any[] = [];
  istekToplam: number = 0;
  ihtiyacToplam: number = 0;
  genelToplam: number = 0;

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController) {
    this.verileriYukle();
  }

  // BURASI EKSİK OLDUĞU İÇİN HATA ALIYORSUN:
  formatliTarih(isoDate: string) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  }

  async mesajGoster(mesaj: string, renk: string) {
    const toast = await this.toastCtrl.create({
      message: mesaj,
      duration: 2000,
      color: renk,
      position: 'bottom'
    });
    await toast.present();
  }

  async ekle() {
    if (!this.ad || !this.fiyat || !this.kategori) {
      this.mesajGoster('LÜTFEN TÜM ALANLARI DOLDURUN!', 'danger');
      return;
    }

    let yeni = { ad: this.ad, fiyat: this.fiyat, tarih: this.tarih };

    if (this.kategori === 'istek') {
      this.istekler.push(yeni);
    } else {
      this.ihtiyaclar.push(yeni);
    }

    this.verileriKaydet();
    this.mesajGoster('Harcama başarıyla eklendi ✅', 'success');
    this.ad = ""; this.fiyat = null;
  }

  async onayliSil(harcama: any, tip: string) {
    const alert = await this.alertCtrl.create({
      header: 'Silme Onayı',
      message: `${harcama.ad} silinsin mi?`,
      buttons: [
        { text: 'Hayır', role: 'cancel' },
        {
          text: 'Evet',
          handler: () => {
            if (tip === 'istek') {
              this.istekler = this.istekler.filter(i => i !== harcama);
            } else {
              this.ihtiyaclar = this.ihtiyaclar.filter(i => i !== harcama);
            }
            this.verileriKaydet();
            this.mesajGoster('Harcama silindi 🗑️', 'warning');
          }
        }
      ]
    });
    await alert.present();
  }

  verileriKaydet() {
    localStorage.setItem('isteklerDB_v2', JSON.stringify(this.istekler));
    localStorage.setItem('ihtiyaclarDB_v2', JSON.stringify(this.ihtiyaclar));
    this.hesapla();
  }

  verileriYukle() {
    const s1 = localStorage.getItem('isteklerDB_v2');
    const s2 = localStorage.getItem('ihtiyaclarDB_v2');
    if (s1) this.istekler = JSON.parse(s1);
    if (s2) this.ihtiyaclar = JSON.parse(s2);
    this.hesapla();
  }

  hesapla() {
    this.istekToplam = this.istekler.reduce((t, i) => t + i.fiyat, 0);
    this.ihtiyacToplam = this.ihtiyaclar.reduce((t, i) => t + i.fiyat, 0);
    this.genelToplam = this.istekToplam + this.ihtiyacToplam;
  }
}
