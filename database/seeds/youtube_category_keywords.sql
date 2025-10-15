-- YouTube Category Keywords Seed Data
-- Maps CosmoStream categories to YouTube search keywords and channel IDs
-- NOTE: This is a curated starting point - admins can customize via the admin interface

-- ==============================================
-- HIGH-QUALITY SPACE/ASTRONOMY YOUTUBE CHANNELS
-- ==============================================
-- These channels are referenced throughout the seed data:
--
-- UCLA_DiR1FfKNvjuUpBHmylQ     = NASA
-- UCtI0Hodo5o5dUb67FeUjDeA     = SpaceX
-- UCIBaDdAbGlFDeS33shmlD0A     = ESA (European Space Agency)
-- UCJkN-wlUPOmh59s1Qr6wKnQ     = Fraser Cain (Universe Today)
-- UCYNbYGl89UU5N8L-pNQPrRA     = Dr. Becky
-- UC7_gcs09iThXybpVgjHZ_7g     = PBS Space Time
-- UCxzC4EngIsMrPmbm6Nxvb-A     = Scott Manley
-- UCciQ8wFcVoIIMi-lfu8-cjQ     = Anton Petrov
-- UCrMePiHCWG4Vwqv3t7W9EFg     = SciShow Space
-- UCsXVk37bltHxD1rDPwtNM8Q     = Kurzgesagt – In a Nutshell
-- UCGHZpIpAWJQ-Jy_CKdY-6LA     = Cool Worlds
-- UCNYBiX-Mefb95RafW3aJDnQ     = V101 Science
-- UCFbBDrYv8akUYK4FhGXWMog     = Event Horizon
-- UCb_EYMSDqKXwKg2WS7DShIg     = Institute of Physics
-- UCsooa4yRKGN_zEE8iknghZA     = TED-Ed
-- ==============================================

