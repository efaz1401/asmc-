import React from "react";
import { Building2, Users, Award, Wrench } from "lucide-react";

const AboutSection = () => {
  const stats = [
    { icon: Building2, number: "3+", label: "Years Experience" },
    { icon: Users, number: "500+", label: "Skilled Workers" },
    { icon: Award, number: "60+", label: "Projects Completed" },
    { icon: Wrench, number: "24/7", label: "Equipment Support" },
  ];

  return (
    <section id="about" className="section-container bg-background">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="company-chip mb-6">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground mr-2">02</span>
          <span>About Us</span>
        </div>
        
        <h2 className="section-title mb-6">
          Leading Manpower & Equipment Solutions in Saudi Arabia
        </h2>
        
        <p className="section-subtitle text-center">
          Adel Saad Al-Matar Contracting Est. is a top manpower and equipment supply company in Saudi Arabia. 
          We provide a full range of manpower including engineers, technicians, drivers, plumbers, electricians and more. 
          Our services are trusted by companies across construction, industrial, and commercial sectors.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Company Info */}
      <div className="mt-16 grid md:grid-cols-2 gap-12">
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            To provide exceptional manpower solutions and reliable equipment rental services 
            that exceed our clients' expectations while maintaining the highest standards 
            of safety and professionalism.
          </p>
        </div>
        
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            To be the most trusted partner for construction and industrial companies 
            throughout Saudi Arabia, known for our skilled workforce and reliable equipment solutions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;