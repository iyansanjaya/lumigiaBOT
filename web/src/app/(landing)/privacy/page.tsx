'use client';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section style={{ padding: '140px 32px 80px', textAlign: 'center', borderBottom: '1px solid #30363d' }}>
        <p style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#f0f6fc', marginBottom: '16px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '18px', color: '#8b949e', maxWidth: '520px', margin: '0 auto' }}>
          Kebijakan privasi dan transparansi pengelolaan data LumigiaBOT.
        </p>
      </section>

      <section style={{ padding: '80px 32px 120px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', color: '#8b949e', lineHeight: 1.8, fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ padding: '24px', background: 'rgba(6,182,212,0.1)', borderLeft: '4px solid #06B6D4', borderRadius: '8px', color: '#f0f6fc' }}>
            <strong>Komitmen Privasi:</strong> Kami hanya menyimpan data yang mutlak diperlukan untuk memastikan fitur bot (seperti moderasi dan auto-mod) dapat beroperasi dengan semestinya. Kami <strong>tidak</strong> menjual data Anda kepada pihak ketiga mana pun.
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>1. Data Apa yang Kami Kumpulkan?</h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>ID Server (Guild ID) & ID Pengguna (User ID):</strong> Digunakan untuk melacak peringatan (warnings), pengaturan server, dan konfigurasi tiket.</li>
              <li><strong>Isi Pesan (sementara):</strong> Bot membaca isi pesan (Message Content) untuk menjalankan filter Auto-Mod dan merespon command. Pesan <strong>tidak</strong> disimpan dalam database kecuali pesan tersebut menjadi bagian dari transkrip Tiket Support yang diminta.</li>
              <li><strong>Informasi Dasar Akun Discord:</strong> Jika Anda masuk (Login) ke Web Dashboard, kami menerima informasi dasar publik dari Discord (seperti Username dan Avatar) melalui OAuth2.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>2. Bagaimana Kami Menggunakan Data?</h2>
            <p style={{ marginBottom: '12px' }}>Data yang dikumpulkan digunakan secara eksklusif untuk:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Menyediakan fungsi utama bot (membuat log, mengeksekusi sanksi moderasi).</li>
              <li>Menyimpan preferensi dan konfigurasi khusus server Anda (contoh: prefix, channel log).</li>
              <li>Mengelola sesi otentikasi (login) pada Web Dashboard.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>3. Retensi dan Penghapusan Data</h2>
            <p>
              Kami menyimpan konfigurasi server, riwayat moderasi, dan data operasional fitur selama bot berada di server Anda.
              Jika Anda mengeluarkan (kick) bot dari server Anda, data operasional aktif yang terkait dengan server tersebut dan folder transcript terkait akan dibersihkan dari database aplikasi.
              Backup database yang sudah dibuat secara terpisah mengikuti kebijakan penyimpanan operasional. Anda juga dapat meminta penghapusan seluruh data (Right to be Forgotten) dengan menghubungi tim developer.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>4. Keamanan Data</h2>
            <p>
              Kami menerapkan standar keamanan industri untuk melindungi database kami dari akses tidak sah. 
              Token otentikasi dilindungi oleh secret aplikasi dan tidak pernah dipaparkan kepada publik.
            </p>
          </div>

          <div style={{ marginTop: '40px', padding: '24px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px' }}>
              Terakhir diperbarui: <strong>2 Juli 2026</strong>. Membutuhkan penjelasan lebih lanjut? Kunjungi server support kami atau buka tiket bantuan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
