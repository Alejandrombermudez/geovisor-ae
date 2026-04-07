interface Props {
  message?: string
}

export default function LoadingOverlay({ message = 'Cargando...' }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3,7,18,0.7)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          background: '#111827',
          borderRadius: 12,
          padding: '24px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            border: '4px solid #4b5563',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ color: '#d1d5db', fontSize: 14 }}>{message}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
