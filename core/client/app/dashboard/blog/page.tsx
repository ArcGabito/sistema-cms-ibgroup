import type { Metadata } from "next";
import { getPosts } from "@/app/lib/posts";
import BlogModule from "@/app/components/dashboard/BlogModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Blog | Dashboard IBOutplacement",
};

export default async function DashboardBlogPage() {
  const posts = await getPosts();

  return (
    // On desktop the page fills the viewport exactly (the dashboard layout
    // pads it by 2.5rem top and bottom) and each column scrolls on its own,
    // so the page itself never scrolls. Small screens keep the normal flow.
    <div className="flex flex-col gap-8 lg:h-[calc(100dvh-5rem)]">
      <PageHeader title="Blog" description="Crea, edita y publica los artículos del blog." />
      <BlogModule initialPosts={posts} />
    </div>
  );
}
