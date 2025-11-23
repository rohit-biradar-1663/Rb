
import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-4xl">
          <h2 className="text-base font-semibold leading-7 text-accent">Our Story</h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
            Empowering Riders, One Rescue at a Time
          </p>
          <p className="mt-6 text-xl leading-8 text-gray-700">
            ZippKar was born from a simple, frustrating experience: a late-night bike breakdown on a deserted road. Our founder realized that while two-wheelers are the lifeline of India, reliable, on-demand assistance was virtually non-existent. We set out to change that.
          </p>
          <div className="mt-10 max-w-2xl text-base leading-7 text-gray-700">
            <p>
              We're a technology-driven platform dedicated to providing peace of mind to every rider. By connecting stranded motorcyclists with a network of trusted, local mechanics, we're building a community of support. Our goal is to make roadside assistance fast, transparent, and hassle-free, ensuring that a minor breakdown never ruins your day.
            </p>
            <h3 className="mt-12 text-2xl font-bold tracking-tight text-dark">Our Mission</h3>
            <p className="mt-4">
              To be India's most trusted companion for every two-wheeler rider, offering immediate and professional roadside assistance anytime, anywhere. We aim to leverage technology to create a seamless experience that gets you back on your journey safely and swiftly.
            </p>
            <h3 className="mt-12 text-2xl font-bold tracking-tight text-dark">Our Values</h3>
            <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
              <li className="flex gap-x-3">
                <span className="text-accent font-bold">✓</span>
                <span><strong className="font-semibold text-dark">Speed & Reliability:</strong> We prioritize getting to you fast because we know every minute counts.</span>
              </li>
              <li className="flex gap-x-3">
                <span className="text-accent font-bold">✓</span>
                <span><strong className="font-semibold text-dark">Transparency:</strong> Clear pricing, live tracking, and honest service. No hidden costs.</span>
              </li>
              <li className="flex gap-x-3">
                <span className="text-accent font-bold">✓</span>
                <span><strong className="font-semibold text-dark">Customer First:</strong> Your safety and satisfaction are at the core of every decision we make.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
