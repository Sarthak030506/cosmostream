/**
 * Manual News Sync Script (JavaScript)
 * Run this to immediately fetch news articles without waiting for cron
 */

require('dotenv').config();

const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fetchArticles() {
  console.log('🚀 Fetching articles from Spaceflight News API...\n');

  const response = await axios.get('https://api.spaceflightnewsapi.net/v4/articles', {
    params: {
      limit: 50,
      ordering: '-published_at',
    },
  });

  return response.data.results;
}

function categorizeArticle(article) {
  const combined = `${article.title} ${article.summary}`.toLowerCase();

  if (article.featured || combined.includes('breaking') || combined.includes('urgent')) {
    return 'breaking-news';
  }
  if (combined.includes('launch') || combined.includes('mission') || combined.includes('spacecraft')) {
    return 'mission-updates';
  }
  if (combined.includes('discover') || combined.includes('found') || combined.includes('exoplanet')) {
    return 'discoveries';
  }
  if (combined.includes('research') || combined.includes('study') || combined.includes('paper')) {
    return 'research-papers';
  }
  if (combined.includes('eclipse') || combined.includes('meteor shower') || combined.includes('comet')) {
    return 'astronomical-events';
  }
  if (combined.includes('telescope') || combined.includes('hubble') || combined.includes('webb')) {
    return 'telescopes-observatories';
  }
  return 'breaking-news';
}

async function getCategoryId(slug) {
  const result = await pool.query('SELECT id FROM content_categories WHERE slug = $1', [slug]);
  if (result.rows.length === 0) {
    const fallback = await pool.query('SELECT id FROM content_categories WHERE slug = $1', ['breaking-news']);
    return fallback.rows[0].id;
  }
  return result.rows[0].id;
}

async function getOrCreateSystemUser() {
  const email = 'news-bot@cosmostream.internal';
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const newUser = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, 'system', 'CosmoStream News Bot', 'creator']
  );

  return newUser.rows[0].id;
}

async function importArticle(article, authorId) {
  // Check if exists
  const existing = await pool.query('SELECT id FROM content_items WHERE source_url = $1', [article.url]);
  if (existing.rows.length > 0) {
    return false; // Skip
  }

  const categorySlug = categorizeArticle(article);
  const categoryId = await getCategoryId(categorySlug);

  await pool.query(
    `INSERT INTO content_items (
      title, description, body_markdown, category_id, author_id,
      content_type, difficulty_level, age_group, tags, media_urls,
      source_url, published_at, engagement_score, view_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      article.title,
      article.summary,
      article.summary,
      categoryId,
      authorId,
      'news',
      'beginner', // News is accessible to all, use beginner as default
      'all',
      [article.news_site.toLowerCase()],
      JSON.stringify({ thumbnail: article.image_url }),
      article.url,
      article.published_at,
      article.featured ? 100 : 0,
      0,
    ]
  );

  return true; // Imported
}

async function syncNews() {
  try {
    const articles = await fetchArticles();
    console.log(`✅ Fetched ${articles.length} articles\n`);

    const authorId = await getOrCreateSystemUser();
    console.log('✅ System user ready\n');

    let imported = 0;
    let skipped = 0;

    console.log('📥 Importing articles...');
    for (const article of articles) {
      const wasImported = await importArticle(article, authorId);
      if (wasImported) {
        imported++;
        process.stdout.write('.');
      } else {
        skipped++;
      }
    }

    console.log('\n\n✅ News sync completed!');
    console.log('═'.repeat(50));
    console.log(`📊 Results:`);
    console.log(`  • Articles fetched: ${articles.length}`);
    console.log(`  • Articles imported: ${imported}`);
    console.log(`  • Articles skipped: ${skipped} (duplicates)`);
    console.log('\n✨ News articles are now available at /news page!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to sync news:', error);
    await pool.end();
    process.exit(1);
  }
}

syncNews();
