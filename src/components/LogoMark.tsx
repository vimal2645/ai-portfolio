export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <img 
      src="/logo.png" 
      alt="VPIXCEL Logo" 
      style={{ width: size, height: size, objectFit: 'contain' }} 
      data-logo 
    />
  );
}
