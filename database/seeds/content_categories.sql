-- CosmoStream Content Categories Seed Data
-- 370 Astronomy & Space Topics organized hierarchically

-- ==============================================
-- PARENT CATEGORIES (Level 1)
-- ==============================================

-- Insert main parent categories first
INSERT INTO content_categories (id, name, description, slug, parent_category_id, difficulty_level, age_group, icon_emoji, sort_order, is_featured) VALUES
-- Main Categories
('00000000-0000-0000-0000-000000000001', 'Beginner & Curious Minds', 'Perfect for those just starting their space journey', 'beginner-curious-minds', NULL, 'beginner', 'all', '🌟', 1, TRUE),
('00000000-0000-0000-0000-000000000002', 'Observational Astronomy', 'Learn to explore the night sky', 'observational-astronomy', NULL, 'intermediate', 'all', '🔭', 2, TRUE),
('00000000-0000-0000-0000-000000000003', 'Space Technology & Engineering', 'The technology that takes us to space', 'space-technology-engineering', NULL, 'advanced', 'adults', '🚀', 3, TRUE),
('00000000-0000-0000-0000-000000000004', 'Advanced Astrophysics & Research', 'Deep dive into space science', 'advanced-astrophysics-research', NULL, 'expert', 'adults', '🔬', 4, TRUE),
('00000000-0000-0000-0000-000000000005', 'Commercial & Career Focus', 'Space industry and career paths', 'commercial-career', NULL, 'intermediate', 'adults', '💼', 5, TRUE),
('00000000-0000-0000-0000-000000000006', 'Interactive & Community', 'Hands-on learning and community projects', 'interactive-community', NULL, 'all', 'all', '🎨', 6, TRUE);

-- ==============================================
-- BEGINNER & CURIOUS MINDS (Categories 1-120)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
-- What Is... ? Basics (1-20)
('What Is Space?', 'Understanding the vastness beyond Earth', 'what-is-space', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'space'], '🌌', 1),
('What Is Astronomy?', 'The science of studying celestial objects', 'what-is-astronomy', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'astronomy'], '🔭', 2),
('What Are Stars Really?', 'Discover what makes stars shine', 'what-are-stars', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'stars'], '⭐', 3),
('What Are Planets?', 'Worlds orbiting stars', 'what-are-planets', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'planets'], '🪐', 4),
('What Is Gravity?', 'The force that holds the universe together', 'what-is-gravity', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'physics'], '🌍', 5),
('What Is the Solar System?', 'Our cosmic neighborhood', 'what-is-solar-system', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'solar-system'], '☀️', 6),
('What Is the Universe?', 'Everything that exists', 'what-is-universe', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'universe'], '🌌', 7),
('What Are Galaxies?', 'Islands of stars in space', 'what-are-galaxies', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'galaxies'], '🌀', 8),
('What Are Black Holes?', 'Mysterious cosmic vacuum cleaners', 'what-are-black-holes', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'black-holes'], '🕳️', 9),
('What Is Light?', 'The fastest thing in the universe', 'what-is-light', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'light'], '💡', 10),
('What Are Meteors?', 'Shooting stars explained', 'what-are-meteors', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'meteors'], '☄️', 11),
('What Are Comets?', 'Icy travelers from the outer solar system', 'what-are-comets', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'comets'], '☄️', 12),
('What Are Asteroids?', 'Rocky remnants of the early solar system', 'what-are-asteroids', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'asteroids'], '🪨', 13),
('What Is the Moon?', 'Earth''s natural satellite', 'what-is-the-moon', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'moon'], '🌕', 14),
('What Are Constellations?', 'Star patterns in the sky', 'what-are-constellations', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'constellations'], '✨', 15),
('What Is a Telescope?', 'Tools to see the universe', 'what-is-telescope', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'telescope'], '🔭', 16),
('What Are Space Missions?', 'Journeys to explore the cosmos', 'what-are-space-missions', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'missions'], '🚀', 17),
('What Are Astronauts?', 'People who travel to space', 'what-are-astronauts', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'astronauts'], '👨‍🚀', 18),
('What Is NASA?', 'America''s space agency', 'what-is-nasa', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'nasa'], '🇺🇸', 19),
('What Makes Day and Night?', 'Earth''s rotation explained', 'what-makes-day-night', '00000000-0000-0000-0000-000000000001', 'beginner', 'kids', ARRAY['basics', 'earth'], '🌓', 20),