-- Insert mappings for Beginner & Curious Minds categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'what-is-space' THEN ARRAY['what is space', 'space explained for kids', 'introduction to space', 'space basics']
        WHEN 'what-is-astronomy' THEN ARRAY['what is astronomy', 'astronomy for beginners', 'introduction to astronomy', 'astronomy basics']
        WHEN 'what-are-stars' THEN ARRAY['what are stars', 'stars explained', 'how stars work', 'star formation basics']
        WHEN 'what-are-planets' THEN ARRAY['what are planets', 'planets explained', 'solar system planets', 'planet basics']
        WHEN 'what-is-gravity' THEN ARRAY['gravity explained', 'what is gravity', 'how gravity works', 'gravity for kids']
        WHEN 'what-is-solar-system' THEN ARRAY['solar system explained', 'our solar system', 'solar system tour', 'planets in solar system']
        WHEN 'what-is-universe' THEN ARRAY['what is the universe', 'universe explained', 'cosmos explained', 'universe basics']
        WHEN 'what-are-galaxies' THEN ARRAY['what are galaxies', 'galaxies explained', 'types of galaxies', 'galaxy basics']
        WHEN 'what-are-black-holes' THEN ARRAY['black holes explained', 'what are black holes', 'black hole basics', 'black holes for kids']
        WHEN 'what-is-light' THEN ARRAY['light explained', 'speed of light', 'electromagnetic spectrum', 'light physics']
        WHEN 'what-are-meteors' THEN ARRAY['meteors explained', 'shooting stars', 'meteor showers', 'meteorites']
        WHEN 'what-are-comets' THEN ARRAY['comets explained', 'what are comets', 'famous comets', 'comet tails']
        WHEN 'what-are-asteroids' THEN ARRAY['asteroids explained', 'asteroid belt', 'near earth asteroids', 'asteroids vs comets']
        WHEN 'what-is-the-moon' THEN ARRAY['moon explained', 'our moon', 'lunar phases', 'moon facts']
        WHEN 'what-are-constellations' THEN ARRAY['constellations explained', 'star patterns', 'constellation guide', 'famous constellations']
        WHEN 'what-is-telescope' THEN ARRAY['telescope explained', 'how telescopes work', 'types of telescopes', 'telescope basics']
        WHEN 'what-are-space-missions' THEN ARRAY['space missions', 'space exploration', 'NASA missions', 'space mission history']
        WHEN 'what-are-astronauts' THEN ARRAY['astronauts explained', 'astronaut training', 'life in space', 'becoming an astronaut']
        WHEN 'what-is-nasa' THEN ARRAY['NASA explained', 'NASA history', 'what does NASA do', 'NASA missions']
        WHEN 'what-makes-day-night' THEN ARRAY['day and night explained', 'earth rotation', 'why day and night', 'earth spinning']

        -- Amazing Facts categories
        WHEN 'solar-system-facts' THEN ARRAY['solar system facts', 'amazing solar system', 'solar system trivia', 'solar system wonders']
        WHEN 'planet-facts' THEN ARRAY['planet facts', 'amazing planet facts', 'cool planet facts', 'planet trivia']
        WHEN 'moon-facts' THEN ARRAY['moon facts', 'lunar facts', 'amazing moon facts', 'cool moon trivia']
        WHEN 'star-facts' THEN ARRAY['star facts', 'amazing stars', 'stellar facts', 'star trivia']
        WHEN 'space-travel-facts' THEN ARRAY['space travel facts', 'spaceflight facts', 'rocket facts', 'space exploration facts']
        WHEN 'black-hole-physics' THEN ARRAY['black hole physics', 'general relativity black holes', 'black hole mathematics', 'black hole singularity']

        ELSE ARRAY[REPLACE(slug, '-', ' '), 'astronomy ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    CASE
        WHEN slug LIKE 'what-is%' OR slug LIKE '%facts%' THEN
            ARRAY['UCLA_DiR1FfKNvjuUpBHmylQ', 'UCsXVk37bltHxD1rDPwtNM8Q', 'UCrMePiHCWG4Vwqv3t7W9EFg', 'UCsooa4yRKGN_zEE8iknghZA']::text[]
        ELSE
            ARRAY['UCLA_DiR1FfKNvjuUpBHmylQ', 'UCJkN-wlUPOmh59s1Qr6wKnQ']::text[]
    END as channels,
    '{
        "min_views": 5000,
        "min_likes_ratio": 0.9,
        "min_subscribers": 50000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'daily' as frequency,
    15 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000001' -- Beginner & Curious Minds
  AND slug IN (
    'what-is-space', 'what-is-astronomy', 'what-are-stars', 'what-are-planets',
    'what-is-gravity', 'what-is-solar-system', 'what-is-universe', 'what-are-galaxies',
    'what-are-black-holes', 'what-is-light', 'what-are-meteors', 'what-are-comets',
    'what-are-asteroids', 'what-is-the-moon', 'what-are-constellations', 'what-is-telescope',
    'what-are-space-missions', 'what-are-astronauts', 'what-is-nasa', 'what-makes-day-night',
    'solar-system-facts', 'planet-facts', 'moon-facts', 'star-facts', 'space-travel-facts'
  );

-- Insert mappings for Observational Astronomy categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'night-sky-tours' THEN ARRAY['night sky tour', 'constellation tour', 'star gazing tonight', 'monthly sky tour']
        WHEN 'telescope-reviews' THEN ARRAY['telescope review', 'best telescopes', 'telescope comparison', 'buying a telescope']
        WHEN 'binocular-astronomy' THEN ARRAY['binocular astronomy', 'astronomy with binoculars', 'binocular stargazing']
        WHEN 'urban-astronomy' THEN ARRAY['urban astronomy', 'city stargazing', 'light pollution astronomy']
        WHEN 'meteor-shower-guides' THEN ARRAY['meteor shower', 'meteor shower guide', 'best meteor showers', 'meteor shower tonight']
        WHEN 'lunar-observation' THEN ARRAY['moon observing', 'lunar observation', 'observe the moon', 'moon through telescope']
        WHEN 'planetary-observation' THEN ARRAY['planet observing', 'planetary observation', 'planets through telescope', 'backyard astronomy planets']
        WHEN 'deep-sky-objects' THEN ARRAY['deep sky objects', 'nebulae observation', 'galaxy observation', 'star clusters']
        WHEN 'solar-observation-safety' THEN ARRAY['solar observation', 'sun safety astronomy', 'observing the sun', 'solar filter']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'astronomy ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UCJkN-wlUPOmh59s1Qr6wKnQ', 'UCxzC4EngIsMrPmbm6Nxvb-A', 'UCLA_DiR1FfKNvjuUpBHmylQ']::text[] as channels,
    '{
        "min_views": 3000,
        "min_likes_ratio": 0.85,
        "min_subscribers": 25000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'daily' as frequency,
    10 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000002' -- Observational Astronomy
  AND slug IN (
    'night-sky-tours', 'telescope-reviews', 'binocular-astronomy', 'urban-astronomy',
    'meteor-shower-guides', 'lunar-observation', 'planetary-observation',
    'deep-sky-objects', 'solar-observation-safety'
  );

