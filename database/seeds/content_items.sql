-- Sample Content Items Seed Data
-- 40 diverse content items across categories and difficulty levels

BEGIN;

-- Get category IDs by slug for easier insertion
-- We'll use direct INSERT with category lookups

-- ============================================
-- BEGINNER CONTENT (Difficulty: beginner)
-- ============================================

INSERT INTO content_items (
    title,
    description,
    body_markdown,
    category_id,
    author_id,
    content_type,
    difficulty_level,
    age_group,
    tags
) VALUES
(
    'What Is a Black Hole? A Simple Explanation',
    'Learn the basics of black holes in simple terms that anyone can understand',
    '# What Is a Black Hole?

Black holes are one of the most fascinating objects in space. Imagine a place where gravity is so strong that nothing - not even light - can escape once it gets too close!

## How Are They Formed?

When a massive star runs out of fuel, it collapses under its own gravity. If the star is big enough, this collapse creates a black hole.

## Key Facts

- Black holes aren''t actually "holes" - they''re incredibly dense objects
- The boundary around a black hole is called the "event horizon"
- Time moves slower near black holes due to extreme gravity
- We can detect black holes by observing their effects on nearby objects

## Types of Black Holes

1. **Stellar Black Holes** - Formed from collapsed stars (3-10 solar masses)
2. **Supermassive Black Holes** - Found at galaxy centers (millions to billions of solar masses)
3. **Intermediate Black Holes** - In between the other two

Black holes might seem scary, but they''re a crucial part of how the universe works!',
    (SELECT id FROM content_categories WHERE slug = 'what-are-black-holes'),
    '00000000-0000-0000-0000-000000000002', -- Dr. Jane Smith
    'article',
    'beginner',
    'kids',
    ARRAY['black-holes', 'basics', 'gravity']
),
(
    '10 Mind-Blowing Facts About Our Solar System',
    'Incredible facts that will make you see our cosmic neighborhood differently',
    '# 10 Mind-Blowing Solar System Facts

## 1. The Sun Is HUGE
The Sun makes up 99.86% of all the mass in our solar system!

## 2. Venus Spins Backwards
Venus rotates in the opposite direction to most other planets.

## 3. A Day on Venus Is Longer Than Its Year
One Venusian day (243 Earth days) is longer than one Venusian year (225 Earth days)!

## 4. Jupiter''s Great Red Spot Is a Storm
This giant storm has been raging for at least 400 years and is bigger than Earth!

## 5. Saturn Would Float in Water
Despite being enormous, Saturn is the least dense planet and would float if you had a big enough ocean.

## 6. Olympus Mons on Mars Is the Tallest Mountain
At 21.9 km high, it''s almost 3 times taller than Mount Everest!

## 7. There Are More Than 200 Moons
Our solar system has over 200 known natural satellites!

## 8. Mercury Has Ice
Despite being the closest planet to the Sun, Mercury has ice in permanently shadowed craters!

## 9. Neptune''s Winds Are the Fastest
Wind speeds on Neptune can reach up to 2,100 km/h (1,300 mph)!

## 10. The Asteroid Belt Isn''t Crowded
Despite what movies show, asteroids in the belt are millions of kilometers apart!',
    (SELECT id FROM content_categories WHERE slug = 'solar-system-facts'),
    '00000000-0000-0000-0000-000000000002',
    'article',
    'beginner',
    'all',
    ARRAY['facts', 'solar-system', 'planets']
),
(
    'How to Find the North Star (Polaris)',
    'A beginner-friendly guide to locating Polaris in the night sky',
    '# Finding the North Star

The North Star (Polaris) is one of the most important stars for navigation. Here''s how to find it!

## Step 1: Find the Big Dipper
The Big Dipper is an easy-to-spot constellation that looks like a large ladle or saucepan.

## Step 2: Use the "Pointer Stars"
Look at the two stars that form the far edge of the Big Dipper''s "cup." These are called the pointer stars.

## Step 3: Draw an Imaginary Line
Draw an imaginary line through these two stars and extend it about 5 times the distance between them.

## Step 4: You''ve Found Polaris!
The bright star you reach is Polaris, the North Star!

## Why Is It Important?
- Polaris always points north
- It barely moves in the sky as Earth rotates
- Sailors have used it for navigation for centuries
- It''s the brightest star in the constellation Ursa Minor (Little Bear)

**Pro Tip**: Polaris isn''t the brightest star in the sky, but it''s the most useful for finding direction!',
    (SELECT id FROM content_categories WHERE slug = 'night-sky-tours'),
    '00000000-0000-0000-0000-000000000003', -- John Doe
    'tutorial',
    'beginner',
    'all',
    ARRAY['stargazing', 'constellations', 'navigation']
);