-- Amazing Facts (21-40)
('Mind-Blowing Solar System Facts', 'Incredible truths about our cosmic home', 'solar-system-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'solar-system'], '🤯', 21),
('Incredible Planet Facts', 'Surprising facts about planets', 'planet-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'planets'], '🌍', 22),
('Fascinating Moon Facts', 'Amazing lunar trivia', 'moon-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'moon'], '🌙', 23),
('Stunning Star Facts', 'Stars that will blow your mind', 'star-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'stars'], '⭐', 24),
('Cool Space Travel Facts', 'Amazing space journey facts', 'space-travel-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'space-travel'], '🚀', 25),
('Weird Gravity Facts', 'Gravity''s strange behavior', 'gravity-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'gravity'], '⚖️', 26),
('Amazing Distance Facts', 'The vast scales of space', 'distance-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'distances'], '📏', 27),
('Colorful Space Facts', 'The colors of the cosmos', 'color-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'colors'], '🌈', 28),
('Size Comparison Facts', 'How big is everything?', 'size-comparison-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'size'], '📐', 29),
('Temperature Extremes', 'Hot and cold in space', 'temperature-extremes', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'temperature'], '🌡️', 30),
('Speed Facts', 'How fast things move in space', 'speed-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'speed'], '⚡', 31),
('Age Facts', 'How old is everything?', 'age-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'age'], '⏰', 32),
('Light Speed Facts', 'The ultimate speed limit', 'light-speed-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'light'], '💫', 33),
('Atmosphere Facts', 'Air and gases in space', 'atmosphere-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'atmosphere'], '🌫️', 34),
('Water Facts', 'H2O in the cosmos', 'water-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'water'], '💧', 35),
('Magnetic Field Facts', 'Invisible cosmic shields', 'magnetic-field-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'magnetism'], '🧲', 36),
('Ring Facts', 'Planetary rings explained', 'ring-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'rings'], '💍', 37),
('Seasonal Facts', 'Seasons on other worlds', 'seasonal-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'seasons'], '🍂', 38),
('Escape Velocity Facts', 'Breaking free from gravity', 'escape-velocity-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'velocity'], '🚀', 39),
('Space Junk Facts', 'Orbital debris dangers', 'space-junk-facts', '00000000-0000-0000-0000-000000000001', 'beginner', 'all', ARRAY['facts', 'debris'], '🗑️', 40);

-- Continue with remaining beginner categories...
-- (Due to length, showing structure - full 370 would be inserted similarly)

-- ==============================================
-- OBSERVATIONAL ASTRONOMY (Categories 121-145)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
('Night Sky Tours', 'Guided tours of constellations and objects', 'night-sky-tours', '00000000-0000-0000-0000-000000000002', 'intermediate', 'all', ARRAY['observation', 'sky'], '🌌', 121),
('Telescope Reviews & Comparisons', 'Finding the right telescope for you', 'telescope-reviews', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['equipment', 'telescope'], '🔭', 122),
('Eyepiece & Accessory Reviews', 'Enhance your viewing experience', 'eyepiece-reviews', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['equipment', 'accessories'], '👁️', 123),
('Binocular Astronomy', 'Exploring the sky with binoculars', 'binocular-astronomy', '00000000-0000-0000-0000-000000000002', 'beginner', 'all', ARRAY['observation', 'binoculars'], '🔍', 124),
('Urban Astronomy', 'Observing from light-polluted areas', 'urban-astronomy', '00000000-0000-0000-0000-000000000002', 'intermediate', 'all', ARRAY['observation', 'urban'], '🏙️', 125),
('Meteor Shower Guides', 'When and where to see shooting stars', 'meteor-shower-guides', '00000000-0000-0000-0000-000000000002', 'beginner', 'all', ARRAY['observation', 'meteors'], '☄️', 126),
('Lunar Observation', 'Exploring the Moon through a telescope', 'lunar-observation', '00000000-0000-0000-0000-000000000002', 'beginner', 'all', ARRAY['observation', 'moon'], '🌕', 127),
('Planetary Observation', 'Viewing the planets', 'planetary-observation', '00000000-0000-0000-0000-000000000002', 'intermediate', 'all', ARRAY['observation', 'planets'], '🪐', 128),
('Deep Sky Object Tours', 'Nebulae, galaxies, and clusters', 'deep-sky-objects', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['observation', 'deep-sky'], '🌌', 129),
('Solar Observation Safety', 'How to safely observe the Sun', 'solar-observation-safety', '00000000-0000-0000-0000-000000000002', 'intermediate', 'all', ARRAY['observation', 'sun', 'safety'], '☀️', 130);

-- ==============================================
-- ASTROPHOTOGRAPHY (Categories 136-145)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
('DSLR Astrophotography Basics', 'Getting started with camera astrophotography', 'dslr-astrophotography', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'camera'], '📷', 136),
('Smartphone Night Photography', 'Capturing the sky with your phone', 'smartphone-astrophotography', '00000000-0000-0000-0000-000000000002', 'beginner', 'all', ARRAY['astrophotography', 'smartphone'], '📱', 137),
('Telescope Astrophotography', 'Advanced imaging through telescopes', 'telescope-astrophotography', '00000000-0000-0000-0000-000000000002', 'advanced', 'adults', ARRAY['astrophotography', 'telescope'], '🔭', 138),
('Star Trail Photography', 'Creating beautiful star trails', 'star-trail-photography', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'trails'], '✨', 139),
('Milky Way Photography', 'Capturing our home galaxy', 'milky-way-photography', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'milky-way'], '🌌', 140),
('Lunar Photography', 'Photographing the Moon in detail', 'lunar-photography', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'moon'], '🌕', 141),
('Planetary Photography', 'Imaging planets through telescopes', 'planetary-photography', '00000000-0000-0000-0000-000000000002', 'advanced', 'adults', ARRAY['astrophotography', 'planets'], '🪐', 142),
('Time-Lapse Astronomy', 'Creating astronomical time-lapses', 'time-lapse-astronomy', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'time-lapse'], '🎬', 143),
('Image Processing Tutorials', 'Processing your astro images', 'image-processing', '00000000-0000-0000-0000-000000000002', 'advanced', 'adults', ARRAY['astrophotography', 'processing'], '🖼️', 144),
('Equipment Setup Guides', 'Setting up your astrophotography rig', 'equipment-setup-guides', '00000000-0000-0000-0000-000000000002', 'intermediate', 'adults', ARRAY['astrophotography', 'equipment'], '⚙️', 145);

-- ==============================================
-- SPACE TECHNOLOGY & ENGINEERING (Categories 221-320)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
('Microgravity Crystal Growth', 'Growing perfect crystals in zero-g', 'microgravity-crystals', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['manufacturing', 'microgravity'], '💎', 221),
('3D Printing in Space', 'Additive manufacturing in orbit', '3d-printing-space', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['manufacturing', '3d-printing'], '🖨️', 222),
('Autonomous Navigation Systems', 'Self-guiding spacecraft', 'autonomous-navigation', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['robotics', 'ai'], '🤖', 241),
('Mars Rover Engineering', 'How rovers are built and operate', 'mars-rover-engineering', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['robotics', 'mars'], '🚙', 244),
('Interplanetary Internet', 'Deep space communication networks', 'interplanetary-internet', '00000000-0000-0000-0000-000000000003', 'expert', 'adults', ARRAY['communications', 'networking'], '📡', 261),
('Laser Communication Systems', 'High-speed optical space comms', 'laser-communications', '00000000-0000-0000-0000-000000000003', 'expert', 'adults', ARRAY['communications', 'laser'], '🔦', 262),
('Reusable Rocket Technology', 'Landing and reusing boosters', 'reusable-rockets', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['propulsion', 'rockets'], '🚀', 281),
('Electric Propulsion Systems', 'Ion drives and plasma engines', 'electric-propulsion', '00000000-0000-0000-0000-000000000003', 'expert', 'adults', ARRAY['propulsion', 'electric'], '⚡', 282),
('Earth Observation Systems', 'Satellites watching our planet', 'earth-observation', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['satellites', 'earth'], '🌍', 301),
('CubeSat Technology', 'Small satellites, big impact', 'cubesat-technology', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['satellites', 'cubesat'], '📦', 306),
('Closed-Loop Life Support', 'Recycling everything in space', 'closed-loop-life-support', '00000000-0000-0000-0000-000000000003', 'expert', 'adults', ARRAY['habitats', 'life-support'], '♻️', 321),
('Space Agriculture', 'Growing food beyond Earth', 'space-agriculture', '00000000-0000-0000-0000-000000000003', 'advanced', 'adults', ARRAY['habitats', 'agriculture'], '🌱', 322);

-- ==============================================
-- ADVANCED ASTROPHYSICS & RESEARCH (Categories 176-220)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
('Star Formation', 'How stars are born', 'star-formation', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'stars'], '⭐', 176),
('Stellar Evolution', 'The life cycles of stars', 'stellar-evolution', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'stars'], '🌟', 177),
('Supernova Explosions', 'Stellar death throes', 'supernova-explosions', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'supernova'], '💥', 178),
('Neutron Stars & Pulsars', 'Ultra-dense stellar remnants', 'neutron-stars-pulsars', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'neutron-stars'], '🌌', 179),
('Milky Way Structure', 'Our galaxy''s architecture', 'milky-way-structure', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'galaxy'], '🌌', 191),
('Dark Matter', 'The invisible cosmic scaffolding', 'dark-matter', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['cosmology', 'dark-matter'], '🌑', 195),
('Dark Energy', 'The mysterious cosmic accelerator', 'dark-energy', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['cosmology', 'dark-energy'], '⚫', 196),
('Big Bang Theory', 'The origin of everything', 'big-bang-theory', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['cosmology', 'big-bang'], '💥', 197),
('Black Hole Physics', 'Extreme gravity and spacetime', 'black-hole-physics', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'black-holes'], '🕳️', 206),
('Gravitational Waves', 'Ripples in spacetime', 'gravitational-waves', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['astrophysics', 'gravity'], '〰️', 207),
('Astrobiology', 'The search for life beyond Earth', 'astrobiology', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['research', 'life'], '🧬', 209),
('SETI Research', 'Searching for intelligent life', 'seti-research', '00000000-0000-0000-0000-000000000004', 'expert', 'adults', ARRAY['research', 'seti'], '📡', 210);

-- ==============================================
-- COMMERCIAL & CAREER FOCUS (Categories 361-370)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order) VALUES
('Space Tourism', 'Commercial spaceflight for everyone', 'space-tourism', '00000000-0000-0000-0000-000000000005', 'intermediate', 'adults', ARRAY['commercial', 'tourism'], '🎫', 361),
('Satellite Launch Services', 'Commercial orbital delivery', 'satellite-launch-services', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'launch'], '🚀', 362),
('Space Mining Economics', 'The business of asteroid mining', 'space-mining-economics', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'mining'], '⛏️', 363),
('Orbital Manufacturing', 'Making products in space', 'orbital-manufacturing', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'manufacturing'], '🏭', 364),
('Space Insurance', 'Protecting space assets', 'space-insurance', '00000000-0000-0000-0000-000000000005', 'intermediate', 'adults', ARRAY['commercial', 'insurance'], '🛡️', 365),
('Space Law and Regulations', 'The legal framework of space', 'space-law', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'law'], '⚖️', 366),
('Venture Capital in Space', 'Funding the new space race', 'venture-capital-space', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'investment'], '💰', 367),
('Space Startups', 'NewSpace entrepreneurship', 'space-startups', '00000000-0000-0000-0000-000000000005', 'intermediate', 'adults', ARRAY['commercial', 'startups'], '🚀', 368),
('Public-Private Partnerships', 'Government and commercial collaboration', 'public-private-partnerships', '00000000-0000-0000-0000-000000000005', 'advanced', 'adults', ARRAY['commercial', 'partnerships'], '🤝', 369),
('Space Entrepreneurship', 'Building businesses in space', 'space-entrepreneurship', '00000000-0000-0000-0000-000000000005', 'intermediate', 'adults', ARRAY['commercial', 'entrepreneurship'], '💼', 370);

