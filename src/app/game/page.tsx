export default function GamePage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/game.html"
        title="Game"
        style={{ border: 'none', width: '100%', height: '100%' }}
      />
    </div>
  );
}
