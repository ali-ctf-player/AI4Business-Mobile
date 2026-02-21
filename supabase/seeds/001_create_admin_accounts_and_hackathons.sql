-- =============================================================================
-- SES (Startup Ecosystem Support) – Seed Data
-- Create superadmin and admin accounts, plus 10 sample hackathons
-- =============================================================================
-- 
-- İSTİFADƏ: Bu script-i Supabase SQL Editor-də çalışdırın.
-- QEYD: Şifrələri dəyişdirməyi unutmayın!
-- 
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Superadmin və Admin hesabları yarat
-- -----------------------------------------------------------------------------

-- Superadmin hesabı
DO $$
DECLARE
  superadmin_user_id uuid;
  superadmin_role_id uuid;
BEGIN
  -- Auth user yarat (email: superadmin@ses.az, şifrə: SuperAdmin123!)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@ses.az',
    crypt('superadmin123!', gen_salt('bf')), -- Şifrə: superadmin123!
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin SES"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO superadmin_user_id;

  -- Profile yarat
  SELECT id INTO superadmin_role_id FROM public.roles WHERE slug = 'super_admin';
  
  INSERT INTO public.profiles (id, role_id, email, full_name)
  VALUES (superadmin_user_id, superadmin_role_id, 'superadmin@ses.az', 'Super Admin SES')
  ON CONFLICT (id) DO UPDATE SET role_id = superadmin_role_id;

  RAISE NOTICE 'Superadmin yaradıldı: % (email: superadmin@ses.az)', superadmin_user_id;
END $$;

-- Admin hesabı
DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Auth user yarat (email: admin@ses.az, şifrə: Admin123!)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@ses.az',
    crypt('admin123!', gen_salt('bf')), -- Şifrə: admin123!
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin SES"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO admin_user_id;

  -- Profile yarat
  SELECT id INTO admin_role_id FROM public.roles WHERE slug = 'admin';
  
  INSERT INTO public.profiles (id, role_id, email, full_name)
  VALUES (admin_user_id, admin_role_id, 'admin@ses.az', 'Admin SES')
  ON CONFLICT (id) DO UPDATE SET role_id = admin_role_id;

  RAISE NOTICE 'Admin yaradıldı: % (email: admin@ses.az)', admin_user_id;
END $$;

-- -----------------------------------------------------------------------------
-- 2. 10 Nümunə Hackathon yarat (müxtəlif locationlarda, iconlarla)
-- -----------------------------------------------------------------------------

-- Hackathon iconları üçün emoji və ya URL-lər (Siz öz iconlarınızı əlavə edə bilərsiniz)
-- Iconlar üçün: https://emojipedia.org/ və ya öz icon URL-ləriniz

INSERT INTO public.hackathons (name, description, start_date, end_date, location, latitude, longitude, icon_url, image_url) VALUES
-- Bakı hackathonları
(
  'SES Innovation Hackathon 2025',
  'Startup ekosistemini inkişaf etdirmək üçün ən böyük hackathon. Startaplar, investorlar və ekspertlər bir araya gəlir.',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '33 days',
  'Bakı, Azərbaycan',
  40.4093,
  49.8671,
  '🏆', -- Trophy emoji
  NULL
),
(
  'Tech Startup Challenge',
  'Texnologiya sahəsində innovativ həllər üçün hackathon. AI, Blockchain və IoT fokusu.',
  NOW() + INTERVAL '45 days',
  NOW() + INTERVAL '48 days',
  'Bakı, Azərbaycan',
  40.4093,
  49.8671,
  '💻', -- Laptop emoji
  NULL
),
(
  'GreenTech Hackathon',
  'Ekoloji texnologiyalar və davamlı inkişaf üçün hackathon. Təmiz enerji və ekoloji həllər.',
  NOW() + INTERVAL '60 days',
  NOW() + INTERVAL '63 days',
  'Bakı, Azərbaycan',
  40.4093,
  49.8671,
  '🌱', -- Seedling emoji
  NULL
),

-- Gəncə hackathonları
(
  'Gəncə Tech Summit',
  'Gəncə şəhərində texnologiya və innovasiya üzrə hackathon. Regional startaplar üçün imkan.',
  NOW() + INTERVAL '75 days',
  NOW() + INTERVAL '78 days',
  'Gəncə, Azərbaycan',
  40.6828,
  46.3606,
  '🚀', -- Rocket emoji
  NULL
),
(
  'FinTech Innovation Day',
  'Maliyyə texnologiyaları üzrə hackathon. Ödəniş sistemləri, kriptovalyuta və bankçılıq həlləri.',
  NOW() + INTERVAL '90 days',
  NOW() + INTERVAL '93 days',
  'Gəncə, Azərbaycan',
  40.6828,
  46.3606,
  '💳', -- Credit card emoji
  NULL
),

-- Sumqayıt hackathonları
(
  'Industrial Innovation Challenge',
  'Sənaye 4.0 və avtomatlaşdırma üzrə hackathon. İstehsal və logistika həlləri.',
  NOW() + INTERVAL '105 days',
  NOW() + INTERVAL '108 days',
  'Sumqayıt, Azərbaycan',
  40.5897,
  49.6686,
  '🏭', -- Factory emoji
  NULL
),

