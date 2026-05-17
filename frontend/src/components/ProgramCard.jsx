import { Link } from "react-router-dom";
import { BACKEND_BASE_URL } from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

export default function ProgramCard({
  program,
  isPaid = false,
  showPaidBadge = false,
  customPrice,
  variant = "default",
}) {
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${BACKEND_BASE_URL}${image}`;
  };

  const getPriceLabel = () => {
    if (customPrice) return customPrice;

    const price = Number(program?.price ?? program?.amount);
    if (!Number.isFinite(price) || price <= 0) return "Gratuit";
    return `${price.toFixed(2)} DH`;
  };

  const getShortDescription = (description) => {
    if (!description) {
      return "Un programme fitness clair, motivant et facile à suivre.";
    }

    return description.length > 90 ? `${description.slice(0, 90)}...` : description;
  };

  const detailLink = program?.id ? `/program/${program.id}` : "/programmes";

  return (
    <>
      <style>
        {`
          .program-card-premium {
            position: relative;
            height: 380px;
            overflow: hidden;
            border-radius: 24px;
            background: #1f2937;
            border: 1px solid rgba(16, 185, 129, 0.15);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            text-decoration: none;
          }

          .program-card-premium:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: #10b981;
            box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
          }

          .program-card-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            overflow: hidden;
          }

          .program-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          .program-card-premium:hover .program-card-img {
            transform: scale(1.1);
          }

          .program-card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.1) 100%);
            transition: background 300ms ease;
          }

          .program-card-premium:hover .program-card-overlay {
            background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.7) 40%, rgba(15, 23, 42, 0.2) 100%);
          }

          .program-card-badges {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 3;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .premium-card-badge {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 10.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .badge-gold {
            color: #fbbf24;
            border-color: rgba(251, 191, 36, 0.3);
          }

          .badge-paid {
            background: #10b981;
            color: #ffffff;
            border: 0;
          }

          .program-card-info {
            position: relative;
            z-index: 3;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .premium-card-title {
            margin: 0;
            color: #ffffff;
            font-size: 21px;
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          }

          .premium-card-desc {
            margin: 0;
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.5;
            min-height: 42px;
            opacity: 0.85;
            transition: opacity 300ms ease;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .premium-card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 6px;
          }

          .premium-card-price {
            color: #10b981;
            font-size: 20px;
            font-weight: 900;
            font-family: 'Outfit', sans-serif;
          }

          .premium-card-btn-container {
            height: 40px;
            display: flex;
            align-items: center;
          }

          .premium-card-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 13.5px;
            text-decoration: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }

          .program-card-premium:hover .premium-card-btn {
            opacity: 1;
            transform: translateY(0);
          }

          .premium-card-btn:hover {
            filter: brightness(1.1);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          }
        `}
      </style>

      <Link to={detailLink} className="program-card-premium">
        {/* Fullcover Image Background */}
        <div className="program-card-bg">
          <img
            className="program-card-img"
            src={getImageUrl(program?.image)}
            alt={program?.title || "Programme fitness"}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        {/* Immersive Overlay */}
        <div className="program-card-overlay"></div>

        {/* Dynamic Badges */}
        <div className="program-card-badges">
          {showPaidBadge && isPaid ? (
            <span className="premium-card-badge badge-paid">✓ Payé</span>
          ) : (
            <span className="premium-card-badge">Premium</span>
          )}
          {(program?.video_url || program?.video_file) && (
            <span className="premium-card-badge">🎥 Vidéo</span>
          )}
          {Number(program?.price) > 150 && (
            <span className="premium-card-badge badge-gold">🔥 Intensif</span>
          )}
        </div>

        {/* Overlay Content */}
        <div className="program-card-info">
          <h3 className="premium-card-title">{program?.title || "Programme fitness"}</h3>
          <p className="premium-card-desc">
            {getShortDescription(program?.description)}
          </p>

          <div className="premium-card-footer">
            <strong className="premium-card-price">{getPriceLabel()}</strong>
            <div className="premium-card-btn-container">
              <span className="premium-card-btn">Découvrir</span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
