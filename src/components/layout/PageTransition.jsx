export default function PageTransition({ children }) {
  return (
    <div className="page-enter">
      <style>{`
        .page-enter {
          animation: page-fade-in 0.25s ease;
        }
        @keyframes page-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  );
}