-- Mingəçevir hackathonları
(
  'Smart City Solutions',
  'Ağıllı şəhər texnologiyaları üzrə hackathon. Nəqliyyat, enerji və kommunal xidmətlər.',
  NOW() + INTERVAL '120 days',
  NOW() + INTERVAL '123 days',
  'Mingəçevir, Azərbaycan',
  40.7700,
  47.0489,
  '🏙️', -- Cityscape emoji
  NULL
),

-- Şəki hackathonları
(
  'TourismTech Hackathon',
  'Turizm texnologiyaları üzrə hackathon. Turizm sənayesini rəqəmsallaşdırmaq üçün innovativ həllər.',
  NOW() + INTERVAL '135 days',
  NOW() + INTERVAL '138 days',
  'Şəki, Azərbaycan',
  41.1919,
  47.1706,
  '✈️', -- Airplane emoji
  NULL
),

-- Lənkəran hackathonları
(
  'AgriTech Innovation',
  'Kənd təsərrüfatı texnologiyaları üzrə hackathon. Precision farming və smart agriculture.',
  NOW() + INTERVAL '150 days',
  NOW() + INTERVAL '153 days',
  'Lənkəran, Azərbaycan',
  38.7543,
  48.8516,
  '🌾', -- Sheaf of rice emoji
  NULL
),

-- Şuşa hackathonları
(
  'Cultural Heritage Tech',
  'Mədəni irs və turizm üzrə hackathon. AR/VR texnologiyaları ilə mədəni irsi təqdim etmək.',
  NOW() + INTERVAL '165 days',
  NOW() + INTERVAL '168 days',
  'Şuşa, Azərbaycan',
  39.7600,
  46.7500,
  '🏛️', -- Classical building emoji
  NULL
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Hər hackathon üçün 5 komanda və hər komanda üçün 4 iştirakçı yarat
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  hackathon_rec RECORD;
  team_id_var uuid;
  participant_user_id uuid;
  participant_role_id uuid;
  team_counter integer;
  participant_counter integer;
  unique_email text;
  unique_id uuid;
  participant_names text[] := ARRAY[
    'Əli Məmmədov', 'Ayşə Həsənova', 'Rəşad Quliyev', 'Leyla Əliyeva',
    'Nigar İbrahimova', 'Tural Əhmədov', 'Gülnar Rzayeva', 'Orxan Vəliyev',
    'Səbinə Məlikova', 'Elçin Hüseynov', 'Aysel Qarayeva', 'Ruslan Məmmədov',
    'Günel Əliyeva', 'Tofiq Rəhimov', 'Nərgiz Qasımova', 'Vüsal Cabbarov',
    'Ləman Hacıyeva', 'Ramin Əliyev', 'Gülnaz Məmmədova', 'Elvin Qarayev'
  ];
  name_idx integer := 1;
BEGIN
  -- Hər hackathon üçün
  FOR hackathon_rec IN SELECT id, name FROM public.hackathons ORDER BY created_at
  LOOP
    -- 5 komanda yarat
    FOR team_counter IN 1..5
    LOOP
      INSERT INTO public.teams (hackathon_id, name, description)
      VALUES (
        hackathon_rec.id,
        hackathon_rec.name || ' - Komanda ' || team_counter,
        'Hackathon üçün yaradılmış komanda ' || team_counter
      )
      RETURNING id INTO team_id_var;

      -- Hər komanda üçün 4 iştirakçı yarat
      FOR participant_counter IN 1..4
      LOOP
        -- Unikal email yarat (hackathon_id və team_id ilə)
        unique_id := gen_random_uuid();
        unique_email := 'participant.' || replace(hackathon_rec.id::text, '-', '') || '.' || replace(team_id_var::text, '-', '') || '.' || participant_counter || '.' || name_idx || '@ses.example.com';
        
        -- İştirakçı user yarat
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          unique_id,
          'authenticated',
          'authenticated',
          unique_email,
          crypt('participant123!', gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}',
          jsonb_build_object('full_name', participant_names[name_idx]),
          now(),
          now()
        )
        RETURNING id INTO participant_user_id;

        -- Profile yarat (startup rolunda)
        SELECT id INTO participant_role_id FROM public.roles WHERE slug = 'startup';
        
        INSERT INTO public.profiles (id, role_id, email, full_name)
        VALUES (participant_user_id, participant_role_id, unique_email, participant_names[name_idx])
        ON CONFLICT (id) DO UPDATE SET role_id = participant_role_id;

        -- Komanda üzvü kimi əlavə et
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (
          team_id_var,
          participant_user_id,
          CASE WHEN participant_counter = 1 THEN 'lead' ELSE 'member' END
        )
        ON CONFLICT (team_id, user_id) DO NOTHING;

        name_idx := name_idx + 1;
        IF name_idx > array_length(participant_names, 1) THEN
          name_idx := 1; -- Dövrü təkrarla
        END IF;
      END LOOP;
    END LOOP;

    RAISE NOTICE 'Hackathon "%" üçün 5 komanda və 20 iştirakçı yaradıldı', hackathon_rec.name;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Məlumat mesajı
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SES Seed Data uğurla yaradıldı!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Superadmin: superadmin@ses.az / superadmin123!';
  RAISE NOTICE 'Admin: admin@ses.az / admin123!';
  RAISE NOTICE '10 hackathon yaradıldı.';
  RAISE NOTICE 'Hər hackathon üçün 5 komanda və 20 iştirakçı yaradıldı.';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'QEYD: Şifrələri dəyişdirməyi unutmayın!';
  RAISE NOTICE '========================================';
END $$;