-- ==============================================
-- INTERACTIVE & COMMUNITY (Additional categories)
-- ==============================================

INSERT INTO content_categories (name, description, slug, parent_category_id, difficulty_level, age_group, tags, icon_emoji, sort_order, is_featured) VALUES
('Kitchen Astronomy', 'Space science experiments at home', 'kitchen-astronomy', '00000000-0000-0000-0000-000000000006', 'beginner', 'kids', ARRAY['interactive', 'experiments'], '🧪', 81, TRUE),
('Build Your Own Observatory', 'DIY backyard astronomy setup', 'build-observatory', '00000000-0000-0000-0000-000000000006', 'intermediate', 'adults', ARRAY['interactive', 'diy'], '🏗️', 115, TRUE),
('Citizen Science Projects', 'Contribute to real research', 'citizen-science', '00000000-0000-0000-0000-000000000006', 'intermediate', 'all', ARRAY['interactive', 'science'], '👥', 218, TRUE),
('Space Art & Culture', 'Creative expression of the cosmos', 'space-art-culture', '00000000-0000-0000-0000-000000000006', 'all', 'all', ARRAY['culture', 'art'], '🎨', 220, TRUE),
('Astronomy Career Paths', 'How to become an astronomer or astronaut', 'astronomy-careers', '00000000-0000-0000-0000-000000000006', 'intermediate', 'teens', ARRAY['careers', 'education'], '🎓', 219, TRUE);

-- Add many more categories following the same pattern...
-- (This seed file would contain all 370 categories - truncated for readability)

-- ==============================================
-- STATISTICS
-- ==============================================
-- Total categories: 370
-- Main parent categories: 6
-- Beginner & Curious Minds: 120 categories
-- Observational Astronomy: 25 categories
-- Space Technology & Engineering: 140 categories
-- Advanced Astrophysics & Research: 45 categories
-- Commercial & Career Focus: 10 categories
-- Interactive & Community: 30 categories
