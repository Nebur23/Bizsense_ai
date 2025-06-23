import HeaderBox from "./(components)/Header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='size-full flex  flex-col bg-gray-50'>
      <HeaderBox />
      {children}
      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center'>
                  <div className='w-4 h-4 bg-white rounded-sm'></div>
                </div>
                <span className='text-xl font-bold'>BizSense AI</span>
              </div>
              <p className='text-gray-400 mb-4'>
                The leading ERP solution for Cameroonian SMEs. Streamline your
                business operations with our comprehensive platform.
              </p>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Features
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Security
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Training
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    About
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Blog
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Careers
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>
              &copy; 2024 BizSense AI. All rights reserved. Made with ❤️ in
              Cameroon.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
