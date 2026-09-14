import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import Reveal from "@/app/components/ui/Reveal";

interface CTASectionProps {
  title: string;
  text: string;
  buttonLabel: string;
  href?: string;
}

export default function CTASection({ title, text, buttonLabel, href = "/contactenos" }: CTASectionProps) {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">{text}</p>
          <div className="mt-8">
            <Button href={href} variant="solid">
              {buttonLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
