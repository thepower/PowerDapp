import React, { useRef, useEffect } from 'react';

import { JdenticonConfig, update, configure } from 'jdenticon';

type JdenticonComponentProps = JdenticonConfig & {
  value: string,
  size: string
};

export const Jdenticon: React.FC<JdenticonComponentProps> = ({ value, size, ...config }) => {
  const icon = useRef(null);
  useEffect(() => {
    configure({ padding: 0, ...config });
  }, [config]);
  useEffect(() => {
    if (icon.current) { update(icon.current, value); }
  }, [value]);

  return (
    <svg
      data-jdenticon-value={value}
      height={size}
      ref={icon}
      width={size}
    />
  );
};
