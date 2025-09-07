const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticle() {
  try {
    const article = await prisma.article.findFirst({
      where: { slug: 'l0i3pliq' },
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        image_url: true,
        social_image: true,
        content: true
      }
    });
    
    if (article) {
      console.log('📰 Article found:');
      console.log('Title:', article.title);
      console.log('Slug:', article.slug);
      console.log('Featured Image:', article.featured_image);
      console.log('Image URL:', article.image_url);
      console.log('Social Image:', article.social_image);
      
      // Check if content has images
      if (article.content) {
        const imageMatches = article.content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
        if (imageMatches) {
          console.log('Images in content:', imageMatches.length);
          imageMatches.forEach((img, i) => {
            const srcMatch = img.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
              console.log(`  Image ${i+1}: ${srcMatch[1]}`);
            }
          });
        } else {
          console.log('No images found in content');
        }
      }
    } else {
      console.log('❌ Article not found with slug: l0i3pliq');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticle();