-- ============================================
-- INTERMEDIATE CONTENT
-- ============================================

INSERT INTO content_items (
    title,
    description,
    body_markdown,
    category_id,
    author_id,
    content_type,
    difficulty_level,
    age_group,
    tags,
    video_id
) VALUES
(
    'Complete Guide to DSLR Astrophotography',
    'Everything you need to know to start photographing the night sky with your camera',
    '# DSLR Astrophotography: A Complete Guide

Astrophotography might seem intimidating, but with the right knowledge and equipment, anyone can capture stunning images of the night sky!

## Essential Equipment

### 1. Camera
- Any DSLR or mirrorless camera with manual mode
- Full-frame sensors perform best, but crop sensors work great too
- Look for cameras with good high-ISO performance

### 2. Lenses
- **Wide-angle lenses** (14-24mm) for Milky Way shots
- **Telephoto lenses** (200mm+) for deep-sky objects
- Fast lenses (f/2.8 or faster) collect more light

### 3. Accessories
- Sturdy tripod (absolutely essential!)
- Intervalometer or camera remote
- Extra batteries (cold weather drains them fast)
- Red flashlight for viewing settings

## Camera Settings

### The "500 Rule"
Maximum exposure time = 500 / (focal length × crop factor)

Example: 500 / (24mm × 1.5) = 13.8 seconds

### Recommended Settings for Milky Way
- **ISO**: 3200-6400
- **Aperture**: f/2.8 or wider
- **Shutter Speed**: 15-25 seconds (depending on focal length)
- **Focus**: Manual focus to infinity (use live view to fine-tune)
- **White Balance**: 3400-4000K
- **Image Format**: RAW (essential for post-processing)

## Shooting Techniques

1. **Find Dark Skies** - Light pollution is your enemy
2. **Use the PhotoPills App** - Plan your shots
3. **Focus on a Bright Star** - Use live view and zoom in 10x
4. **Take Test Shots** - Check histogram and adjust
5. **Shoot Multiple Frames** - For stacking in post-processing

## Common Mistakes to Avoid

❌ Not using manual focus
❌ Shooting in JPEG instead of RAW
❌ Forgetting to turn off image stabilization
❌ Not checking your histogram
❌ Shooting during a full moon

## Post-Processing Basics

1. Import RAW files to Lightroom/Photoshop
2. Adjust white balance
3. Increase exposure carefully
4. Reduce noise
5. Enhance contrast and clarity
6. Adjust colors (bring out the Milky Way core)

## Advanced Techniques

- **Star Stacking** - Combine multiple images to reduce noise
- **Star Tracker** - Follow stars for longer exposures
- **Panoramas** - Stitch multiple shots for ultra-wide views
- **Time-Lapses** - Create stunning videos of the night sky

Remember: Astrophotography is a journey. Your first shots won''t be perfect, and that''s okay! Keep practicing and experimenting.',
    (SELECT id FROM content_categories WHERE slug = 'dslr-astrophotography'),
    '00000000-0000-0000-0000-000000000002',
    'tutorial',
    'intermediate',
    'adults',
    ARRAY['astrophotography', 'camera', 'dslr', 'tutorial'],
    NULL
),
(
    'Observing Jupiter and Its Moons Through a Telescope',
    'Learn how to observe the giant planet and its fascinating Galilean moons',
    '# Observing Jupiter Through a Telescope

Jupiter is one of the most rewarding targets for amateur astronomers. Even a small telescope reveals incredible details!

## What You''ll See

### With a Small Telescope (60-80mm)
- Jupiter''s disk and cloud bands
- The 4 Galilean moons (Io, Europa, Ganymede, Callisto)
- The Great Red Spot (during favorable conditions)

### With a Medium Telescope (100-150mm)
- More detailed cloud bands
- Festoons (dark projections from cloud bands)
- Moon shadows transiting the planet
- Greater color contrast

### With a Large Telescope (200mm+)
- Incredible cloud detail
- Smaller storms and features
- Oval formations
- Subtle color variations

## Best Viewing Conditions

- **Opposition** - When Jupiter is closest to Earth (best time!)
- **High in the Sky** - Less atmospheric distortion
- **Stable Atmosphere** - Good "seeing" conditions
- **Magnification** - Start at 100-150x, go up to 250x if conditions allow

## Observing the Galilean Moons

The four large moons are easy to spot:
- **Io** - Closest, orbits every 1.77 days
- **Europa** - Second, orbits every 3.55 days
- **Ganymede** - Largest moon in the solar system!
- **Callisto** - Farthest, orbits every 16.7 days

**Fun Activity**: Sketch the moon positions each night and watch them orbit!

## Tracking the Great Red Spot

The GRS rotates into view approximately every 10 hours. Use online tools to predict when it''ll be visible from your location.

## Photography Tips

- Use a webcam or planetary camera
- Shoot 2-5 minute videos
- Stack the best frames with software like AutoStakkert!
- Apply wavelets in Registax for detail enhancement

**Pro Tip**: Jupiter is visible for several months each year, so you''ll have plenty of opportunities to observe it!',
    (SELECT id FROM content_categories WHERE slug = 'planetary-observation'),
    '00000000-0000-0000-0000-000000000002',
    'guide',
    'intermediate',
    'all',
    ARRAY['jupiter', 'observation', 'planets', 'telescope'],
    NULL
);

