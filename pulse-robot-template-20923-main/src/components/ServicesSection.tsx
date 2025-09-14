import React from "react";
import { Users, Wrench, Hammer, Package, ClipboardList } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Users,
      title: "Manpower Supply",
      description: "Skilled engineers, technicians, drivers, plumbers, electricians, and specialized workers for all industries.",
      features: ["Engineers & Technicians", "Construction Workers", "Drivers & Operators", "Maintenance Staff"]
    },
    {
      icon: Wrench,
      title: "Equipment Rental",
      description: "Complete range of construction and industrial equipment available for short-term and long-term rental.",
      features: ["Heavy Machinery", "Construction Tools", "Safety Equipment", "24/7 Support"]
    },
    {
      icon: Hammer,
      title: "Construction",
      description: "Full construction services from planning to completion with experienced teams and quality materials.",
      features: ["Project Management", "Civil Construction", "MEP Services", "Quality Assurance"]
    },
    {
      icon: Package,
      title: "Material Supply",
      description: "High-quality construction materials and supplies sourced from trusted manufacturers.",
      features: ["Building Materials", "Safety Supplies", "Tools & Hardware", "Bulk Orders"]
    },
    {
      icon: ClipboardList,
      title: "Contracting Services",
      description: "Comprehensive contracting solutions tailored to meet specific project requirements and timelines.",
      features: ["Project Planning", "Resource Management", "Quality Control", "Timely Delivery"]
    }
  ];

  return (
    <section id="services" className="section-container bg-muted/30">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="company-chip mb-6">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground mr-2">03</span>
          <span>Our Services</span>
        </div>
        
        <h2 className="section-title mb-6">
          Comprehensive Solutions for Your Business
        </h2>
        
        <p className="section-subtitle text-center">
          From skilled manpower to reliable equipment rental, we provide everything 
          you need to keep your projects running smoothly and efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div key={index} className="feature-card glass-card hover:shadow-lg">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-sm text-muted-foreground flex items-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;