-- Insert mappings for Astrophotography categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'dslr-astrophotography' THEN ARRAY['DSLR astrophotography', 'camera astrophotography', 'astrophotography tutorial', 'night sky photography']
        WHEN 'smartphone-astrophotography' THEN ARRAY['smartphone astrophotography', 'phone night sky', 'mobile astrophotography', 'iphone stars']
        WHEN 'telescope-astrophotography' THEN ARRAY['telescope astrophotography', 'deep sky imaging', 'astrophotography setup', 'planetary imaging']
        WHEN 'star-trail-photography' THEN ARRAY['star trails', 'star trail photography', 'how to photograph star trails']
        WHEN 'milky-way-photography' THEN ARRAY['milky way photography', 'photograph milky way', 'milky way tutorial']
        WHEN 'lunar-photography' THEN ARRAY['moon photography', 'lunar photography', 'photograph the moon', 'moon imaging']
        WHEN 'planetary-photography' THEN ARRAY['planetary photography', 'planet imaging', 'planetary webcam', 'planetary image stacking']
        WHEN 'time-lapse-astronomy' THEN ARRAY['astronomy time lapse', 'night sky time lapse', 'astrophotography time lapse']
        WHEN 'image-processing' THEN ARRAY['astrophotography processing', 'stacking astrophotos', 'pixinsight tutorial', 'deep sky stacker']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'astrophotography ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UCJkN-wlUPOmh59s1Qr6wKnQ', 'UCxzC4EngIsMrPmbm6Nxvb-A']::text[] as channels,
    '{
        "min_views": 2000,
        "min_likes_ratio": 0.90,
        "min_subscribers": 15000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'weekly' as frequency,
    8 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000002' -- Observational Astronomy (Astrophotography subcategories)
  AND slug IN (
    'dslr-astrophotography', 'smartphone-astrophotography', 'telescope-astrophotography',
    'star-trail-photography', 'milky-way-photography', 'lunar-photography',
    'planetary-photography', 'time-lapse-astronomy', 'image-processing'
  );

-- Insert mappings for Space Technology & Engineering categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'reusable-rockets' THEN ARRAY['reusable rockets', 'rocket landing', 'spacex falcon', 'rocket reusability']
        WHEN 'mars-rover-engineering' THEN ARRAY['mars rover', 'perseverance rover', 'curiosity rover', 'mars exploration']
        WHEN 'cubesat-technology' THEN ARRAY['cubesat', 'small satellites', 'cubesat mission', 'satellite technology']
        WHEN 'space-agriculture' THEN ARRAY['space farming', 'growing food in space', 'space agriculture', 'iss plants']
        WHEN '3d-printing-space' THEN ARRAY['3d printing space', 'additive manufacturing space', 'printing in orbit']
        WHEN 'autonomous-navigation' THEN ARRAY['spacecraft navigation', 'autonomous spacecraft', 'space navigation systems']
        WHEN 'laser-communications' THEN ARRAY['laser space communication', 'optical communication space', 'deep space network']
        WHEN 'electric-propulsion' THEN ARRAY['ion drive', 'electric propulsion', 'ion engine', 'plasma propulsion']
        WHEN 'earth-observation' THEN ARRAY['earth observation satellites', 'remote sensing', 'earth from space', 'satellite imagery']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'space technology ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UCtI0Hodo5o5dUb67FeUjDeA', 'UCLA_DiR1FfKNvjuUpBHmylQ', 'UCxzC4EngIsMrPmbm6Nxvb-A', 'UCIBaDdAbGlFDeS33shmlD0A']::text[] as channels,
    '{
        "min_views": 5000,
        "min_likes_ratio": 0.88,
        "min_subscribers": 50000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'daily' as frequency,
    12 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000003' -- Space Technology & Engineering
  AND slug IN (
    'reusable-rockets', 'mars-rover-engineering', 'cubesat-technology', 'space-agriculture',
    '3d-printing-space', 'autonomous-navigation', 'laser-communications', 'electric-propulsion',
    'earth-observation'
  );