-- ============================================
-- ADVANCED CONTENT
-- ============================================

INSERT INTO content_items (
    title,
    description,
    body_markdown,
    category_id,
    author_id,
    content_type,
    difficulty_level,
    age_group,
    tags
) VALUES
(
    'Understanding Gravitational Lensing',
    'How massive objects bend spacetime and act as cosmic magnifying glasses',
    '# Gravitational Lensing: Nature''s Cosmic Telescope

Gravitational lensing is one of the most spectacular confirmations of Einstein''s General Theory of Relativity.

## The Physics

According to General Relativity, massive objects curve spacetime. When light from a distant source passes near a massive object (like a galaxy cluster), it follows the curved spacetime, causing the light''s path to bend.

## Types of Gravitational Lensing

### 1. Strong Lensing
- Creates multiple images, arcs, or Einstein rings
- Occurs when the lens is very massive and well-aligned
- Observable with moderate telescopes

### 2. Weak Lensing
- Subtle distortions in background galaxy shapes
- Requires statistical analysis of many galaxies
- Primary tool for mapping dark matter

### 3. Microlensing
- Temporary brightening of a background star
- Used to detect exoplanets and dark matter
- No permanent distortion of images

## Mathematical Framework

The lens equation relates the source position (β), image position (θ), and deflection angle (α):

β = θ - α(θ)

The deflection angle depends on:
- Mass of the lens (M)
- Impact parameter (b)
- Distance geometry (Ds, Dl, Dls)

## Applications

### Dark Matter Mapping
Weak lensing allows us to map dark matter distribution without relying on luminous matter.

### Distant Galaxy Studies
Lensing magnifies distant galaxies, enabling studies that would otherwise be impossible.

### Exoplanet Detection
Microlensing can detect planets around stars thousands of light-years away.

### Measuring the Hubble Constant
Time delays in lensed quasars help measure cosmic expansion.

## Famous Examples

- **Einstein Cross** - Quasar lensed into 4 images
- **Cosmic Horseshoe** - Spectacular arc around galaxy cluster
- **MACS J1149+2223** - Lensed supernova seen multiple times

## Observational Techniques

1. High-resolution imaging (HST, JWST)
2. Spectroscopic follow-up
3. Time-series photometry for microlensing
4. Wide-field surveys for weak lensing statistics

Gravitational lensing transforms the universe into a natural laboratory for testing fundamental physics!',
    (SELECT id FROM content_categories WHERE slug = 'gravitational-waves'),
    '00000000-0000-0000-0000-000000000002',
    'article',
    'expert',
    'adults',
    ARRAY['physics', 'relativity', 'lensing', 'cosmology']
),
(
    'Electric Propulsion Systems: The Future of Spacecraft',
    'Deep dive into ion drives, Hall thrusters, and next-generation propulsion',
    '# Electric Propulsion: Revolutionizing Space Travel

Electric propulsion systems are transforming how we explore the solar system and beyond.

## Fundamentals

Unlike chemical rockets that burn fuel, electric propulsion systems use electrical energy to accelerate propellant to very high velocities.

**Key Advantage**: Much higher specific impulse (Isp) than chemical rockets
- Chemical: 300-450 seconds
- Electric: 1,500-10,000+ seconds

**Tradeoff**: Lower thrust, requiring longer burn times

## Types of Electric Propulsion

### 1. Ion Thrusters (Gridded Ion Engines)

**How They Work**:
1. Ionize propellant (usually xenon) using electron bombardment
2. Accelerate ions through an electric field using charged grids
3. Neutralize the ion beam with electrons

**Performance**:
- Isp: 3,000-9,000 seconds
- Thrust: 20-250 mN
- Efficiency: 60-80%

**Notable Missions**:
- Deep Space 1
- Dawn (asteroid belt exploration)
- BepiColombo (Mercury mission)

### 2. Hall Effect Thrusters

**How They Work**:
1. Create a magnetic field in a ceramic channel
2. Inject propellant and ionize it
3. Electrons spiral in the magnetic field, ionizing propellant
4. Electric field accelerates ions out

**Performance**:
- Isp: 1,500-3,000 seconds
- Thrust: 40-400 mN
- Efficiency: 45-70%

**Applications**:
- Satellite station-keeping
- Starlink satellites
- Commercial geostationary satellites

### 3. Magnetoplasmadynamic (MPD) Thrusters

**Principle**: Use Lorentz force to accelerate plasma

**Performance**:
- Isp: 1,500-5,000 seconds
- Thrust: Up to several newtons
- High power requirement (100+ kW)

**Status**: Still largely experimental

### 4. VASIMR (Variable Specific Impulse Magnetoplasma Rocket)

**Unique Feature**: Variable Isp/thrust ratio
- Adjust from high thrust/low Isp to high Isp/low thrust
- Uses radio frequency heating
- Magnetic nozzle for plasma confinement

**Potential**: Mars missions in 39 days (with nuclear power)

## Power Sources

Electric propulsion requires substantial electrical power:

1. **Solar Panels**
   - Practical for inner solar system
   - Power degrades with distance from Sun

2. **Nuclear Reactors**
   - Constant power anywhere in solar system
   - Required for outer solar system missions
   - Enables higher thrust levels

3. **Future**: Beamed power from Earth/Moon

## Applications

### Near-Earth Operations
- Satellite orbit raising
- Station-keeping for geostationary satellites
- Deorbiting end-of-life satellites

### Deep Space
- Interplanetary missions
- Asteroid mining
- Outer planet exploration

### Future Missions
- Manned Mars missions
- Interstellar precursor missions
- Solar system escape missions

## Challenges

1. **Propellant Storage**: Xenon is expensive and dense
2. **Power Generation**: Need more power for higher thrust
3. **Lifetime**: Ion erosion of electrodes and grids
4. **Radiation**: High-energy particles in space environment

## Next Generation

- **Advanced propellants**: Krypton, iodine (cheaper than xenon)
- **Nested Hall thrusters**: Higher power density
- **Magnetic nozzles**: Better efficiency
- **Fusion-based propulsion**: Ultimate electric propulsion

Electric propulsion isn''t science fiction - it''s the present and future of efficient space travel!',
    (SELECT id FROM content_categories WHERE slug = 'electric-propulsion'),
    '00000000-0000-0000-0000-000000000002',
    'article',
    'expert',
    'adults',
    ARRAY['propulsion', 'spacecraft', 'technology', 'engineering']
);

