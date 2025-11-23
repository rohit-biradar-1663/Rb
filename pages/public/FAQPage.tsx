
import React from 'react';
import AccordionItem from '../../components/ui/Accordion';

const faqData = [
  {
    question: 'What is ZippKar?',
    answer: 'ZippKar is an on-demand roadside assistance platform for two-wheelers in India. We connect riders with nearby, verified mechanics for quick and reliable help, anytime, anywhere.',
  },
  {
    question: 'What services do you offer?',
    answer: 'We offer a wide range of services, including emergency assistance (puncture repair, fuel delivery, battery jumpstart), doorstep services (general servicing, oil change), and advanced garage repairs (engine work, diagnostics).',
  },
  {
    question: 'How quickly can a mechanic reach me?',
    answer: 'Our goal is to get help to you as fast as possible. In most urban areas, we aim to have a mechanic reach your location within 20-30 minutes of your booking confirmation.',
  },
  {
    question: 'Are your mechanics verified?',
    answer: 'Absolutely. All our garage partners and their mechanics go through a verification process. We check their skills, experience, and background to ensure you receive professional and trustworthy service.',
  },
  {
    question: 'How does the pricing work?',
    answer: 'Our pricing is transparent and upfront. You will see the estimated cost for a service before you book. The final price may vary slightly based on the actual issue, but there are no hidden charges.',
  },
  {
    question: 'What areas do you operate in?',
    answer: 'We are currently expanding our services across major cities in India. Please check the app or our website to see if we are available in your specific location.',
  },
  {
    question: 'How do I pay for the service?',
    answer: 'Payments can be made securely online through our app using various methods like UPI, credit/debit cards, and net banking once the service is completed.',
  },
];

const FAQPage = () => {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-base font-semibold leading-7 text-accent">Help Center</h2>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
              Frequently Asked Questions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Can't find the answer you're looking for? Feel free to{' '}
              <a href="/contact" className="font-semibold text-accent hover:text-blue-700">
                contact our support team
              </a>
              .
            </p>
          </div>
          <div className="mt-16 space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} title={faq.question}>
                {faq.answer}
              </AccordionItem>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
