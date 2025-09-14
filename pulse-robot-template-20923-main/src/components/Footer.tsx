
import React from "react";
import { MapPin, Phone, Mail, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-primary-foreground py-12">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="h-8 w-auto mr-3"
              />
              <div>
                <h3 className="font-bold text-lg">Adel Saad Al-Matar Contracting Est.</h3>
                <p className="text-sm opacity-80">مؤسسة عادل سعد المطر للمقاولات</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4 max-w-md">
              Leading provider of skilled manpower and reliable equipment rental services 
              across Saudi Arabia. Trusted by construction, industrial, and commercial sectors.
            </p>
            <div className="text-sm opacity-80">
              <p><strong>C.R:</strong> 2250007423</p>
              <p><strong>Domains:</strong> asmc.com.sa</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 opacity-80" />
                <div>
                  <p>9P9F+8JH9P9F7H6 Al-Tarf</p>
                  <p>Saudi Arabia</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 opacity-80" />
                <div>
                  <p>+966 54 955 6517</p>
                  <p>+966 59 080 7169</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 opacity-80" />
                <p>contact@asmc.com.sa</p>
              </div>
            </div>
          </div>

          {/* Quick Links & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#about" className="block hover:text-accent transition-colors">About Us</a>
              <a href="#services" className="block hover:text-accent transition-colors">Services</a>
              <a href="#contact" className="block hover:text-accent transition-colors">Contact</a>
              <a href="#blog" className="block hover:text-accent transition-colors">News</a>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Follow Us</h4>
              <a 
                href="#" 
                className="inline-flex items-center text-sm hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm opacity-80">
            <p>&copy; 2024 Adel Saad Al-Matar Contracting Est. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built for professional manpower and equipment solutions</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
