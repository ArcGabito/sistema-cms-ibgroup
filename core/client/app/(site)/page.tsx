import Hero from "@/app/components/sections/Hero";
import Contact from "@/app/components/sections/Contact";
import AboutUs from "@/app/components/sections/AboutUs";
import WhyChooseUs from "@/app/components/sections/WhyChooseUs";
import Blog from "@/app/components/sections/Blog";
import Services from "@/app/components/sections/Services";
import IBJobCoach from "@/app/components/sections/IBJobCoach";
import Countries from "@/app/components/sections/Countries";
import { getPublishedPosts } from "@/app/lib/posts";
import { getPublicContent } from "@/app/lib/content";

export default async function Home() {
  const [posts, countries] = await Promise.all([getPublishedPosts(), getPublicContent("countries")]);

  return (
    <>
      <Hero />
      <Contact />
      <AboutUs />
      <WhyChooseUs />
      <Blog posts={posts} />
      <Services />
      <IBJobCoach />
      <Countries countries={countries} />
    </>
  );
}
