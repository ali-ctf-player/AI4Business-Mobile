# SES Demo Hesablar (Email / Parol)

Aşağıdakı hesablar hər rol növü üçün ayrı mail və parolla yaradılıb. Yeni quraşdırmada (seed) avtomatik əlavə olunur.

| Rol | Email | Parol | İzah |
|-----|--------|--------|------|
| **Super Admin** | superadmin@ses.az | super123 | Bütün istifadəçilər və hackathonlar üzrə tam idarəetmə |
| **Admin** | admin@ses.az | admin123 | Yalnız hackathon **adlarını** redaktə edə bilər |
| **Startap iştirakçısı** | startup@ses.az | startup123 | Komandalara qatılmaq, startap yaratmaq |
| **İnvestor** | investor@ses.az | investor123 | Hub-da startapları görmək, qiymətləndirmək |
| **İT Şirkət** | itcompany@ses.az | itcompany123 | Hub-a daxil olmaq, ekosistemə qoşulmaq |
| **Təşkilatçı** | organizer@ses.az | organizer123 | Yeni hackathon yaratmaq, xəritədə yer seçmək, bio əlavə etmək |

---

## Rol üzrə funksionallıq

- **Startap:** Home-da hackathonlar/startaplar, komandaya qatılma sorğusu (team lead təsdiq edir), startap yarada bilər.
- **İnvestor:** Hub-da startap siyahısı, startap detalları.
- **İT Şirkət:** Hub-a daxil ola bilər.
- **Təşkilatçı:** İdarəetmə → Hackathon yarat (ad, bio, xəritədə yer), xəritədə hackathonlar.
- **Admin:** İdarəetmə → Hackathonlar → yalnız **ad** sahəsini redaktə edə bilər (vaxt, yer, silmək yoxdur).
- **Super Admin:** İdarəetmə → İstifadəçilər (rol dəyiş, sil), Hackathonlar (əlavə/redaktə/sil).

**Qeyd:** Şifrələri real mühitdə mütləq dəyişin.
