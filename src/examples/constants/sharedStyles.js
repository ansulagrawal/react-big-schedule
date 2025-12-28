export const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: 'none',
};

export const popupStyles = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '350px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: `
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2)
  `,
  transform: 'translateX(0) rotateY(0deg) scale(1)',
  opacity: 1,
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  pointerEvents: 'auto',
};

export const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
};

export const titleStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 600,
  color: '#1890ff',
};

export const iconStyles = {
  fontSize: '18px',
};

export const closeBtnStyles = {
  color: '#8c8c8c',
  border: 'none',
  boxShadow: 'none',
};

export const contentStyles = {
  marginBottom: '20px',
};

export const headingStyles = {
  margin: '0 0 8px 0',
  fontSize: '18px',
  fontWeight: 600,
  color: '#262626',
};

export const paragraphStyles = {
  margin: '0 0 16px 0',
  color: '#595959',
  lineHeight: 1.5,
  fontSize: '14px',
};

export const featuresStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

export const featureItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#595959',
  fontSize: '13px',
};

export const featureIconStyles = {
  color: '#1890ff',
  fontSize: '14px',
};

export const progressContainerStyles = {
  height: '3px',
  background: '#f0f0f0',
  borderRadius: '2px',
  margin: '16px 0',
  overflow: 'hidden',
};

export const progressBarStyles = {
  height: '100%',
  background: 'linear-gradient(90deg, #1890ff, #40a9ff)',
  borderRadius: '2px',
  transition: 'width 0.05s linear',
};

export const ctaButtonStyles = {
  borderRadius: '8px',
  height: '36px',
  fontWeight: 500,
  background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
  border: 'none',
  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
};
