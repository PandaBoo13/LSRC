// interface StatItem {
//   value: string;
//   label: string;
// }

// const stats: StatItem[] = [
//   {
//     value: '15K+',
//     label: 'Students',
//   },
//   {
//     value: '75%',
//     label: 'Total Success',
//   },
//   {
//     value: '35',
//     label: 'Main Questions',
//   },
//   {
//     value: '26',
//     label: 'Chief Experts',
//   },
//   {
//     value: '16',
//     label: 'Years of Experience',
//   },
// ];

// export default function Statistics() {
//   return (
//     <section className="py-16">
//       <div className="mx-auto max-w-5xl px-4">
//         {/* Heading */}
//         <div className="text-center">
//           <h2 className="text-[42px] font-bold text-slate-900">
//             Our Success
//           </h2>

//           <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
//             We provide innovative educational solutions for
//             students and teachers, helping institutions grow
//             and succeed in the digital era.
//           </p>
//         </div>

//         {/* Statistics */}
//         <div className="mt-12 grid grid-cols-2 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
//           {stats.map((item) => (
//             <div key={item.label} className="text-center">
//               <h3 className="text-[52px] font-light leading-none text-sky-500">
//                 {item.value}
//               </h3>

//               <p className="mt-2 text-sm text-slate-600">
//                 {item.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    value: '10K+',
    label: 'Học viên',
  },
  {
    value: '75%',
    label: 'Tỷ lệ thành công',
  },
  {
    value: '50+',
    label: 'Khóa học',
  },
  {
    value: '20+',
    label: 'Giảng viên',
  },
  {
    value: '23',
    label: 'Năm kinh nghiệm',
  },
];

export default function Statistics() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[42px] font-bold text-slate-900">
            Thành tựu của chúng tôi
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Chúng tôi cung cấp giải pháp giáo dục sáng tạo cho
            học viên và giảng viên, giúp tổ chức phát triển
            và thành công trong kỷ nguyên số.
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-2 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <h3 className="text-[52px] font-light leading-none text-[#49BBBD]">
                {item.value}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}