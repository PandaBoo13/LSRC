// import { Link } from 'react-router-dom';
// import { FaArrowRight, FaUniversity, FaBookOpen, FaMoneyBillWave, FaAward } from 'react-icons/fa';

// const universities = [
//   { name: 'ĐHQG Hà Nội', city: 'Hà Nội', ranking: '#1', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300' },
//   { name: 'ĐHQG TP.HCM', city: 'TP.HCM', ranking: '#2', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=300' },
//   { name: 'Bách Khoa HN', city: 'Hà Nội', ranking: '#3', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300' },
// ];

// const features = [
//   { icon: <FaMoneyBillWave />, title: 'Chi phí thấp', desc: 'Sinh hoạt phí 300-600 USD/tháng' },
//   { icon: <FaUniversity />, title: 'Chất lượng cao', desc: 'Nhiều trường top khu vực' },
//   { icon: <FaBookOpen />, title: 'Đa dạng chương trình', desc: 'Ngôn ngữ, Cử nhân, Thạc sĩ' },
//   { icon: <FaAward />, title: 'Học bổng hấp dẫn', desc: 'Cơ hội nhận học bổng lớn' },
// ];

// export default function StudyInVietnamSection() {
//   return (
//     <section className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <span className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
//             STUDY IN VIETNAM
//           </span>
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">
//             Du Học Tại Việt Nam
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto text-lg">
//             Khám phá nền giáo dục chất lượng tại Việt Nam với chi phí hợp lý
//           </p>
//         </div>

//         {/* Features */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
//           {features.map((feature, index) => (
//             <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
//               <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-xl">
//                 {feature.icon}
//               </div>
//               <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
//               <p className="text-gray-500 text-sm">{feature.desc}</p>
//             </div>
//           ))}
//         </div>

//         {/* Universities */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           {universities.map((uni) => (
//             <div key={uni.name} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
//               <div className="relative h-48">
//                 <img
//                   src={uni.image}
//                   alt={uni.name}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x200/dc2626/ffffff?text=${encodeURIComponent(uni.name)}`;
//                   }}
//                 />
//                 <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
//                   {uni.ranking}
//                 </div>
//               </div>
//               <div className="p-6">
//                 <h3 className="text-lg font-bold text-gray-800">{uni.name}</h3>
//                 <p className="text-red-500 text-sm">{uni.city}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* CTA */}
//         <div className="text-center">
//           <Link
//             to="/study-in-vietnam"
//             className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
//           >
//             Khám phá Du học Việt Nam
//             <FaArrowRight />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }


import { Link } from 'react-router-dom';
import { FaArrowRight, FaUniversity, FaBookOpen, FaMoneyBillWave, FaAward } from 'react-icons/fa';

const universities = [
  { name: 'ĐHQG Hà Nội', city: 'Hà Nội', ranking: '#1', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300' },
  { name: 'ĐHQG TP.HCM', city: 'TP.HCM', ranking: '#2', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=300' },
  { name: 'Bách Khoa HN', city: 'Hà Nội', ranking: '#3', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300' },
];

const features = [
  { icon: <FaMoneyBillWave />, title: 'Chi phí thấp', desc: 'Sinh hoạt phí 300-600 USD/tháng' },
  { icon: <FaUniversity />, title: 'Chất lượng cao', desc: 'Nhiều trường top khu vực' },
  { icon: <FaBookOpen />, title: 'Đa dạng chương trình', desc: 'Ngôn ngữ, Cử nhân, Thạc sĩ' },
  { icon: <FaAward />, title: 'Học bổng hấp dẫn', desc: 'Cơ hội nhận học bổng lớn' },
];

export default function StudyInVietnamSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            DU HỌC TẠI VIỆT NAM
          </span>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Du Học Tại Việt Nam
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Khám phá nền giáo dục chất lượng tại Việt Nam với chi phí hợp lý
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-xl">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Universities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {universities.map((uni) => (
            <div key={uni.name} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img
                  src={uni.image}
                  alt={uni.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x200/dc2626/ffffff?text=${encodeURIComponent(uni.name)}`;
                  }}
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {uni.ranking}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800">{uni.name}</h3>
                <p className="text-red-500 text-sm">{uni.city}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/study-in-vietnam"
            className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Khám phá Du học Việt Nam
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}