// import {
//   FaBook,
//   FaPlay,
//   FaRegCalendarAlt,
// } from "react-icons/fa";

// import heroGirl from "../../assets/hero-girl.png";
// export default function Hero() {
//   return (
//     <section className="relative overflow-hidden bg-[#4fc3c7]">
//       <div className="mx-auto max-w-7xl px-6">
//         <div className="grid min-h-[850px] items-center lg:grid-cols-2">
//           {/* LEFT */}
//           <div className="pt-32 lg:pt-20">
//             <h1 className="max-w-xl text-5xl font-extrabold leading-tight text-white lg:text-6xl">
//               <span className="text-orange-400">
//                 Studying
//               </span>{" "}
//               Online is now much easier
//             </h1>

//             <p className="mt-6 max-w-md text-lg text-white/80">
//               TOTC is an interesting platform that
//               will teach you in more an interactive way
//             </p>

//             <div className="mt-10 flex items-center gap-8">
//               <button className="rounded-full bg-white/30 px-8 py-4 font-medium text-white backdrop-blur">
//                 Join for free
//               </button>

//               <button className="flex items-center gap-4">
//                 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-cyan-500 shadow-lg">
//                   <FaPlay />
//                 </div>

//                 <span className="text-white">
//                   Watch how it works
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="relative flex items-center justify-center">
//             <img
//               src={heroGirl}
//               alt="student"
//               className="relative z-10 w-[500px] lg:w-[600px]"
//             />

//             {/* Card 1 */}
//             <div className="absolute left-0 top-44 z-20 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xl">
//               <div className="rounded-xl bg-blue-100 p-3 text-blue-500">
//                 <FaBook />
//               </div>

//               <div>
//                 <h4 className="font-bold">
//                   250k
//                 </h4>

//                 <p className="text-sm text-slate-500">
//                   Assisted Student
//                 </p>
//               </div>
//             </div>

//             {/* Card 2 */}
//             <div className="absolute right-0 top-72 z-20 rounded-2xl bg-white p-4 shadow-xl">
//               <div className="flex gap-3">
//                 <div className="rounded-xl bg-orange-100 p-3 text-orange-500">
//                   <FaRegCalendarAlt />
//                 </div>

//                 <div>
//                   <h4 className="font-semibold">
//                     Congratulations
//                   </h4>

//                   <p className="text-sm text-slate-500">
//                     Your admission completed
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Card 3 */}
//             <div className="absolute bottom-48 left-4 z-20 rounded-2xl bg-white p-4 shadow-xl">
//               <div className="flex gap-3">
//                 <img
//                   src="https://i.pravatar.cc/50"
//                   alt=""
//                   className="h-12 w-12 rounded-full"
//                 />

//                 <div>
//                   <h4 className="font-semibold">
//                     User Experience Class
//                   </h4>

//                   <p className="text-xs text-slate-500">
//                     Today at 12.00 PM
//                   </p>

//                   <button className="mt-2 rounded-full bg-pink-500 px-4 py-1 text-xs text-white">
//                     Join Now
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Floating Icon */}
//             <div className="absolute right-8 top-40 z-20 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500 text-white shadow-lg">
//               📖
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CURVE */}
//       <div className="absolute bottom-0 left-0 w-full overflow-hidden">
//         <svg
//           viewBox="0 0 1440 220"
//           className="h-[180px] w-full"
//           preserveAspectRatio="none"
//         >
//           <path
//             fill="#ffffff"
//             d="M0,96L80,112C160,128,320,160,480,176C640,192,800,192,960,181.3C1120,171,1280,149,1360,138.7L1440,128L1440,320L0,320Z"
//           />
//         </svg>
//       </div>
//     </section>
//   );
// }

