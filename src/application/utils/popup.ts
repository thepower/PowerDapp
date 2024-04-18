interface PopupOptions {
  url: string;
  title: string;
  width: number;
  height: number;
}

export const openPopupCenter = ({
  url, title, width, height,
}: PopupOptions) => {
  // Determine dual-screen support
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  // Determine window dimensions
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || window.screen.width;
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || window.screen.height;

  // Calculate system zoom
  const systemZoom = screenWidth / window.screen.availWidth;

  // Calculate window position
  const left = (screenWidth - width) / 2 / systemZoom + dualScreenLeft;
  const top = (screenHeight - height) / 2 / systemZoom + dualScreenTop;

  // Open the popup window
  const popupFeatures = `
    scrollbars=yes,
    width=${width / systemZoom},
    height=${height / systemZoom},
    top=${top},
    left=${left}
  `;
  const newWindow = window.open(url, title, popupFeatures);

  if (newWindow) {
    newWindow.focus?.();
  }

  return newWindow;
};
