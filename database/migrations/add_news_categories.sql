-- News Categories Migration
-- Add predefined news categories for space/astronomy news

-- Insert news categories into content_categories table
-- These categories will be used to organize news articles

INSERT INTO content_categories (name, description, slug, difficulty_level, age_group, tags, icon_emoji, sort_order, is_featured, parent_category_id)
VALUES
  -- Main News category
  (
    'Space News',
    'Latest breaking news, discoveries, and updates from the world of space and astronomy',
    'space-news',
    'all',
    'all',
    ARRAY['news', 'updates', 'current events'],
    '📰',
    1000,
    TRUE,
    NULL
  )
ON CONFLICT (slug) DO NOTHING;

-- Get the ID of the main Space News category
DO $$
DECLARE
  news_category_id UUID;
BEGIN
  SELECT id INTO news_category_id FROM content_categories WHERE slug = 'space-news';

  -- Insert subcategories under Space News
  INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order, is_featured)
  VALUES
    (
      'Breaking News',
      'Latest breaking news and urgent updates from space agencies and missions',
      'breaking-news',
      news_category_id,
      'all',
      'all',
      ARRAY['breaking', 'urgent', 'latest'],
      '🚨',
      1,
      TRUE
    ),
    (
      'Discoveries',
      'New astronomical discoveries, exoplanets, celestial objects, and phenomena',
      'discoveries',
      news_category_id,
      'all',
      'all',
      ARRAY['discovery', 'exoplanet', 'black hole', 'galaxy', 'nebula'],
      '🔭',
      2,
      TRUE
    ),
    (
      'Mission Updates',
      'Updates from active space missions, launches, landings, and mission milestones',
      'mission-updates',
      news_category_id,
      'all',
      'all',
      ARRAY['mission', 'launch', 'landing', 'spacecraft', 'rover'],
      '🚀',
      3,
      TRUE
    ),
    (
      'Research & Papers',
      'New research findings, published papers, and scientific breakthroughs',
      'research-papers',
      news_category_id,
      'advanced',
      'adults',
      ARRAY['research', 'paper', 'study', 'science'],
      '📊',
      4,
      FALSE
    ),
    (
      'Technology & Innovation',
      'New space technology, propulsion systems, satellites, and engineering innovations',
      'technology-innovation',
      news_category_id,
      'intermediate',
      'all',
      ARRAY['technology', 'innovation', 'engineering', 'satellite'],
      '⚙️',
      5,
      FALSE
    ),
    (
      'Space Industry',
      'Commercial space news, startups, funding, policy, and industry developments',
      'space-industry',
      news_category_id,
      'intermediate',
      'adults',
      ARRAY['commercial', 'industry', 'business', 'policy'],
      '💼',
      6,
      FALSE
    ),
    (
      'Astronomical Events',
      'Upcoming and recent eclipses, meteor showers, planetary alignments, and sky events',
      'astronomical-events',
      news_category_id,
      'beginner',
      'all',
      ARRAY['event', 'eclipse', 'meteor shower', 'alignment'],
      '🌠',
      7,
      TRUE
    ),
    (
      'Telescopes & Observatories',
      'News from major telescopes and observatories (JWST, Hubble, VLT, etc.)',
      'telescopes-observatories',
      news_category_id,
      'intermediate',
      'all',
      ARRAY['telescope', 'observatory', 'JWST', 'Hubble', 'observation'],
      '🔬',
      8,
      FALSE
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Verify the categories were inserted
SELECT
  c1.name as parent_category,
  c2.name as subcategory,
  c2.icon_emoji,
  c2.is_featured
FROM content_categories c1
LEFT JOIN content_categories c2 ON c2.parent_category_id = c1.id
WHERE c1.slug = 'space-news'
ORDER BY c2.sort_order;
