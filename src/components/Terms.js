import React from "react";
import '../Csss/ProfilePage.css';
import FirstFold1 from "./FirstFold1";



// Define Terms and Conditions as constants
const terms1 = {
  title: "Terms and Conditions for Event Organizers",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      content:
        "By accessing and using Satsang Seva as an event organizer you accept and agree to be bound by this Agreement. If you do not agree to these terms you may not use our platform.",
    },
    {
      heading: "2. Event Listing",
      content: [
        {
          subheading: "2.1 Accuracy of Information:",
          text: "You agree to provide accurate, complete, and current information about your event. This includes the event type, date, time, location, any associated costs, and other relevant details.",
        },
        {
          subheading: "2.2 Compliance with Laws:",
          text: "Your event and its content must comply with all applicable laws and regulations. Satsang Seva reserves the right to remove any event listing that violates legal standards or our community guidelines.",
        },
        {
          subheading: "2.3 Non-Commercial Use:",
          text: "Event listings are for non-commercial religious and spiritual events only. Commercial advertising or promotions not related to religious or spiritual activities are prohibited.",
        },
      ],
    },
    {
      heading: "3. Organizer Responsibilities",
      content: [
        {
          subheading: "3.1 Event Management:",
          text: "You are solely responsible for managing all aspects of your event including planning, execution, and participant communication. Satsang Seva acts only as a platform to connect you with potential participants.",
        },
        {
          subheading: "3.2 Participant Safety:",
          text: "You agree to take all necessary measures to ensure the safety and well-being of participants at your event.",
        },
        {
          subheading: "3.3 Conduct:",
          text: "You agree to conduct your event in a manner that respects the dignity and spiritual beliefs of all participants.",
        },
      ],
    },
    {
      heading: "4. Fees and Payments",
      content: [
        {
          subheading: "4.1 Listing Fees:",
          text: "Satsang Seva may charge a fee for listing events on our platform.",
        },
        {
          subheading: "4.2 Payment Processing:",
          text: "If your event is chargeable, you are responsible for managing all payment processing.",
        },
      ],
    },
  ],
};

const terms2 = {
  title: "Terms and Conditions for Participants",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      content:
        "By accessing and using Satsang Seva as a participant, you accept and agree to be bound by this Agreement. If you do not agree to these terms, you may not use our platform.",
    },
    {
      heading: "2. Use of the Platform",
      content: [
        {
          subheading: "2.1 Eligibility:",
          text: "You must be at least 18 years old or have the consent of a parent or guardian to use the platform.",
        },
        {
          subheading: "2.2 Account Information:",
          text: "You agree to provide accurate and up-to-date account information.",
        },
        {
          subheading: "2.3 Platform Use:",
          text: "You agree to use Satsang Seva only for lawful purposes.",
        },
      ],
    },
    {
      heading: "3. Event Participation",
      content: [
        {
          subheading: "3.1 Event Information:",
          text: "Satsang Seva provides information about various events organized by third parties, but does not guarantee its accuracy.",
        },
        {
          subheading: "3.2 Registration and Fees:",
          text: "You are responsible for completing registration and paying any applicable fees for events.",
        },
        {
          subheading: "3.3 Conduct:",
          text: "You agree to conduct yourself in a respectful manner at events.",
        },
      ],
    },
    {
      heading: "4. Safety and Liability",
      content: [
        {
          subheading: "4.1 Personal Responsibility:",
          text: "You participate in events at your own risk.",
        },
        {
          subheading: "4.2 Organizer Responsibility:",
          text: "Event organizers are responsible for ensuring safety at events.",
        },
      ],
    },
  ],
};

// Dynamic Component to Render Terms
const TermsSection = ({ section }) => {
  return (
    <div>
      <h3 className="text-xl">{section.heading}</h3>
      {Array.isArray(section.content) ? (
        section.content.map((item, index) => (
          <div key={index}>
            <strong className="pl-10">{item.subheading}</strong>
            <p className="pl-10">{item.text}</p>
          </div>
        ))
      ) : (
        <p className="pl-10">{section.content}</p>
      )}
    </div>
  );
};

// Main Terms and Conditions Component
const Terms = () => {
  return (
    <div className='relative overflow-hidden' style={{ marginTop: "-5rem" }}>
      <FirstFold1/>
      <div className="mx-20 font-dm-sans">
      <h1 className="w-full flex justify-center text-[#fd5e19] my-10">Terms and Conditions</h1>

      <section>
        <h2 className="text-7xl mt-10">{terms1.title}</h2>
        {terms1.sections.map((section, index) => (
          <TermsSection key={index} section={section} />
        ))}
      </section>

      <section>
        <h2 className="text-7xl my-8">{terms2.title}</h2>
        {terms2.sections.map((section, index) => (
          <TermsSection key={index} section={section} />
        ))}
      </section>
    </div>
    </div>
  );
};

export default Terms;
