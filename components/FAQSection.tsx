import { SectionHeader } from "@/components/SectionHeader";

const faqs = [
  {
    question: "What areas do you serve?",
    answer:
      "Polley Enterprise is based in Houston and supports local and regional service needs across Texas.",
  },
  {
    question: "Should I call or submit the quote form?",
    answer:
      "Either works. Calling is best for urgent needs. The quote form is best when you want to send details and get a follow-up.",
  },
  {
    question: "Can I request more than one service?",
    answer:
      "Yes. Choose the closest service on the form and list everything you need in the details box.",
  },
  {
    question: "How fast will someone respond?",
    answer:
      "Most requests receive a prompt follow-up. For the fastest response, call the number listed on the site.",
  },
];

export function FAQSection() {
  return (
    <section className="section-spacing">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Questions"
          title="Simple answers before you book"
          description="A few quick notes to help customers feel comfortable reaching out."
          align="center"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="card-glow rounded-3xl border border-enterprise-border bg-white p-6 shadow-[0_12px_30px_rgba(6,16,36,0.07)]"
            >
              <h3 className="text-xl font-bold text-enterprise-charcoal">{faq.question}</h3>
              <p className="mt-3 text-base leading-relaxed text-enterprise-gray">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
