'use client';

export default function TermsOfServicePage() {
  return (
    <div>
      <section style={{ padding: '140px 32px 80px', textAlign: 'center', borderBottom: '1px solid #30363d' }}>
        <p style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#f0f6fc', marginBottom: '16px' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: '18px', color: '#8b949e', maxWidth: '520px', margin: '0 auto' }}>
          Syarat dan ketentuan penggunaan layanan LumigiaBOT.
        </p>
      </section>

      <section style={{ padding: '80px 32px 120px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', color: '#8b949e', lineHeight: 1.8, fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>1. Penerimaan Syarat</h2>
            <p>
              Dengan mengundang LumigiaBOT ke server Discord Anda atau menggunakan layanannya, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat-syarat ini, Anda dilarang menggunakan bot ini.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>2. Deskripsi Layanan</h2>
            <p>
              LumigiaBOT menyediakan alat moderasi, otomatisasi (auto-mod), manajemen tiket, dan berbagai utilitas untuk server Discord. Layanan diberikan "sebagaimana adanya" dan pengembang berhak mengubah, menangguhkan, atau menghentikan fitur kapan saja tanpa pemberitahuan sebelumnya.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>3. Penggunaan yang Diizinkan</h2>
            <p style={{ marginBottom: '12px' }}>Anda setuju untuk tidak menggunakan LumigiaBOT untuk:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Melanggar Syarat dan Ketentuan (TOS) atau Panduan Komunitas Discord.</li>
              <li>Mendistribusikan konten ilegal, berbahaya, atau mempromosikan kekerasan.</li>
              <li>Mencoba mengeksploitasi bug, meretas, atau membebani sistem bot (abuse/spam).</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>4. Batasan Tanggung Jawab</h2>
            <p>
              Pengembang LumigiaBOT tidak bertanggung jawab atas kerugian, kerusakan server, atau hilangnya data yang diakibatkan oleh penggunaan bot ini. Keputusan moderasi yang dieksekusi oleh bot berdasarkan konfigurasi Anda sepenuhnya adalah tanggung jawab Anda sebagai pemilik/administrator server.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>5. Ketersediaan Layanan</h2>
            <p>
              Meskipun kami berusaha menjaga bot tetap online 24/7, kami tidak menjamin 100% uptime. Bot mungkin mengalami downtime tak terduga untuk perbaikan (maintenance) atau akibat masalah teknis di luar kendali kami.
            </p>
          </div>

          <div style={{ marginTop: '40px', padding: '24px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px' }}>
              Terakhir diperbarui: <strong>26 Juni 2026</strong>. Jika Anda memiliki pertanyaan, silakan hubungi kami di server support resmi kami.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
