import Link from "next/link";

const Logo = () => {
  return (
    <Link href='/' className='flex items-center justify-start '>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center'>
          <div className='w-5 h-5 bg-white rounded-sm'></div>
        </div>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>BizSense AI</h1>
          <p className='text-xs text-gray-500'>ERP for Cameroon SMEs</p>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
