'use client';

import {
  autoUpdate,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Fragment, ReactNode, cloneElement, useState } from 'react';
import type { FC, ReactElement } from 'react';

import styles from './component.module.css';

interface TooltipProps {
  children: ReactElement;
  disabled?: boolean;
  renderContent: () => JSX.Element | ReactElement | ReactNode | string;
}

const Tooltip: FC<TooltipProps> = ({ children, disabled = false, renderContent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), shift({ padding: 32 })],
    onOpenChange: setIsOpen,
    open: isOpen,
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <Fragment>
      {cloneElement(children, { ref: refs.setReference, ...getReferenceProps() })}
      {!disabled && isOpen && (
        <div className={styles.tooltip} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          {renderContent()}
        </div>
      )}
    </Fragment>
  );
};

export default Tooltip;
