import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Articles from "@/components/Articles";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Articles />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