-- Insert mappings for Advanced Astrophysics & Research categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'star-formation' THEN ARRAY['star formation', 'stellar nursery', 'protostars', 'stellar birth']
        WHEN 'stellar-evolution' THEN ARRAY['stellar evolution', 'life cycle of stars', 'stellar lifecycle', 'main sequence stars']
        WHEN 'supernova-explosions' THEN ARRAY['supernova', 'supernova explosion', 'stellar death', 'type ia supernova']
        WHEN 'neutron-stars-pulsars' THEN ARRAY['neutron star', 'pulsar', 'magnetar', 'neutron star merger']
        WHEN 'black-hole-physics' THEN ARRAY['black hole physics', 'event horizon', 'black hole merger', 'schwarzschild radius']
        WHEN 'gravitational-waves' THEN ARRAY['gravitational waves', 'LIGO', 'gravitational wave detection', 'spacetime ripples']
        WHEN 'dark-matter' THEN ARRAY['dark matter', 'dark matter research', 'WIMP', 'dark matter detection']
        WHEN 'dark-energy' THEN ARRAY['dark energy', 'cosmic acceleration', 'lambda CDM', 'dark energy explained']
        WHEN 'big-bang-theory' THEN ARRAY['big bang theory', 'cosmic inflation', 'early universe', 'cosmology big bang']
        WHEN 'milky-way-structure' THEN ARRAY['milky way structure', 'galactic structure', 'spiral arms', 'galactic center']
        WHEN 'astrobiology' THEN ARRAY['astrobiology', 'life in universe', 'habitable zone', 'biosignatures']
        WHEN 'seti-research' THEN ARRAY['SETI', 'search for extraterrestrial intelligence', 'alien signals', 'technosignatures']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'astrophysics ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UC7_gcs09iThXybpVgjHZ_7g', 'UCYNbYGl89UU5N8L-pNQPrRA', 'UCGHZpIpAWJQ-Jy_CKdY-6LA', 'UCciQ8wFcVoIIMi-lfu8-cjQ', 'UCFbBDrYv8akUYK4FhGXWMog']::text[] as channels,
    '{
        "min_views": 3000,
        "min_likes_ratio": 0.92,
        "min_subscribers": 100000,
        "content_rating": "all"
    }'::jsonb as quality,
    'weekly' as frequency,
    10 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000004' -- Advanced Astrophysics & Research
  AND slug IN (
    'star-formation', 'stellar-evolution', 'supernova-explosions', 'neutron-stars-pulsars',
    'black-hole-physics', 'gravitational-waves', 'dark-matter', 'dark-energy',
    'big-bang-theory', 'milky-way-structure', 'astrobiology', 'seti-research'
  );

-- Insert mappings for Commercial & Career Focus categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'space-tourism' THEN ARRAY['space tourism', 'commercial spaceflight', 'blue origin', 'virgin galactic']
        WHEN 'satellite-launch-services' THEN ARRAY['satellite launch', 'commercial launch', 'rocket launch', 'launch services']
        WHEN 'space-mining-economics' THEN ARRAY['asteroid mining', 'space mining', 'space resources', 'mining economics space']
        WHEN 'orbital-manufacturing' THEN ARRAY['orbital manufacturing', 'space manufacturing', 'microgravity manufacturing']
        WHEN 'space-law' THEN ARRAY['space law', 'outer space treaty', 'space regulations', 'international space law']
        WHEN 'space-startups' THEN ARRAY['space startups', 'newspace', 'commercial space companies', 'space entrepreneurship']
        WHEN 'astronomy-careers' THEN ARRAY['astronomy career', 'becoming an astronomer', 'space careers', 'astrophysics career']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'commercial space ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UCtI0Hodo5o5dUb67FeUjDeA', 'UCLA_DiR1FfKNvjuUpBHmylQ', 'UCxzC4EngIsMrPmbm6Nxvb-A']::text[] as channels,
    '{
        "min_views": 2000,
        "min_likes_ratio": 0.85,
        "min_subscribers": 30000,
        "content_rating": "all"
    }'::jsonb as quality,
    'weekly' as frequency,
    8 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000005' -- Commercial & Career Focus
  AND slug IN (
    'space-tourism', 'satellite-launch-services', 'space-mining-economics',
    'orbital-manufacturing', 'space-law', 'space-startups', 'astronomy-careers'
  );

