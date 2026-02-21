# SES Seed Data

Bu qovluqda database üçün seed data scriptləri var.

## İstifadə

### 1. Migration-ları çalışdırın

Əvvəlcə migration faylını Supabase SQL Editor-də çalışdırın:

```sql
-- supabase/migrations/002_add_admin_role_and_evaluations.sql
```

Bu migration:
- `admin` rolunu əlavə edir
- `startup_evaluations` table-ını yaradır (jury və ekspert qiymətləndirmələri üçün)
- `jury_members` table-ını yaradır
- `hackathon_awards` table-ını yaradır
- `hackathons` table-ına `icon_url` sütunu əlavə edir
- RLS policy-ləri yeniləyir (admin rolunu dəstəkləyir)

### 2. Seed data-nı əlavə edin

Sonra seed script-i çalışdırın:

```sql
-- supabase/seeds/001_create_admin_accounts_and_hackathons.sql
```

Bu script:
- **Superadmin hesabı** yaradır: `superadmin@ses.az` / `SuperAdmin123!`
- **Admin hesabı** yaradır: `admin@ses.az` / `Admin123!`
- **10 nümunə hackathon** yaradır müxtəlif şəhərlərdə (Bakı, Gəncə, Sumqayıt, Mingəçevir, Şəki, Lənkəran, Şuşa) iconlarla

## QEYD: Təhlükəsizlik

⚠️ **MÜHİM**: Production mühitində istifadə etməzdən əvvəl şifrələri dəyişdirin!

Seed script-də default şifrələr:
- Superadmin: `SuperAdmin123!`
- Admin: `Admin123!`

## Hackathonlar

Yaradılan hackathonlar:

1. **SES Innovation Hackathon 2025** (Bakı) 🏆
2. **Tech Startup Challenge** (Bakı) 💻
3. **GreenTech Hackathon** (Bakı) 🌱
4. **Gəncə Tech Summit** (Gəncə) 🚀
5. **FinTech Innovation Day** (Gəncə) 💳
6. **Industrial Innovation Challenge** (Sumqayıt) 🏭
7. **Smart City Solutions** (Mingəçevir) 🏙️
8. **TourismTech Hackathon** (Şəki) ✈️
9. **AgriTech Innovation** (Lənkəran) 🌾
10. **Cultural Heritage Tech** (Şuşa) 🏛️

Hər hackathonun:
- Adı və təsviri
- Başlama və bitmə tarixi (gələcək tarixlər)
- Location (şəhər adı)
- Koordinatları (latitude/longitude)
- Icon (emoji)

## Sonrakı addımlar

Seed data yaradıldıqdan sonra:

1. Superadmin və ya admin hesabı ilə login olun
2. Hackathonları idarə edin
3. Jury üzvləri əlavə edin (`jury_members` table-ına)
4. Startapları qiymətləndirin (`startup_evaluations` table-ına)
5. Mükafatlar təyin edin (`hackathon_awards` table-ına)
