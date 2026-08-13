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
    <section className="section-pad bg-white">
      <div className="container-enterprise">
        <SectionHeader
          eyebrow="Questions"
          title="Simple answers before you book"
          description="A few quick notes to help you feel comfortable reaching out."
        />
        <div className="mt-14 grid border-t border-enterprise-border sm:grid-cols-2">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="border-b border-enterprise-border py-9 sm:pr-10 sm:even:border-l sm:even:pl-10 sm:even:pr-0"
            >
              <span className="index-numeral">0{index + 1}</span>
              <h3 className="font-display mt-4 text-xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
                {faq.question}
              </h3>
              <p className="mt-3 max-w-md text-[0.9375rem] leading-[1.7] text-enterprise-gray">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
