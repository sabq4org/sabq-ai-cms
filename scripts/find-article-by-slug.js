const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function findArticle(slug) {
  if (!slug) {
    console.error("Please provide a slug to search for.");
    return;
  }
  console.log(`🔍 Searching for article with slug: ${slug}`);
  try {
    const article = await prisma.articles.findFirst({
      where: { slug: slug },
      select: {
        id: true,
        title: true,
        slug: true,
        article_type: true,
        content_type: true,
        published_at: true,
      },
    });

    if (article) {
      console.log("✅ Article found:");
      console.log(JSON.stringify(article, null, 2));
    } else {
      console.log("❌ Article not found.");
    }
  } catch (error) {
    console.error("❌ Error querying the database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const slugToFind = process.argv[2];
findArticle(slugToFind);
