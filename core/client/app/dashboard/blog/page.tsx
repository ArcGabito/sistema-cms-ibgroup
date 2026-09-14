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
    <div className="flex flex-col gap-8">
      <PageHeader title="Blog" description="Crea, edita y publica los artículos del blog." />
      <BlogModule initialPosts={posts} />
    </div>
  );
}