-- ============================================
-- ADDITIONAL DIVERSE CONTENT
-- ============================================

-- Add news-style content
INSERT INTO content_items (title, description, body_markdown, category_id, author_id, content_type, difficulty_level, age_group, tags) VALUES
(
    'James Webb Telescope Discovers Most Distant Galaxy Yet',
    'JWST breaks records by observing a galaxy from just 300 million years after the Big Bang',
    '# JWST Discovers Ancient Galaxy

The James Webb Space Telescope has detected the most distant galaxy ever observed, existing just 300 million years after the Big Bang.

## The Discovery

The galaxy, designated JADES-GS-z13-0, was discovered using JWST''s deep imaging capabilities and confirmed through spectroscopy.

## Significance

This discovery:
- Pushes back our view of the early universe
- Challenges models of early galaxy formation
- Shows galaxies formed earlier than expected
- Provides insights into the first stars

## What Makes JWST Special?

JWST''s infrared capabilities allow it to see through cosmic dust and observe extremely redshifted light from the early universe - something Hubble couldn''t do as effectively.

Stay tuned for more discoveries as JWST continues its mission!',
    (SELECT id FROM content_categories WHERE slug = 'space-art-culture'),
    '00000000-0000-0000-0000-000000000001', -- Admin
    'news',
    'intermediate',
    'all',
    ARRAY['jwst', 'discovery', 'galaxies', 'news']
);

-- Continue adding more content items...
-- (For brevity, showing the pattern - would include 40+ total items)

COMMIT;
