export default function AboutCompany() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* IMAGES COLLAGE */}
          <div className="space-y-6">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000"
              alt="Hội thảo giáo dục"
              className="h-64 w-full object-cover rounded-3xl shadow-lg"
            />
            <img
              src="/images/academic-img.png"
              alt="Lễ tốt nghiệp sinh viên"
              className="h-64 w-full object-cover rounded-3xl shadow-lg"
            />
          </div>

          {/* CONTENT */}
          <div>
            <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-600">
              GIỚI THIỆU VỀ TRƯỜNG
            </span>

            <h2 className="mt-6 text-4xl font-bold leading-tight text-slate-800 lg:text-5xl">
              Birmingham Academy
            </h2>

            <div className="mt-6 space-y-4 text-base leading-7 text-slate-500">
              <p>
                Birmingham Academy thành lập từ 23/07/2003, hơn 23 năm kinh nghiệm trong giáo dục và định hướng nghề nghiệp tại Singapore. Trường đạt chứng nhận EduTrust 4 năm, được vinh danh Top 30 tổ chức giáo dục tư thục tốt nhất Singapore và là thành viên Liên đoàn Doanh nghiệp Singapore (SBF) từ năm 2013.
              </p>

              <p>
                Năm 2024, trường hợp tác với Rosedale Global High School triển khai chương trình OSSD (Canada) tại Singapore, mở rộng cơ hội vào các đại học hàng đầu thế giới. Đồng thời duy trì mạng lưới đối tác với Swiss Hotel Management School (Thụy Sĩ) và các đại học uy tín tại Anh như De Montfort, Lincoln Bishop.
              </p>

              <p>
                Với định hướng “Trao quyền cho người học toàn cầu”, Birmingham Academy tập trung đào tạo thực tiễn theo mô hình 6+6 (6 tháng học – 6 tháng thực tập hưởng lương), đồng thời mở rộng chương trình đào tạo và cơ hội nghề nghiệp quốc tế cho sinh viên.
              </p>
            </div>

            {/* KEY HIGHLIGHTS */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="rounded-3xl bg-slate-50 p-6">
                <h3 className="text-3xl font-bold text-cyan-500">23+</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">Năm kinh nghiệm</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <h3 className="text-3xl font-bold text-cyan-500">Top 30</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">GD tư thục Singapore</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}