-- Insert mappings for Interactive & Community categories
INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    id,
    CASE slug
        WHEN 'kitchen-astronomy' THEN ARRAY['space science experiments', 'astronomy experiments home', 'DIY space science', 'kids astronomy']
        WHEN 'build-observatory' THEN ARRAY['backyard observatory', 'DIY observatory', 'build telescope', 'home observatory']
        WHEN 'citizen-science' THEN ARRAY['citizen science astronomy', 'amateur astronomy research', 'backyard astronomy science']
        WHEN 'space-art-culture' THEN ARRAY['space art', 'cosmic art', 'astronomy art', 'space in culture']
        ELSE ARRAY[REPLACE(slug, '-', ' '), 'astronomy ' || REPLACE(slug, '-', ' ')]
    END as keywords,
    ARRAY['UCJkN-wlUPOmh59s1Qr6wKnQ', 'UCrMePiHCWG4Vwqv3t7W9EFg', 'UCsooa4yRKGN_zEE8iknghZA']::text[] as channels,
    '{
        "min_views": 1000,
        "min_likes_ratio": 0.90,
        "min_subscribers": 10000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'weekly' as frequency,
    10 as max_videos
FROM content_categories
WHERE parent_category_id = '00000000-0000-0000-0000-000000000006' -- Interactive & Community
  AND slug IN (
    'kitchen-astronomy', 'build-observatory', 'citizen-science', 'space-art-culture'
  );

-- ==============================================
-- DEFAULT MAPPINGS FOR REMAINING CATEGORIES
-- ==============================================
-- Add basic mappings for categories not explicitly configured above
-- Admins can customize these via the admin interface

INSERT INTO youtube_category_mappings (category_id, search_keywords, channel_ids, quality_threshold, sync_frequency, max_videos_per_sync)
SELECT
    cc.id,
    ARRAY[REPLACE(cc.slug, '-', ' '), 'astronomy ' || cc.name, 'space ' || cc.name]::text[] as keywords,
    ARRAY['UCLA_DiR1FfKNvjuUpBHmylQ', 'UCJkN-wlUPOmh59s1Qr6wKnQ']::text[] as channels,
    '{
        "min_views": 2000,
        "min_likes_ratio": 0.85,
        "min_subscribers": 20000,
        "content_rating": "family_friendly"
    }'::jsonb as quality,
    'weekly' as frequency,
    5 as max_videos
FROM content_categories cc
LEFT JOIN youtube_category_mappings ycm ON cc.id = ycm.category_id
WHERE ycm.id IS NULL -- Only insert if mapping doesn't already exist
  AND cc.parent_category_id IS NOT NULL; -- Only child categories

-- ==============================================
-- SUMMARY
-- ==============================================
-- Categories with custom mappings: ~60
-- Categories with default mappings: ~310
-- Total categories mapped: ~370
--
-- Top YouTube Channels Utilized:
-- - NASA (official space agency content)
-- - SpaceX (rocket launches, technology)
-- - ESA (European space missions)
-- - Fraser Cain/Universe Today (accessible astronomy)
-- - Dr. Becky (astrophysics)
-- - PBS Space Time (deep physics/cosmology)
-- - Scott Manley (rockets, orbital mechanics)
-- - Anton Petrov (daily space news)
-- - SciShow Space (space facts and news)
-- - Kurzgesagt (animated explainers)
-- - Cool Worlds (exoplanets, SETI)
--
-- Quality Thresholds Explained:
-- - min_views: Minimum view count to consider importing
-- - min_likes_ratio: Minimum likes/(likes+dislikes) ratio (0.8 = 80%)
-- - min_subscribers: Minimum channel subscriber count
-- - content_rating: "family_friendly" or "all"
