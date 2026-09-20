import Header from '../../components/Header';
import BlogHero from '../../components/blog/BlogHero';
import ReadingList from '../../components/blog/ReadingList';
import RelatedBlog from '../../components/blog/RelatedBlog';
import MarketingArticles from '../../components/blog/MarketingArticles';
import BlogFooter from '../../components/blog/BlogFooter';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <BlogHero />
        <ReadingList />
        <RelatedBlog />
        <MarketingArticles />
      </main>

      <BlogFooter />
    </div>
  );
}