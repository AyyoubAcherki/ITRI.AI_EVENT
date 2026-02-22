import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-accent text-white py-8 mt-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Event Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">AI ITRI NTIC EVENT</h3>
            <p className="text-secondary">
              Join us for three days of innovation, learning, and networking at Tanger, Morocco.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/speakers" className="text-secondary hover:text-white">
                  Speakers
                </Link>
              </li>
              <li>
                <Link to="/program" className="text-secondary hover:text-white">
                  Program
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-secondary hover:text-white">
                  Reserve Seat
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-secondary cursor-pointer hover:text-white transition-colors" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=P5V3%2BCCW,+Tanger', '_blank')}>
              📍 P5V3+CCW, Av. des Forces Armées Royales, Tanger
            </p>
            <p className="text-secondary">Email: info@itri-event.com</p>
            <p className="text-secondary">Phone: +212 XXX XXX XXX</p>
          </div>
        </div>

        <div className="border-t border-light mt-8 pt-6 text-center text-secondary">
          <p>&copy; 2026 AI ITRI NTIC EVENT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
