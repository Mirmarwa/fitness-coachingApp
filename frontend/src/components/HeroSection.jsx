export default function HeroSection() {
  return (
    <section className="hero" aria-label="Hero">
      <style>{`
        .hero {
          position: relative;
          padding: 72px 20px;
          border-radius: 22px;
          overflow: hidden;
          margin: 28px auto;
          max-width: 1200px;
          background: linear-gradient(180deg, rgba(12,18,25,0.6), rgba(8,12,18,0.55));
          border: 1px solid rgba(16,185,129,0.08);
          box-shadow: 0 30px 80px rgba(2,6,23,0.7), inset 0 1px 0 rgba(255,255,255,0.02);
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 32px;
          align-items: center;
        }

        .hero::before {
          content: "";
          position: absolute;
          left: -10%;
          top: -20%;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle at 30% 30%, rgba(16,185,129,0.08), transparent 40%);
          filter: blur(60px);
          transform: rotate(12deg);
          pointer-events: none;
        }

        .hero::after {
          content: "";
          position: absolute;
          right: -8%;
          bottom: -12%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle at 70% 70%, rgba(6,95,70,0.06), transparent 40%);
          filter: blur(56px);
          pointer-events: none;
        }

        .hero-left { padding: 8px 24px; }
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(28px, 4.4vw, 48px);
          line-height: 1.02;
          margin: 0 0 12px 0;
          color: #ffffff;
          font-weight: 900;
          text-shadow: 0 6px 30px rgba(0,0,0,0.6);
        }

        .hero-sub {
          margin: 0 0 20px 0;
          color: #b6c6cd;
          font-size: 16px;
          max-width: 640px;
          line-height: 1.5;
        }

        .hero-cta { display:flex; gap:12px; flex-wrap:wrap; }
        .btn-primary { padding: 12px 22px; border-radius: 12px; font-weight: 800; border: 0; cursor:pointer;
          background: linear-gradient(135deg,#10b981,#059669); color:#fff; box-shadow: 0 10px 30px rgba(16,185,129,0.18); transition: transform .22s ease, box-shadow .22s ease; }
        .btn-primary:hover { transform: translateY(-4px); box-shadow: 0 18px 44px rgba(16,185,129,0.26); }

        .btn-secondary { padding: 12px 18px; border-radius: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #e6eef0; cursor:pointer; }
        .btn-secondary:hover { background: rgba(255,255,255,0.04); transform: translateY(-3px); }

        .hero-right { padding: 18px; display:flex; align-items:center; justify-content:center; }
        .hero-card {
          width: 100%; max-width: 380px; border-radius: 18px; overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(16,185,129,0.06); box-shadow: 0 18px 48px rgba(2,6,23,0.7);
          transform: translateY(0); transition: transform .45s cubic-bezier(.16,1,.3,1);
        }

        .hero-card:hover { transform: translateY(-8px); }

        .hero-card img { width:100%; height:220px; object-fit:cover; display:block; }
        .hero-card-body { padding: 16px; }
        .hero-card-title { margin:0; font-weight:800; color:#fff; }
        .hero-card-sub { color:#a6b3b9; font-size:14px; margin-top:8px }

        @media (max-width: 920px) { .hero { grid-template-columns: 1fr; padding: 48px 18px; } .hero-right { order:-1; margin-bottom: 18px } }
      `}</style>

      <div className="hero-left">
        <h1 className="hero-title">Transformez votre corps — vivez une expérience fitness premium</h1>
        <p className="hero-sub">Coachings sur mesure, programmes immersifs et suivi pro. Découvrez des entraînements conçus pour durer et des visuels motivants qui rendent chaque session mémorable.</p>

        <div className="hero-cta">
          <button className="btn-primary">Commencer</button>
          <button className="btn-secondary">Voir les coachs</button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card">
          <img src="/public/hero_workout.jpg" alt="Workout" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'}} />
          <div className="hero-card-body">
            <h4 className="hero-card-title">Programme intensif 8 semaines</h4>
            <p className="hero-card-sub">Augmentez votre force et votre endurance avec un plan progressif et des sessions guidées HD.</p>
          </div>
        </div>
      </div>
    </section>
  );
}