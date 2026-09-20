// import { Link } from 'react-router-dom';
// import { FaArrowRight, FaGlobeAmericas, FaGraduationCap, FaPassport, FaStar } from 'react-icons/fa';

// const countries = [
//   { name: 'Singapore', flag: '🇸🇬', programs: 156, image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=300' },
//   { name: 'Australia', flag: '🇦🇺', programs: 234, image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=300' },
//   { name: 'UK', flag: '🇬🇧', programs: 189, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300' },
//   { name: 'USA', flag: '🇺🇸', programs: 312, image: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=300' },
//   { name: 'Canada', flag: '🇨🇦', programs: 178, image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=300' },
// ];

// const stats = [
//   { icon: <FaGlobeAmericas />, number: '50+', label: 'Quốc gia' },
//   { icon: <FaGraduationCap />, number: '200+', label: 'Trường ĐH' },
//   { icon: <FaPassport />, number: '95%', label: 'Tỷ lệ visa' },
//   { icon: <FaStar />, number: '5000+', label: 'Học viên' },
// ];

// export default function StudyAbroadSection() {
//   return (
//     <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
//             STUDY ABROAD
//           </span>
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">
//             Du Học Quốc Tế
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto text-lg">
//             Khám phá cơ hội giáo dục toàn cầu từ hơn 200 trường đại học hàng đầu thế giới
//           </p>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
//           {stats.map((stat, index) => (
//             <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
//               <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-xl">
//                 {stat.icon}
//               </div>
//               <div className="text-3xl font-bold text-gray-800">{stat.number}</div>
//               <div className="text-gray-500 mt-1">{stat.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Countries Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
//           {countries.map((country) => (
//             <Link
//               key={country.name}
//               to={`/study-abroad/${country.name.toLowerCase() === 'uk' ? 'uk' : country.name.toLowerCase() === 'usa' ? 'usa' : country.name.toLowerCase()}`}
//               className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
//             >
//               <img
//                 src={country.image}
//                 alt={country.name}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/3b82f6/ffffff?text=${country.name}`;
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
//               <div className="absolute bottom-0 left-0 right-0 p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <span className="text-2xl mr-2">{country.flag}</span>
//                     <span className="text-white font-bold">{country.name}</span>
//                   </div>
//                   <span className="text-white/80 text-sm">{country.programs} programs</span>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* CTA */}
//         <div className="text-center">
//           <Link
//             to="/study-abroad"
//             className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
//           >
//             Khám phá Du học quốc tế
//             <FaArrowRight />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }


import { Link } from 'react-router-dom';
import { FaArrowRight, FaGlobeAmericas, FaGraduationCap, FaPassport, FaStar } from 'react-icons/fa';

const countries = [
  { name: 'Singapore', flag: '🇸🇬', programs: 156, image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=300' },
  { name: 'Australia', flag: '🇦🇺', programs: 234, image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=300' },
  { name: 'UK', flag: '🇬🇧', programs: 189, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300' },
  { name: 'USA', flag: '🇺🇸', programs: 312, image: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=300' },
  { name: 'Canada', flag: '🇨🇦', programs: 178, image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=300' },
];

const stats = [
  { icon: <FaGlobeAmericas />, number: '50+', label: 'Quốc gia' },
  { icon: <FaGraduationCap />, number: '200+', label: 'Trường ĐH' },
  { icon: <FaPassport />, number: '95%', label: 'Tỷ lệ visa' },
  { icon: <FaStar />, number: '5000+', label: 'Học viên' },
];

export default function StudyAbroadSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            DU HỌC QUỐC TẾ
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Du Học Quốc Tế
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Khám phá cơ hội giáo dục toàn cầu. Đặc biệt chương trình Birmingham Academy
            Singapore với thực tập có lương 6+6.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-xl">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800">{stat.number}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {countries.map((country) => (
            <Link
              key={country.name}
              to={`/study-abroad/${country.name.toLowerCase() === 'uk' ? 'uk' : country.name.toLowerCase() === 'usa' ? 'usa' : country.name.toLowerCase()}`}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img
                src={country.image}
                alt={country.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/3b82f6/ffffff?text=${country.name}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl mr-2">{country.flag}</span>
                    <span className="text-white font-bold">{country.name}</span>
                  </div>
                  <span className="text-white/80 text-sm">{country.programs} chương trình</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/study-abroad"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Khám phá Du học quốc tế
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}