import React from "react";
import { MapPin, Phone, Mail, Clock, User } from "lucide-react";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['9P9F+6Q, Al Hofuf', 'Saudi Arabia'],
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+966 54 955 6517', '+966 59 080 7169'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['contact@asmc.com.sa'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Sunday - Thursday: 8:00 AM - 5:00 PM',
        'Saturday: 8:00 AM - 12:00 PM',
      ],
    },
  ];

  const marketingManagers = [
    {
      name: "Mohammad Shahid ullah",
      phone: "+00966 54 9556517"
    },
    {
      name: "Mohammad Tajul Islam", 
      phone: "+966 590807169"
    }
  ];

  return (
    <section id="contact" className="section-container bg-background">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="company-chip mb-6">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground mr-2">04</span>
          <span>Contact Us</span>
        </div>
        
        <h2 className="section-title mb-6">
          Get in Touch
        </h2>
        
        <p className="section-subtitle text-center">
          Ready to start your project? Contact us today to discuss your manpower 
          and equipment needs. We're here to help you succeed.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-muted-foreground">{detail}</p>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Company Registration */}
          <div className="bg-muted/20 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Company Registration</h3>
            <p className="text-muted-foreground">
              <strong>C.R:</strong> 2250007423
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Domains:</strong>  asmc.com.sa
            </p>
          </div>

          {/* Marketing Managers */}
          <div className="bg-accent/5 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-accent" />
              Marketing Managers
            </h3>
            <div className="space-y-4">
              {marketingManagers.map((manager, index) => (
                <div key={index} className="border-l-4 border-accent pl-4">
                  <p className="font-medium text-foreground">{manager.name}</p>
                  <p className="text-muted-foreground">{manager.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-6 text-foreground">Send us a Message</h3>
          
          <form action="https://formspree.io/f/xvgbyvlr" method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Inquiry Description *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-foreground"
                placeholder="Tell us about your project requirements..."
              />
            </div>

            <button
              type="submit"
              className="w-full button-primary"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps */}
      <div className="mt-16">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1400.949261204209!2d49.725014671741974!3d25.367818834845934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e3796e30ed2df5b%3A0xed9272d789aa7540!2s9P9F%2B6Q%2C%20Al%20Hofuf%20Saudi%20Arabia!5e0!3m2!1sen!2sbd!4v1757751748566!5m2!1sen!2sbd" width="100%" height="450" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>
  );
};

export default ContactSection;
